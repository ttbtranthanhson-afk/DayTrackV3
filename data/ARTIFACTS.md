# Artifacts

## Rules
- daytrack_rules/*.json – exported QT sheets

## Golden Dataset (300)
- golden_stage1.jsonl – structured
- golden_paraphrased.jsonl – light paraphrase (job_title, task.name)
- golden_train.jsonl / golden_val.jsonl / golden_test.jsonl – SFT direct pairs {input,output}
- fewshot.json – curated (3/lv + 1 feasible=false Lv5)
- schema.json, manifest.json

## Runtime
- scripts/planner_v2.py – rule-engine (generator)
- scripts/validator.py – hard gate validator
- scripts/hard_gate.py – enforce wrapper
- scripts/eval.py – eval harness

## Prompts
- prompts/system_prompt_strict.md
- prompts/system_prompt_final.md
