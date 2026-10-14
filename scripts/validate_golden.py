#!/usr/bin/env python3
import json
import os

DATA_DIR = '/run/media/fure/New Volume/DayTrack/data'

def validate():
    path = os.path.join(DATA_DIR, 'golden_paraphrased.jsonl')
    total = 0
    feas_t = 0; feas_f = 0
    bad = []
    with open(path) as f:
        for i,line in enumerate(f,1):
            d = json.loads(line)
            total += 1
            inp = d['input']; out = d['output']
            # check keys
            assert 'profile' in inp and 'tasks' in inp
            assert 'plan' in out and 'feasible' in out
            assert 'violations' in out and 'warnings' in out
            if out['feasible']: feas_t += 1
            else: feas_f += 1
            # check plan
            for p in out['plan']:
                for k in ['start','end','task','work_type','block','session']:
                    if k not in p: bad.append(f'row{i} missing {k}')
                if p['work_type'] not in ['A','B','C','D','E','F','G','H','I','J']: bad.append(f'row{i} bad wt')
    print('total', total, 'feas_t', feas_t, 'feas_f', feas_f, 'bad', len(bad))
    if bad: 
        for b in bad[:5]: print(b)
    assert len(bad)==0
    assert total==300
    print('ok')

if __name__ == '__main__':
    validate()
