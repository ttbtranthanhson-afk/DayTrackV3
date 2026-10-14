#!/usr/bin/env python3
import json
import os
import re
from datetime import datetime, timedelta

RULE_DIR = '/run/media/fure/New Volume/DayTrack/daytrack_rules'
OUT_DIR = '/run/media/fure/New Volume/DayTrack/tests'

BLOCK_MAP = {
    'SANG': 'SÁNG',
    'Tối nhẹ': 'TOI',
    'TOI': 'TOI',
    'Chiều tối': 'CT',
    'Trũng': 'TR',
    'VD': 'VD',
    'WK': 'WK',
    'Bua': 'Bua',
    'EVENT': 'EVENT',
    'D1': 'D1',
    'D2': 'D2',
    'NGU': 'NGU',
}

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
    
    def _norm_block(self, blk):
        if not blk: return 'D1'
        b = str(blk).strip()
        # check vietnamese
        if 'SÁNG' in b or b == 'SANG': return 'D1'  # normalize morning to D1? or keep consistent
        if 'TOI' in b or 'tối nhẹ' in b.lower(): return 'TOI'
        if 'CT' in b or 'chiều' in b.lower(): return 'CT'
        if 'TR' in b or 'trũng' in b.lower(): return 'TR'
        if 'NGU' in b or 'ngủ' in b.lower(): return 'NGU'
        if b in ['D1','D2','VD','WK','Bua','EVENT']: return b
        return b if b in ['D1','D2','TR','CT','TOI','NGU','VD','WK','Bua','EVENT'] else 'D1'

# reuse methods
