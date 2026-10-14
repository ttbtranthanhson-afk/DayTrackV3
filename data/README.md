# DayTrack Golden Dataset

Sinh bằng rule-gen từ planner_v2.py theo kế hoạch:
- Phân bố đều P01–P20 (15 mẫu/profile)
- Lv1–Lv5 với counts 50/50/40/40/120 (target 300)
- feasible=false chỉ Lv5: ~8% Lv5 (~9 mẫu total, ~3% tổng)
- Paraphrase nhẹ: chỉ input.profile.job_title và input.tasks[].name; context/output giữ nguyên

Files:
- golden_stage1.jsonl – structured trước paraphrase
- golden_paraphrased.jsonl – sau paraphrase nhẹ
- golden_train.jsonl, golden_val.jsonl, golden_test.jsonl – SFT JSONL {input,output}
- fewshot.json – curated few-shot theo level (có 1 mẫu feasible=false Lv5)
- schema.json – schema bắt buộc
- manifest.json – thống kê
