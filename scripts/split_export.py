#!/usr/bin/env python3
import json
import os
import random
from datetime import datetime

DATA_DIR = '/run/media/fure/New Volume/DayTrack/data'

def main():
    random.seed(12345)
    path = os.path.join(DATA_DIR, 'golden_paraphrased.jsonl')
    samples = []
    with open(path) as f:
        for line in f:
            samples.append(json.loads(line))
    random.shuffle(samples)
    n = len(samples)
    train_n = int(n*0.8); val_n = int(n*0.1)
    train = samples[:train_n]
    val = samples[train_n:train_n+val_n]
    test = samples[train_n+val_n:]
    for name, arr in [('golden_train.jsonl',train),('golden_val.jsonl',val),('golden_test.jsonl',test)]:
        with open(os.path.join(DATA_DIR,name),'w',encoding='utf-8') as f:
            for s in arr:
                f.write(json.dumps({'input':s['input'], 'output':s['output']}, ensure_ascii=False)+'\n')
    few = {'lv1':[], 'lv2':[], 'lv3':[], 'lv4':[], 'lv5':[]}
    # curate
    for s in train:
        nt = len(s['input']['tasks'])
        feas = s['output']['feasible']
        if not feas:
            if len(few['lv5']) < 1: few['lv5'].append({'input':s['input'], 'output':s['output']})
            continue
        if nt <= 2:
            if len(few['lv1']) < 3: few['lv1'].append({'input':s['input'], 'output':s['output']})
        elif nt == 3:
            mental = ' '.join(s['input']['profile']['mental'])
            health = ' '.join(s['input']['profile']['health'])
            if 'Rối loạn' in mental:
                if len(few['lv4']) < 3: few['lv4'].append({'input':s['input'], 'output':s['output']})
            elif any(x in health for x in ['Béo phì','Thừa cân','Gầy']):
                if len(few['lv3']) < 3: few['lv3'].append({'input':s['input'], 'output':s['output']})
            else:
                if len(few['lv2']) < 3: few['lv2'].append({'input':s['input'], 'output':s['output']})
        else:
            if len(few['lv5']) < 2: few['lv5'].append({'input':s['input'], 'output':s['output']})
    # fill lv5 feasible
    if len(few['lv5']) < 3:
        for s in train:
            if s['output']['feasible'] and len(s['input']['tasks'])>=3:
                # avoid duplicate
                exists = any(x['input']==s['input'] for x in few['lv5'])
                if not exists:
                    few['lv5'].append({'input':s['input'], 'output':s['output']})
                if len(few['lv5'])>=3: break
    with open(os.path.join(DATA_DIR,'fewshot.json'),'w',encoding='utf-8') as f:
        json.dump(few,f,ensure_ascii=False,indent=2)
    schema = {
      "input": {"profile": {"job_title": "string", "health": ["string"], "mental": ["string"]}, "date": "YYYY-MM-DD", "tasks": [{"name": "string", "duration_min": 30, "priority": "high|medium|low"}]},
      "context": {"profile_id": "P01-P20", "load_work_factor": 0.0, "max_session_min": 0, "focus_hours_max_day": 0.0, "applied_factors": ["string"]},
      "output": {"plan": [{"start": "HH:MM", "end": "HH:MM", "task": "string", "work_type": "A|B|C|D|E|F|G|H|I|J", "block": "D1|D2|TR|CT|TOI|NGU|VD|WK|Bua|EVENT", "session": 1}], "feasible": True, "warnings": [], "violations": []}
    }
    with open(os.path.join(DATA_DIR,'schema.json'),'w',encoding='utf-8') as f:
        json.dump(schema,f,ensure_ascii=False,indent=2)
    manifest = {
      "seed": 12345, "target": 300,
      "counts_by_level": {"lv1":50,"lv2":50,"lv3":40,"lv4":40,"lv5":120},
      "total_stage1": 300, "feasible_true_total": 291, "feasible_false_total": 9,
      "feasible_false_ratio_lv5": 0.075, "feasible_false_ratio_total": 0.03,
      "profiles_distribution": {f'P{i:02d}':15 for i in range(1,21)},
      "paraphrase_applied": True,
      "paraphrase_fields": ["input.profile.job_title", "input.tasks[].name"],
      "split": {"train": 0.80, "val": 0.10, "test": 0.10},
      "train_size": len(train), "val_size": len(val), "test_size": len(test),
      "timestamp": datetime.now().isoformat()
    }
    with open(os.path.join(DATA_DIR,'manifest.json'),'w',encoding='utf-8') as f:
        json.dump(manifest,f,ensure_ascii=False,indent=2)
    print('ok', len(train), len(val), len(test))

if __name__ == '__main__':
    main()
