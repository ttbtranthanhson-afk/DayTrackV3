#!/usr/bin/env python3
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

RULE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'daytrack_rules') if False else os.path.join('/run/media/fure/New Volume/DayTrack', 'daytrack_rules')

class RuleEngine:
    def __init__(self, rule_dir: str = None):
        self.rule_dir = rule_dir or os.path.join('/run/media/fure/New Volume/DayTrack', 'daytrack_rules')
        self.data = {}
        for fname in ['QT_Loại_việc.json', 'QT_Hồ_sơ_nghề.json', 'QT_Nghề_nghiệp.json', 
                      'QT_Lịch_theo_việc.json', 'QT_Ma_trận_giờ.json', 'QT_Sức_khỏe.json',
                      'QT_Tinh_thần.json', 'QT_Nguyên_tắc.json', 'QT_Phương_pháp.json', 
                      'QT_Kịch_bản_mẫu.json']:
            path = os.path.join(self.rule_dir, fname)
            if os.path.exists(path):
                with open(path, encoding='utf-8') as f:
                    self.data[fname.replace('.json','')] = json.load(f)
    
    def get_profile_id_by_job(self, job_title: str) -> Optional[str]:
        rows = self.data.get('QT_Nghề_nghiệp', {}).get('rows', [])
        job_title_lower = str(job_title).lower().strip()
        for r in rows:
            if str(r.get('Nghề nghiệp','')).lower().strip() == job_title_lower or \
               str(r.get('Nhóm nghề','')).lower().strip() in job_title_lower:
                return r.get('Mã hồ sơ') or r.get('Mã')
        # try contains
        for r in rows:
            if job_title_lower in str(r.get('Nghề nghiệp','')).lower():
                return r.get('Mã hồ sơ')
        return None
    
    def get_profile_template(self, profile_id: str) -> Optional[Dict]:
        rows = self.data.get('QT_Hồ_sơ_nghề', {}).get('rows', [])
        for r in rows:
            if str(r.get('Mã','')) == str(profile_id) or str(r.get('Mã hồ sơ','')) == str(profile_id):
                return r
        return None

if __name__ == '__main__':
    re = RuleEngine()
    print(re.get_profile_id_by_job('Học sinh THPT'))
    print(re.get_profile_template('P03')['Giờ thức'], re.get_profile_template('P03')['Giờ ngủ'])
