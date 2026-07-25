from __future__ import annotations

import json
import os
import secrets
import shutil
import time
import uuid
from pathlib import Path
from typing import Annotated, Any

from fastapi import BackgroundTasks, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .core import access_key_matches, detect_format, hash_access_key, safe_filename, validate_bundle, verify_upload_token
from .crypto_store import EncryptedStore
from .pipeline import run_analysis, tool_inventory

STORAGE=Path(os.getenv("ANCESTRY_STORAGE_ROOT","/data/ancestry")); WORK=Path(os.getenv("ANCESTRY_WORK_ROOT","/dev/shm/truth-machine-ancestry"))
MAX_BYTES=int(os.getenv("ANCESTRY_MAX_UPLOAD_BYTES",str(250*1024*1024))); TTL_HOURS=int(os.getenv("ANCESTRY_RESULT_TTL_HOURS","24"))
UPLOAD_SECRET=os.getenv("ANCESTRY_UPLOAD_SECRET",""); STORE=EncryptedStore(os.getenv("GENOME_ENCRYPTION_KEY",""))
STORAGE.mkdir(parents=True,exist_ok=True); WORK.mkdir(parents=True,exist_ok=True)

app=FastAPI(title="Truth Machine Ancestry Engine",version="1.0.0",docs_url=None,redoc_url=None)
origins=[item.strip() for item in os.getenv("ANCESTRY_ALLOWED_ORIGINS","https://truth-machine-coral.vercel.app").split(",") if item.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_methods=["GET","POST","DELETE"],allow_headers=["Authorization","Content-Type","X-Job-Key"],allow_credentials=False)


def job_dir(job_id: str) -> Path:
    try: parsed=uuid.UUID(job_id)
    except ValueError as exc: raise HTTPException(404,"Unknown analysis") from exc
    return STORAGE/str(parsed)


def read_json(path: Path, default=None):
    try: return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError: return default


def write_json(path: Path, value: Any):
    path.write_text(json.dumps(value,ensure_ascii=False,separators=(",",":")),encoding="utf-8")


def authorise(directory: Path, supplied: str | None):
    meta=read_json(directory/"meta.json")
    if not meta or not supplied or not access_key_matches(supplied,meta.get("accessKeyHash","")): raise HTTPException(404,"Unknown analysis")
    if meta.get("expiresAt",0)<time.time():
        shutil.rmtree(directory,ignore_errors=True); raise HTTPException(410,"Analysis expired")
    return meta


def sanitize_profile(profile: dict[str,Any]) -> dict[str,Any]:
    year=profile.get("birthYear")
    try: year=int(year) if year else None
    except (TypeError,ValueError): year=None
    current=time.gmtime().tm_year
    if year and not 1900<=year<=current: year=None
    places=profile.get("familyPlaces") if isinstance(profile.get("familyPlaces"),list) else []
    return {"displayName":str(profile.get("displayName") or "").strip()[:80],"birthYear":year,"birthplace":str(profile.get("birthplace") or "").strip()[:160],"familyPlaces":[str(p).strip()[:160] for p in places if str(p).strip()][:8]}


def audit(event: str, job_id: str, detail: dict[str,Any] | None=None):
    entry={"time":time.time(),"event":event,"jobId":job_id,"detail":detail or {}}
    with (STORAGE/"audit.jsonl").open("a",encoding="utf-8") as stream: stream.write(json.dumps(entry,separators=(",",":"))+"\n")


def cleanup_expired():
    now=time.time()
    for item in STORAGE.iterdir():
        if not item.is_dir(): continue
        meta=read_json(item/"meta.json",{})
        if meta.get("expiresAt",0)<now: shutil.rmtree(item,ignore_errors=True)


def process_job(job_id: str):
    directory=job_dir(job_id); workspace=WORK/job_id
    try:
        meta=read_json(directory/"meta.json",{}); meta.update(status="processing",message="Running quality control and configured population models") ; write_json(directory/"meta.json",meta)
        workspace.mkdir(parents=True,exist_ok=True)
        manifest=json.loads(STORE.decrypt_bytes(directory/"manifest.enc")); profile=json.loads(STORE.decrypt_bytes(directory/"profile.enc"))
        paths=[]
        for item in manifest:
            destination=workspace/item["name"]; STORE.decrypt_file(directory/item["encryptedName"],destination); paths.append(destination)
        report=run_analysis(profile,paths,workspace)
        STORE.encrypt_bytes(json.dumps(report,ensure_ascii=False).encode(),directory/"report.enc")
        for item in manifest: (directory/item["encryptedName"]).unlink(missing_ok=True)
        meta.update(status="complete",message="Analysis complete; raw genome deleted",completedAt=time.time()); write_json(directory/"meta.json",meta); audit("complete",job_id,{"formats":[item["format"] for item in manifest]})
    except Exception as exc:
        meta=read_json(directory/"meta.json",{}); meta.update(status="failed",message="Analysis failed safely",error=str(exc)[:500]); write_json(directory/"meta.json",meta); audit("failed",job_id,{"error":type(exc).__name__})
        for encrypted in directory.glob("genome-*.enc"): encrypted.unlink(missing_ok=True)
    finally: shutil.rmtree(workspace,ignore_errors=True)


