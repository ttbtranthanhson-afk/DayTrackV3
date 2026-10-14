#!/usr/bin/env python3
import json
import os
import random
import sys
from datetime import datetime

RULE_DIR = '/run/media/fure/New Volume/DayTrack/daytrack_rules'
DATA_DIR = '/run/media/fure/New Volume/DayTrack/data'
TESTS_DIR = '/run/media/fure/New Volume/DayTrack/tests'

# Import planner
sys.path.insert(0, '/run/media/fure/New Volume/DayTrack/scripts')
from planner_v2 import Planner

class GoldenGenerator:
    def __init__(self, seed=12345):
        random.seed(seed)
        self.planner = Planner()
        self.seed = seed
        self.profiles_list = [f'P{i:02d}' for i in range(1, 21)]  # P01-P20
        self.job2prof = self.planner.job2prof
        self.prof_rev = {v:k for k,v in self.job2prof.items()}
        self.task_rules = self.planner.task_rules
        self.matrix = self.planner.matrix
        self.tasks_all = list(self.task_rules.keys())
        # filter tasks that have reasonable rules
        self.tasks_all = [t for t in self.tasks_all if t.strip()]
        random.shuffle(self.tasks_all)
    
    def get_profile_name(self, pid):
        # find job title for pid
        for k,v in self.job2prof.items():
            if v == pid: return k
        return 'Học sinh THPT'
    
    def sample_health_mental(self, level):
        if level in ['lv1', 'lv2']:
            return (['Bình thường'], ['Tinh thần ổn định'])
        elif level == 'lv3':
            health_opts = [
                ['Bình thường'],
                ['Béo phì độ I'],
                ['Thừa cân'],
                ['Gầy độ I (hơi gầy)'],
                ['Bình thường'],
            ]
            return (random.choice(health_opts), ['Tinh thần ổn định'])
        elif level == 'lv4':
            mental_opts = [
                ['Rối loạn lo âu lan tỏa'],
                ['Rối loạn lo âu xã hội (sợ giao tiếp)'],
                ['Rối loạn lo âu lan tỏa'],
                ['Ám ảnh sợ đặc hiệu'],
                ['Tinh thần ổn định'],
            ]
            return (random.choice([['Bình thường'], ['Bình thường'], ['Thừa cân']]), random.choice(mental_opts))
        elif level == 'lv5':
            health_opts = [['Bình thường'], ['Béo phì độ I'], ['Thừa cân']]
            mental_opts = [['Tinh thần ổn định'], ['Rối loạn lo âu lan tỏa'], ['Rối loạn lo âu xã hội (sợ giao tiếp)']]
            return (random.choice(health_opts), random.choice(mental_opts))
        return (['Bình thường'], ['Tinh thần ổn định'])
    
    def sample_tasks(self, level, exclude=set()):
        if level == 'lv1':
            n = random.randint(1, 2)
        elif level == 'lv2':
            n = random.randint(2, 3)
        elif level == 'lv3':
            n = random.randint(2, 3)
        elif level == 'lv4':
            n = random.randint(2, 3)
        elif level == 'lv5':
            n = random.randint(3, 4)
        else:
            n = random.randint(1, 2)
        chosen = []
        for t in self.tasks_all:
            if t in exclude: continue
            if t not in self.task_rules: continue
            # prefer tasks with matrix slots? just pick
            chosen.append(t)
            if len(chosen) >= n * 3: break
        random.shuffle(chosen)
        return chosen[:n]
    
    def build_input(self, level, pid, tasks):
        job_title = self.get_profile_name(pid)
        health, mental = self.sample_health_mental(level)
        task_objs = []
        for t in tasks:
            tr = self.task_rules.get(t, {})
            dur = tr.get('duration_min')
            if not dur: dur = random.randint(15, 40)
            prio_opts = ['high', 'medium', 'low']
            prio = random.choice(prio_opts)
            # adjust for level
            if level == 'lv1': dur = min(dur, 40)
            if level == 'lv5': dur = random.randint(25, 90)
            task_objs.append({
                'name': t,
                'duration_min': int(dur),
                'priority': prio
            })
        inp = {
            'input': {
                'profile': {
                    'job_title': job_title,
                    'health': health,
                    'mental': mental
                },
                'date': '2026-10-15',
                'tasks': task_objs
            }
        }
        return inp
    
    def gen_samples(self, target=300, counts=None):
        if counts is None:
            counts = {'lv1':50, 'lv2':50, 'lv3':40, 'lv4':40, 'lv5':120}
        out_path = os.path.join(DATA_DIR, 'golden_stage1.jsonl')
        samples = []
        pid_idx = 0
        # generate per level
        for level, c in counts.items():
            got = 0
            false_target = 0
            if level == 'lv5':
                false_target = int(c * 0.08)  # ~8%
            false_got = 0
            tries = 0
            while got < c and tries < c * 20:
                tries += 1
                pid = self.profiles_list[pid_idx % len(self.profiles_list)]
                pid_idx += 1
                tasks = self.sample_tasks(level)
                if not tasks: continue
                inp = self.build_input(level, pid, tasks)
                try:
                    res = self.planner.plan(inp)
                except Exception as e:
                    continue
                # decide whether to keep as false if level 5
                keep = True
                if level == 'lv5' and false_got < false_target and res['output']['feasible'] == False:
                    # only keep if has violations
                    if not res['output'].get('violations'): keep = False
                    else: false_got += 1
                elif level == 'lv5' and res['output']['feasible'] == False and false_got >= false_target:
                    keep = False  # skip extra false
                elif level in ['lv1','lv2','lv3','lv4'] and res['output']['feasible'] == False:
                    keep = False  # only keep feasible for lv1-4
                if not keep: continue
                samples.append({'input': res['input'], 'output': res['output'], 'context': res['context'], 'level': level, '_pid': pid})
                got += 1
        # write
        with open(out_path, 'w', encoding='utf-8') as f:
            for s in samples:
                rec = {'input': s['input'], 'output': s['output']}
                f.write(json.dumps(rec, ensure_ascii=False) + '\n')
        # manifest stage1
        manifest = {
            'seed': self.seed,
            'target': target,
            'counts_by_level': counts,
            'total_stage1': len(samples),
            'feasible_false_included': false_got if 'false_got' in locals() else 0,
            'timestamp': datetime.now().isoformat()
        }
        with open(os.path.join(DATA_DIR, 'manifest_stage1.json'), 'w', encoding='utf-8') as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
        print('done', len(samples), 'samples to', out_path)
        return samples

if __name__ == '__main__':
    g = GoldenGenerator(seed=12345)
    g.gen_samples(target=300)
