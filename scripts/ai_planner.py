#!/usr/bin/env python3
import json
import os
import re
from datetime import datetime, timedelta

RULE_DIR = '/run/media/fure/New Volume/DayTrack/daytrack_rules'
OUT_DIR = '/run/media/fure/New Volume/DayTrack/tests'

class AIPlanner:
    def __init__(self):
        self.load()
    
    def load(self):
        self.job2prof = json.load(open(os.path.join(RULE_DIR,'lookup_job_profile.json')))
        self.task_rules = json.load(open(os.path.join(RULE_DIR,'lookup_task_rules.json')))
        prof_rows = json.load(open(os.path.join(RULE_DIR,'QT_Hồ_sơ_nghề.json')))['rows']
        self.profiles = {r['Mã']:r for r in prof_rows if r.get('Mã')}
        wt_rows = json.load(open(os.path.join(RULE_DIR,'QT_Loại_việc.json')))['rows']
        self.worktypes = {r['Mã']:r for r in wt_rows if r.get('Mã')}
        self.matrix = json.load(open(os.path.join(RULE_DIR,'QT_Ma_trận_giờ.json')))['rows']
    
    def plan(self, inp: dict) -> dict:
        prof = inp['input']['profile']
        pid = self.job2prof.get(prof['job_title'])
        if not pid:
            for k,v in self.job2prof.items():
                if str(prof['job_title']).lower() in k.lower():
                    pid = v; break
        if not pid: pid = 'P03'
        ptemp = self.profiles.get(pid,{})
        plan = []
        for t in inp['input']['tasks']:
            name = t['name']
            tr = self.task_rules.get(name,{})
            blk = tr.get('block','D1')
            slot = None
            # find matrix slot for this pid and task
            for m in self.matrix:
                if m.get('Công việc') == name:
                    for k,v in m.items():
                        if k.startswith(pid) and v:
                            slot = v; break
                    break
            if not slot:
                if blk=='D1': slot = ptemp.get('D1 (cao điểm 1: việc nặng, sáng tạo)')
                elif blk=='D2': slot = ptemp.get('D2 (cao điểm 2: nhớ, giao tiếp)')
                elif ptemp.get('TOI (tối nhẹ)'): slot = ptemp.get('TOI (tối nhẹ)')
                elif ptemp.get('CT (chiều tối: việc nhà, xã hội)'): slot = ptemp.get('CT (chiều tối: việc nhà, xã hội)')
            s,e = self._parse_range(slot)
            if s:
                dur = t.get('duration_min') or tr.get('duration_min') or 30
                e2 = s + timedelta(minutes=int(dur))
                plan.append({
                    'start': s.strftime('%H:%M'),
                    'end': e2.strftime('%H:%M'),
                    'task': name,
                    'work_type': self._map_wt(tr.get('work_type_raw','')),
                    'block': blk,
                    'session': 1
                })
        return {
            'input': inp['input'],
            'context': {'profile_id': pid, 'load_work_factor':1.0,'max_session_min':50,'focus_hours_max_day':4.0,'applied_factors':['health:Bình thường']},
            'output': {'plan': plan, 'feasible': len(plan)>0, 'warnings':[], 'violations':[]}
        }
    
    def _map_wt(self, raw):
        rawl = str(raw).lower()
        for code,row in self.worktypes.items():
            if code in ['A','B','C','D','E','F','G','H','I','J'] and row.get('Loại việc','').lower() in rawl:
                return code
        # fallback by block
        return 'A'
    
    def _parse_range(self, s):
        if not s: return None,None
        m = re.search(r'(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})', str(s))
        if m:
            h1=int(m.group(1)); mi1=int(m.group(2)); h2=int(m.group(3)); mi2=int(m.group(4))
            start = datetime(2026,1,1,h1,mi1)
            end = datetime(2026,1,1,h2,mi2)
            return start,end
        return None,None

if __name__ == '__main__':
    p = AIPlanner()
    with open(os.path.join(OUT_DIR,'sample_lv1.json')) as f:
        inp=json.load(f)
    res = p.plan(inp)
    print(json.dumps(res,ensure_ascii=False,indent=2))
