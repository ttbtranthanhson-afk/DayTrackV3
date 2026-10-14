#!/usr/bin/env python3
import json
import sys
import os

sys.path.insert(0, os.path.join('/run/media/fure/New Volume/DayTrack', 'scripts'))
from validator import Validator
from planner_v2 import Planner

class HardGate:
    def __init__(self):
        self.v = Validator()
        self.p = Planner()
    
    def enforce(self, llm_result, max_retry=1):
        """
        Enforce hard gate: validate llm_result. If fail, try to reconstruct from input using planner.
        If still fail, return safe fallback with feasible=False.
        """
        # validate
        r = self.v.validate(llm_result)
        if r['valid']:
            return llm_result
        # try reconstruct
        inp = llm_result.get('input') if 'input' in llm_result else None
        if inp:
            try:
                recon = self.p.plan({'input': inp})
                rr = self.v.validate({'input': inp, 'output': recon['output']})
                if rr['valid']:
                    return {'input': inp, 'output': recon['output'], 'context': recon['context']}
            except Exception:
                pass
        # fallback
        inp = llm_result.get('input') or {}
        return {
            'input': inp,
            'output': {
                'plan': [],
                'feasible': False,
                'warnings': ['hard_gate_fallback'],
                'violations': ['Output không hợp lệ theo schema/quy tắc; đã áp dụng hard gate.']
            }
        }

if __name__ == '__main__':
    pass
