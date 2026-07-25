from __future__ import annotations

import json
import os
import shlex
import shutil
import subprocess
from pathlib import Path
from typing import Any

from .core import detect_format
from .report import baseline_report, merge_adapter_results, validate_report

TOOLS = {"bcftools":"BCFtools", "plink2":"PLINK 2", "haplogrep3":"HaploGrep 3", "LineageTracker":"Y-LineageTracker", "Rscript":"R / ADMIXTOOLS 2"}


def tool_inventory() -> dict[str, Any]:
    return {label:{"available":bool(shutil.which(command)),"command":command} for command,label in TOOLS.items()}


def run(command: list[str], cwd: Path, timeout: int = 600) -> str:
    result = subprocess.run(command, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=timeout, check=True, env={**os.environ,"LC_ALL":"C"})
    return result.stdout


def sample_text(path: Path, maximum: int = 2 * 1024 * 1024) -> str:
    if path.name.lower().endswith((".bed",".pgen",".vcf.gz")): return ""
    return path.read_bytes()[:maximum].decode("utf-8", errors="replace")


def inspect_inputs(files: list[Path]) -> dict[str, Any]:
    formats=[]; sampled=0; mt=False; y=False
    for path in files:
        sample=sample_text(path); upper=f"\n{sample.upper()}\n"
        formats.append(detect_format(path.name,sample)); sampled+=sum(1 for line in sample.splitlines() if line and not line.startswith("#"))
        mt=mt or any(token in upper for token in ("\nMT\t","\nM\t","\nCHRMT\t","\nCHRM\t")); y=y or any(token in upper for token in ("\nY\t","\nCHRY\t"))
    return {"fileCount":len(files),"formats":sorted(set(formats)),"sampledLines":sampled,"mitochondrialMarkersObservedInSample":mt,"yMarkersObservedInSample":y,"warning":"Marker observations are sampled unless command-line QC reports otherwise."}


def open_source_qc(files: list[Path], workdir: Path) -> dict[str, Any]:
    qc=inspect_inputs(files); qc["steps"]=[]
    vcf=next((path for path in files if path.name.lower().endswith((".vcf",".vcf.gz"))),None)
    if vcf and shutil.which("bcftools"):
        (workdir/"bcftools.stats.txt").write_text(run(["bcftools","stats","--threads","2",str(vcf)],workdir),encoding="utf-8")
        qc["steps"].append({"tool":"BCFtools","status":"completed"})
    elif vcf: qc["steps"].append({"tool":"BCFtools","status":"unavailable"})
    if vcf and shutil.which("plink2"):
        prefix=workdir/"sample"
        run(["plink2","--vcf",str(vcf),"--double-id","--allow-extra-chr","--make-pgen","--out",str(prefix)],workdir)
        run(["plink2","--pfile",str(prefix),"--missing","--freq","--allow-extra-chr","--out",str(workdir/"sample-qc")],workdir)
        qc["steps"].append({"tool":"PLINK 2","status":"completed"})
    elif vcf: qc["steps"].append({"tool":"PLINK 2","status":"unavailable"})
    return qc


def run_template(template: str, input_path: Path, output_path: Path, workdir: Path) -> dict[str, Any]:
    command=template.format(input=shlex.quote(str(input_path)),output=shlex.quote(str(output_path)),workdir=shlex.quote(str(workdir)))
    subprocess.run(command,cwd=workdir,shell=True,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=1800,check=True,env={**os.environ,"LC_ALL":"C"})
    if not output_path.exists(): raise RuntimeError("Configured analysis adapter did not produce JSON output")
    return json.loads(output_path.read_text(encoding="utf-8"))


def run_analysis(profile: dict[str, Any], files: list[Path], workdir: Path) -> dict[str, Any]:
    workdir.mkdir(parents=True,exist_ok=True)
    report=baseline_report(profile,open_source_qc(files,workdir),tool_inventory())
    primary=next((path for path in files if path.name.lower().endswith((".vcf",".vcf.gz",".txt",".csv"))),files[0])
    adapters: dict[str,Any]={}
    reference=os.getenv("ANCESTRY_REFERENCE_PIPELINE_COMMAND","").strip()
    if reference:
        model=run_template(reference,primary,workdir/"reference-report.json",workdir)
        adapters.update(model)
        adapters["personalisedGeneticInference"]=bool(model.get("personalisedGeneticInference",True))
    for key,variable in (("maternal","HAPLOGREP_COMMAND"),("paternal","Y_LINEAGE_COMMAND"),("ancient","ADMIXTOOLS_COMMAND")):
        template=os.getenv(variable,"").strip()
        if template: adapters[key]=run_template(template,primary,workdir/f"{key}.json",workdir)
    report=merge_adapter_results(report,adapters)
    report["genome"]["rawFilesDeletedAfterAnalysis"]=True
    validate_report(report)
    return report
