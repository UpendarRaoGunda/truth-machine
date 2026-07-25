# Ancestral Journey

Ancestral Journey reconstructs probable **population-level** affinities and migration corridors. It does not claim to identify every genealogical ancestor, name prehistoric individuals or locate them in exact villages.

## Inputs

Name is used only for report display. Birth year and recent family places provide optional context. Genetic inference comes only from genome evidence and configured reference models. Names are never used to infer ancestry, caste, religion or community.

Supported direct inputs: VCF/VCF.GZ, consumer raw genotype text, PLINK BED/BIM/FAM and PGEN/PVAR/PSAM. BAM/CRAM is reserved for an advanced service because those files are much larger.

## Report layers

1. Autosomal population affinities with alternatives and confidence.
2. Maternal direct-line classification from mtDNA when supported.
3. Paternal direct-line classification from Y-DNA when supported.
4. Ancient-population affinities using versioned ancient-DNA models.
5. A 70,000-year timeline separating shared human history from personalized inference.
6. Dataset, software, marker-count, quality-control and limitation records.

Without a configured reference pipeline the feature returns local format/QC information and the shared human migration baseline only. It never fabricates percentages.

## Prohibited outputs

Caste/religion prediction, racial-purity or superiority scores, exact prehistoric locations, intelligence/personality/criminality claims, medical diagnosis, and famous-person relationships without genealogical evidence.
