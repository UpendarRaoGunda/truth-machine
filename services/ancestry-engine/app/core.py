from __future__ import annotations

import base64
import hashlib
import hmac
import json
import re
import time
from pathlib import Path
from typing import Any, Iterable

ALLOWED_SUFFIXES = (".vcf.gz", ".vcf", ".txt", ".csv", ".bed", ".bim", ".fam", ".pgen", ".pvar", ".psam")
PROHIBITED_PHRASES = ("caste prediction", "religion prediction", "racial purity", "race score", "intelligence score", "criminality", "superior population")


def _decode_base64url(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def verify_upload_token(secret: str, token: str, now: int | None = None) -> dict[str, Any]:
    if not secret or not token or "." not in token:
        raise ValueError("Missing upload authorisation")
    encoded, supplied_signature = token.split(".", 1)
    expected = hmac.new(secret.encode(), encoded.encode("ascii"), hashlib.sha256).digest()
    try:
        supplied = _decode_base64url(supplied_signature)
    except Exception as exc:
        raise ValueError("Malformed upload authorisation") from exc
    if not hmac.compare_digest(expected, supplied):
        raise ValueError("Invalid upload authorisation")
    try:
        payload = json.loads(_decode_base64url(encoded))
    except Exception as exc:
        raise ValueError("Malformed upload authorisation") from exc
    timestamp = int(time.time() if now is None else now)
    if payload.get("aud") != "truth-machine-ancestry-upload":
        raise ValueError("Invalid upload audience")
    if int(payload.get("exp", 0)) < timestamp:
        raise ValueError("Upload authorisation expired")
    if int(payload.get("iat", timestamp + 1)) > timestamp + 30:
        raise ValueError("Upload authorisation is not yet valid")
    return payload


def safe_filename(value: str) -> str:
    name = Path(str(value or "")).name
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._")
    if not cleaned or len(cleaned) > 180:
        raise ValueError("Invalid filename")
    if not any(cleaned.lower().endswith(suffix) for suffix in ALLOWED_SUFFIXES):
        raise ValueError("Unsupported genome file")
    return cleaned


def detect_format(name: str, head: str = "") -> str:
    lower = name.lower()
    if lower.endswith(".vcf.gz"): return "vcf-gzip"
    if lower.endswith(".vcf") or "##fileformat=VCF" in head: return "vcf"
    mapping = {".bed":"plink-bed", ".bim":"plink-bim", ".fam":"plink-fam", ".pgen":"plink-pgen", ".pvar":"plink-pvar", ".psam":"plink-psam"}
    for suffix, file_format in mapping.items():
        if lower.endswith(suffix): return file_format
    looks_consumer = bool(re.search(r"(^|\n)#.*(23andme|ancestrydna|myheritage)", head, re.I) or re.search(r"(^|\n)rs\d+\s+[0-9XYMT]+\s+\d+\s+[ACGTDI-]+", head, re.M))
    if lower.endswith((".txt", ".csv")) and looks_consumer: return "consumer-genotype"
    if lower.endswith((".txt", ".csv")): return "text-unknown"
    return "unsupported"


def validate_bundle(items: Iterable[dict[str, Any]], maximum_bytes: int) -> list[dict[str, Any]]:
    files = list(items)
    if not 1 <= len(files) <= 8: raise ValueError("Upload between one and eight files")
    total = 0; formats: set[str] = set(); normalised = []
    for item in files:
        name = safe_filename(str(item.get("name", "")))
        size = int(item.get("size", 0)); file_format = str(item.get("format") or detect_format(name))
        if size <= 0: raise ValueError(f"{name} is empty")
        total += size; formats.add(file_format); normalised.append({"name":name,"size":size,"format":file_format})
    if total > maximum_bytes: raise ValueError("Genome bundle exceeds the authorised size")
    has_primary = bool(formats.intersection({"vcf","vcf-gzip","consumer-genotype"}))
    has_bed = {"plink-bed","plink-bim","plink-fam"}.issubset(formats)
    has_pgen = {"plink-pgen","plink-pvar","plink-psam"}.issubset(formats)
    if not (has_primary or has_bed or has_pgen): raise ValueError("Upload a VCF/raw genotype file or a complete PLINK bundle")
    return normalised


def hash_access_key(value: str) -> str: return hashlib.sha256(value.encode()).hexdigest()
def access_key_matches(value: str, expected_hash: str) -> bool: return hmac.compare_digest(hash_access_key(value), expected_hash)
def report_contains_prohibited_inference(report: dict[str, Any]) -> bool:
    content = json.dumps(report, ensure_ascii=False).lower()
    return any(phrase in content for phrase in PROHIBITED_PHRASES)
