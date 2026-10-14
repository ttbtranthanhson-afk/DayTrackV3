#!/usr/bin/env python3
import json
import os
import re
from datetime import datetime, timedelta

RULE_DIR = '/run/media/fure/New Volume/DayTrack/daytrack_rules'
OUT_DIR = '/run/media/fure/New Volume/DayTrack/tests'

class Planner:
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
        sk_rows = json.load(open(os.path.join(RULE_DIR,'QT_Sức_khỏe.json')))['rows']
        tm_rows = json.load(open(os.path.join(RULE_DIR,'QT_Tinh_thần.json')))['rows']
        self.sk_map = {r.get('Tình trạng / bệnh','').strip(): r for r in sk_rows if r.get('Tình trạng / bệnh')}
        self.tm_map = {r.get('Vấn đề tinh thần','').strip(): r for r in tm_rows if r.get('Vấn đề tinh thần')}
    
    def _to_float(self, v):
        try:
            if v == '' or v is None: return None
            s = str(v).replace('%','').strip()
            return float(s)
        except Exception:
            return None
    
    def _merge_limits(self, health_list, mental_list):
        factors = []
        load_f = 1.0
        max_sess = 50
        focus_max = 4.0
        for h in (health_list or []):
            if h in self.sk_map:
                r = self.sk_map[h]
                lf = self._to_float(r.get('Hệ số tải học - làm'))
                ms = self._to_float(r.get('Phiên tập trung tối đa (phút)'))
                if lf is not None:
                    lf2 = lf/100.0 if lf > 1 else lf
                    if lf2 < load_f: load_f = lf2
                if ms is not None and ms < max_sess: max_sess = int(ms)
                factors.append(f'health:{h}({lf or "?"}%)')
        for m in (mental_list or []):
            if m in self.tm_map:
                r = self.tm_map[m]
                lf = self._to_float(r.get('Hệ số tải học - làm'))
                ms = self._to_float(r.get('Phiên tập trung (phút)'))
                if lf is not None:
                    lf2 = lf/100.0 if lf > 1 else lf
                    if lf2 < load_f: load_f = lf2
                if ms is not None and ms < max_sess: max_sess = int(ms)
                factors.append(f'mental:{m}({lf or "?"}%)')
        return {'load_work_factor': round(load_f,2), 'max_session_min': int(max_sess), 'focus_hours_max_day': focus_max, 'applied_factors': factors}
    
    def _map_wt(self, raw, tr=None):
        rawl = str(raw or '').lower()
        for code,row in self.worktypes.items():
            wname = str(row.get('Loại việc','')).lower()
            if code in ['A','B','C','D','E','F','G','H','I','J']:
                if wname in rawl or rawl in wname: return code
        if tr and tr.get('work_type_raw'):
            return self._map_wt(tr.get('work_type_raw'))
        return 'A'
    
    def _parse_range(self, s):
        if not s: return None,None
        m = re.search(r'(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})', str(s))
        if m:
            h1=int(m.group(1)); mi1=int(m.group(2)); h2=int(m.group(3)); mi2=int(m.group(4))
            return datetime(2026,1,1,h1,mi1), datetime(2026,1,1,h2,mi2)
        return None,None
    
    def _get_slot_for_task(self, pid, task_name, blk, ptemp):
        for m in self.matrix:
            if str(m.get('Công việc','')).strip() == str(task_name).strip():
                for k,v in m.items():
                    if str(k).startswith(str(pid)) and v:
                        return str(v)
        if blk=='D1': return ptemp.get('D1 (cao điểm 1: việc nặng, sáng tạo)')
        if blk=='D2': return ptemp.get('D2 (cao điểm 2: nhớ, giao tiếp)')
        for cand in ['TOI (tối nhẹ)','CT (chiều tối: việc nhà, xã hội)','TR (trũng: việc nhẹ, ngủ trưa)','SÁNG (lập kế hoạch)','NGU (trước ngủ)']:
            if ptemp.get(cand): return ptemp.get(cand)
        return None
    
    def _overlap_any(self, s,e, occupied):
        for os_,oe in occupied:
            if not (e <= os_ or oe <= s):
                return True
        return False
    def _norm_block(self, blk):
        if not blk: return 'D1'
        b = str(blk).strip().upper()
        if 'SÁNG' in b or b == 'SANG': return 'D1'
        if 'TỐI NHẸ' in b or b == 'TOI': return 'TOI'
        if 'CHIỀU' in b or 'CT' in b: return 'CT'
        if 'TRŨNG' in b or b == 'TR': return 'TR'
        if 'NGỦ' in b or b == 'NGU': return 'NGU'
        if b == 'BUA': return 'Bua'
        if b in ['D1','D2','VD','WK','BUA','EVENT','CT','TR','TOI','NGU']: 
            return 'Bua' if b == 'BUA' else b
        return 'D1'

    def _norm_block(self, blk):
        if not blk: return 'D1'
        b = str(blk).strip().upper()
        if 'SÁNG' in b or b == 'SANG': return 'D1'
        if 'TỐI' in b and 'NHẸ' in b: return 'TOI'
        if b == 'TOI': return 'TOI'
        if 'CHIỀU' in b: return 'CT'
        if 'TRŨNG' in b or 'TRUNG' in b or b == 'TR': return 'TR'
        if 'NGỦ' in b or b == 'NGU': return 'NGU'
        if b in ['D1','D2','VD','WK','BUA','EVENT']: return b
        if b == 'BUA': return 'Bua'
        # map common
        if b in ['D1','D2','TR','CT','TOI','NGU','VD','WK','Bua','EVENT']: return b
        return 'D1'

    
    def plan(self, inp: dict) -> dict:
        prof = inp['input']['profile']
        pid = self.job2prof.get(prof.get('job_title'))
        if not pid:
            jt = str(prof.get('job_title','')).lower()
            for k,v in self.job2prof.items():
                if jt in k.lower(): pid = v; break
        if not pid: pid = 'P03'
        ptemp = self.profiles.get(pid,{})
        lim = self._merge_limits(prof.get('health',[]), prof.get('mental',[]))
        tasks = inp['input'].get('tasks',[])
        prio_map = {'high':3,'medium':2,'low':1,'cao':3,'vừa':2,'thấp':1}
        tasks_sorted = sorted(tasks, key=lambda x: prio_map.get(str(x.get('priority','medium')).lower(),2), reverse=True)
        occupied = []
        plan = []
        violations = []
        for t in tasks_sorted:
            name = t['name']
            tr = self.task_rules.get(name,{})
            blk = tr.get('block','D1')
            slot = self._get_slot_for_task(pid, name, blk, ptemp)
            s,e = self._parse_range(slot)
            if not s:
                violations.append(f'Không tìm thấy slot hợp lệ cho {name}')
                continue
            dur = int(t.get('duration_min') or tr.get('duration_min') or 30)
            maxs = lim['max_session_min']
            remaining = dur
            sess = 0
            pos = s
            placed = False
            while remaining > 0:
                take = min(remaining, maxs)
                e2 = pos + timedelta(minutes=take)
                if self._overlap_any(pos,e2,occupied):
                    # try shift small steps
                    shifted = False
                    for sh in [5,10,15,20,30,45,60]:
                        p2 = pos + timedelta(minutes=sh)
                        e2s = p2 + timedelta(minutes=take)
                        if not self._overlap_any(p2,e2s,occupied):
                            if p2 < e: # within same slot range? loose check ok
                                pos,e2 = p2,e2s; shifted=True; break
                    if not shifted:
                        violations.append(f'Trùng giờ khi xếp {name}')
                        break
                sess += 1
                plan.append({
                    'start': pos.strftime('%H:%M'),
                    'end': e2.strftime('%H:%M'),
                    'task': name,
                    'work_type': self._map_wt(tr.get('work_type_raw'), tr),
                    'block': self._norm_block(blk),
                    'session': sess
                })
                occupied.append((pos,e2))
                remaining -= take
                pos = e2 + timedelta(minutes=5)
                placed = True
                if sess > 10: break
            if not placed and len(plan)==0 and f'Trùng giờ khi xếp {name}' not in violations:
                violations.append(f'Không đặt được {name}')
        feasible = len(violations) == 0 and len(plan) > 0
        return {'input': inp['input'], 'context': {'profile_id': pid, **lim}, 'output': {'plan': plan, 'feasible': feasible, 'warnings': [], 'violations': violations}}

if __name__ == '__main__':
    p = Planner()
    import sys
    path = sys.argv[1] if len(sys.argv)>1 else os.path.join(OUT_DIR,'sample_lv1.json')
    with open(path) as f:
        inp=json.load(f)
    res = p.plan(inp)
    print(json.dumps(res,ensure_ascii=False,indent=2))
