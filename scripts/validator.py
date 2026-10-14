#!/usr/bin/env python3
import json
import os
import re
from datetime import datetime, timedelta

DATA_DIR = '/run/media/fure/New Volume/DayTrack/data'

class Validator:
    def __init__(self):
        pass
    
    def parse_time(self, s, context_h=None):
        try:
            m = re.match(r'^(\d{1,2}):(\d{2})$', str(s))
            if not m: return None
            h=int(m.group(1)); mi=int(m.group(2))
            base = datetime(2026,1,1,h%24, mi)
            extra = timedelta(days=h//24)
            if context_h is not None and h < context_h and context_h >= 20:  # cross midnight likely
                extra = timedelta(days=1)
            return base + extra
        except Exception:
            return None
    
    def validate(self, sample_or_res):
        if 'output' in sample_or_res and 'input' in sample_or_res:
            inp = sample_or_res['input']
            out = sample_or_res['output']
        else:
            return {'valid': False, 'errors': ['missing input/output']}
        errors = []
        if not isinstance(inp, dict) or not isinstance(out, dict): 
            return {'valid': False, 'errors': ['bad types']}
        for k in ['profile','tasks']:
            if k not in inp: errors.append(f'missing input.{k}')
        for k in ['plan','feasible','violations','warnings']:
            if k not in out: errors.append(f'missing output.{k}')
        if errors: return {'valid': False, 'errors': errors}
        wt_ok = set(['A','B','C','D','E','F','G','H','I','J'])
        blk_ok = set(['D1','D2','TR','CT','TOI','NGU','VD','WK','Bua','EVENT'])
        pid_ok = set([f'P{i:02d}' for i in range(1,21)])
        ctx = out.get('context') or {}
        if ctx.get('profile_id') and ctx['profile_id'] not in pid_ok:
            errors.append(f'bad profile_id {ctx.get("profile_id")}')
        plan = out['plan'] or []
        if not isinstance(plan, list): errors.append('plan not list')
        else:
            for i,p in enumerate(plan):
                for k in ['start','end','task','work_type','block','session']:
                    if k not in p: errors.append(f'plan[{i}] missing {k}')
                if p.get('work_type') not in wt_ok: errors.append(f'plan[{i}] bad work_type')
                if p.get('block') not in blk_ok: errors.append(f'plan[{i}] bad block')
                sh = int(str(p.get('start','0:0')).split(':')[0]) if ':' in str(p.get('start')) else 0
                s = self.parse_time(p.get('start'), context_h=sh); e = self.parse_time(p.get('end'), context_h=sh)
                if not s or not e: errors.append(f'plan[{i}] bad time')
                elif e <= s: errors.append(f'plan[{i}] end<=start')
        feas = bool(out.get('feasible'))
        viol = out.get('violations') or []
        if not isinstance(viol, list): errors.append('violations not list')
        if feas and len(viol) > 0: errors.append('feasible true but has violations')
        if not feas and len(viol) == 0: errors.append('feasible false but no violations')
        occ = []
        for p in plan:
            sh = int(str(p.get('start','0:0')).split(':')[0]) if ':' in str(p.get('start')) else 0
            s=self.parse_time(p.get('start'), context_h=sh); e=self.parse_time(p.get('end'), context_h=sh)
            for os_,oe in occ:
                if not (e <= os_ or oe <= s):
                    errors.append('overlap')
                    break
            occ.append((s,e))
        return {'valid': len(errors)==0, 'errors': errors}

if __name__ == '__main__':
    v = Validator()