@app.get("/health")
def health():
    cleanup_expired(); return {"status":"ok","tools":tool_inventory(),"resultTtlHours":TTL_HOURS}


@app.get("/v1/capabilities")
def capabilities():
    return {"encryptedAtRest":True,"rawDeletedAfterAnalysis":True,"maxUploadBytes":MAX_BYTES,"maxFiles":8,"tools":tool_inventory(),"referencePipelineConfigured":bool(os.getenv("ANCESTRY_REFERENCE_PIPELINE_COMMAND"))}


@app.post("/v1/jobs",status_code=202)
async def create_job(background: BackgroundTasks, authorization: Annotated[str | None,Header()]=None, profile: Annotated[str,Form()]="{}", consent: Annotated[str,Form()]="{}", files: list[UploadFile]=File(...)):
    cleanup_expired()
    if not authorization or not authorization.startswith("Bearer "): raise HTTPException(401,"Missing upload authorisation")
    try: token=verify_upload_token(UPLOAD_SECRET,authorization[7:])
    except ValueError as exc: raise HTTPException(401,str(exc)) from exc
    if len(files)!=int(token.get("maxFiles",0)): raise HTTPException(400,"File count does not match upload authorisation")
    try: profile_data=sanitize_profile(json.loads(profile)); consent_data=json.loads(consent)
    except json.JSONDecodeError as exc: raise HTTPException(400,"Invalid profile or consent") from exc
    current=time.gmtime().tm_year; is_minor=bool(profile_data.get("birthYear") and profile_data["birthYear"]>current-18)
    required=consent_data.get("permission") and consent_data.get("probabilistic") and consent_data.get("processing") and (not is_minor or consent_data.get("guardian"))
    if not required: raise HTTPException(400,"All applicable consent statements are required")
    authorised=min(MAX_BYTES,int(token.get("maxBytes",0))); previews=[]
    for upload in files:
        name=safe_filename(upload.filename or ""); size=int(upload.size or 0); previews.append({"name":name,"size":size,"format":detect_format(name)})
    try: checked=validate_bundle(previews,authorised)
    except ValueError as exc: raise HTTPException(400,str(exc)) from exc
    job_id=str(uuid.uuid4()); access_key=secrets.token_urlsafe(32); directory=job_dir(job_id); directory.mkdir(mode=0o700)
    manifest=[]; total=0
    try:
        for index,(upload,item) in enumerate(zip(files,checked,strict=True)):
            encrypted_name=f"genome-{index}.enc"; written=await STORE.encrypt_upload(upload,directory/encrypted_name,authorised-total); total+=written
            if written!=item["size"]: raise ValueError("Uploaded size differs from authorised size")
            manifest.append({**item,"encryptedName":encrypted_name})
        if total!=int(token.get("maxBytes",0)): raise ValueError("Upload bundle size differs from authorisation")
        STORE.encrypt_bytes(json.dumps(profile_data).encode(),directory/"profile.enc"); STORE.encrypt_bytes(json.dumps(manifest).encode(),directory/"manifest.enc")
        write_json(directory/"meta.json",{"status":"queued","message":"Encrypted upload accepted","accessKeyHash":hash_access_key(access_key),"createdAt":time.time(),"expiresAt":time.time()+TTL_HOURS*3600})
    except Exception:
        shutil.rmtree(directory,ignore_errors=True); raise
    audit("created",job_id,{"fileCount":len(manifest),"bytes":total}); background.add_task(process_job,job_id)
    return {"jobId":job_id,"accessKey":access_key,"status":"queued","expiresInHours":TTL_HOURS}


@app.get("/v1/jobs/{job_id}")
def get_job(job_id: str, x_job_key: Annotated[str | None,Header()]=None):
    directory=job_dir(job_id); meta=authorise(directory,x_job_key)
    response={key:meta.get(key) for key in ("status","message","error","createdAt","completedAt","expiresAt") if meta.get(key) is not None}
    if meta.get("status")=="complete" and (directory/"report.enc").exists(): response["report"]=json.loads(STORE.decrypt_bytes(directory/"report.enc"))
    return response


@app.delete("/v1/jobs/{job_id}")
def delete_job(job_id: str, x_job_key: Annotated[str | None,Header()]=None):
    directory=job_dir(job_id); authorise(directory,x_job_key); shutil.rmtree(directory,ignore_errors=True); shutil.rmtree(WORK/job_id,ignore_errors=True); audit("deleted",job_id); return {"deleted":True}
