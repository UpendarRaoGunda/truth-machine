from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .core import report_contains_prohibited_inference

JOURNEY = [
    {"id":"africa-70000","yearsAgo":70000,"label":"Deep African ancestry","region":"Africa","confidence":"Very high","scope":"Shared human history","description":"All living humans ultimately trace deep ancestry to populations in Africa. This is not a personalised location claim.","evidence":"Population genetics, fossils, archaeology and ancient DNA","x":48,"y":58},
    {"id":"corridors-65000","yearsAgo":65000,"label":"Northeast African and Arabian corridors","region":"Northeast Africa / Arabia","confidence":"High for broad dispersal; route details debated","scope":"Shared human history","description":"Some populations ancestral to most present-day non-Africans expanded through one or more corridors linking northeast Africa and Arabia.","evidence":"Genomic divergence estimates and archaeology","x":55,"y":49},
    {"id":"hub-55000","yearsAgo":55000,"label":"Southwest Asian population hub","region":"Southwest Asia","confidence":"Moderate","scope":"Population-history model","description":"Southwest Asia was likely an important staging region before later expansions across Eurasia. Boundaries and dates remain uncertain.","evidence":"Ancient genomes and demographic modelling","x":61,"y":43},
    {"id":"eurasia-50000","yearsAgo":50000,"label":"Eurasian branching and admixture","region":"Eurasia","confidence":"High for broad branching","scope":"Shared human history","description":"Ancestral populations diversified across Eurasia and interacted with archaic humans. Different descendants followed different routes.","evidence":"Modern and ancient genomes","x":67,"y":38},
    {"id":"south-45000","yearsAgo":45000,"label":"Southern and eastern dispersals","region":"South Asia, Southeast Asia and Sahul","confidence":"High for settlement; exact timing varies","scope":"One branch of human history","description":"Population expansions reached South Asia, Southeast Asia and Sahul. This does not mean every user descends equally from every route.","evidence":"Archaeology, modern genomes and ancient DNA","x":78,"y":58},
    {"id":"north-40000","yearsAgo":40000,"label":"Northern Eurasian and European expansions","region":"Central Asia and Europe","confidence":"High for settlement patterns","scope":"One branch of human history","description":"Other populations expanded into northern Eurasia and Europe, repeatedly mixing and replacing one another.","evidence":"Ancient DNA and archaeology","x":65,"y":28},
    {"id":"holocene-12000","yearsAgo":12000,"label":"Holocene population transformations","region":"Multiple regions","confidence":"High for major transitions","scope":"Regional population history","description":"Farming, pastoralism, seafaring and urbanisation produced large migrations and mixtures.","evidence":"Ancient DNA, archaeology and historical linguistics","x":70,"y":45},
    {"id":"recent","yearsAgo":0,"label":"Documented family geography","region":"User-provided","confidence":"Depends on family records","scope":"Recent context only","description":"Birthplaces describe recent family history. They are never used to infer caste, religion or genetic identity.","evidence":"User-provided family information","x":73,"y":51},
]


def baseline_report(profile: dict[str, Any], files: list[dict[str, Any]], tools: dict[str, Any]) -> dict[str, Any]:
    display_name = str(profile.get("displayName") or "").strip()[:80]
    report = {
        "schemaVersion":"1.0.0",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "title":f"{display_name}’s ancestry workspace" if display_name else "Your ancestry workspace",
        "personalisedGeneticInference":False,
        "recentContext":{
            "birthYear":profile.get("birthYear"),
            "birthplace":profile.get("birthplace") or None,
            "familyPlaces":profile.get("familyPlaces") or [],
            "warning":"Recent family geography is context only and is never used to infer caste, religion or genetic ancestry.",
        },
        "genome":{"files":files,"warning":"File quality and tool availability do not by themselves establish ancestry."},
        "journey":JOURNEY,
        "autosomal":{"status":"Reference analysis not run","summary":"Population affinities require a versioned reference panel, PCA projection and reviewed formal models.","affinities":[]},
        "maternal":{"status":"Not classified","haplogroup":None,"summary":"mtDNA describes one direct maternal line only and requires sufficient markers."},
        "paternal":{"status":"Not classified","haplogroup":None,"summary":"Y-DNA describes one direct paternal line only and requires suitable Y markers."},
        "ancient":{"status":"Not modelled","summary":"Ancient affinities require licensed, versioned ancient-DNA panels and alternative-model testing."},
        "methods":{"tools":tools,"referencePanels":[]},
        "limitations":[
            "Individual prehistoric ancestors and exact ancient villages cannot be identified.",
            "A person does not inherit detectable autosomal DNA from every genealogical ancestor.",
            "Reference-panel composition strongly affects population-affinity estimates.",
            "Maternal and paternal haplogroups represent only two direct lines among many ancestors.",
            "Genetic affinity is not race, caste, nationality, religion or a measure of human worth.",
        ],
    }
    validate_report(report)
    return report


def merge_adapter_results(report: dict[str, Any], adapters: dict[str, Any]) -> dict[str, Any]:
    for key in ("autosomal", "maternal", "paternal", "ancient"):
        if isinstance(adapters.get(key), dict):
            report[key] = {**report.get(key, {}), **adapters[key]}
    if isinstance(adapters.get("journey"), list) and adapters["journey"]:
        report["journey"] = adapters["journey"]
    if adapters.get("personalisedGeneticInference") is True:
        report["personalisedGeneticInference"] = True
    validate_report(report)
    return report


def validate_report(report: dict[str, Any]) -> None:
    if report_contains_prohibited_inference(report):
        raise ValueError("Analysis output violated prohibited-inference guardrails")
    if report.get("personalisedGeneticInference") and not report.get("autosomal", {}).get("affinities"):
        raise ValueError("Personalised inference requires explicit population-affinity evidence")
