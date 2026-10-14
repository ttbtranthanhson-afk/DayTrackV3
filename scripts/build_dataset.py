#!/usr/bin/env python3
import json
import os
from datetime import datetime, timedelta

RULE_DIR = '/run/media/fure/New Volume/DayTrack/daytrack_rules'
OUT_DIR = '/run/media/fure/New Volume/DayTrack/tests'

class DatasetBuilder:
    def __init__(self):
        self.load_all()
    
    def load_all(self):
        self.data = {}
        for fname in ['QT_Lịch_theo_việc.json', 'QT_Ma_trận_giờ.json', 'QT_Hồ_sơ_nghề.json', 'QT_Nghề_nghiệp.json', 'QT_Loại_việc.json']:
            with open(os.path.join(RULE_DIR,fname), encoding='utf-8') as f:
                self.data[fname.replace('.json','')] = json.load(f)

if __name__ == '__main__':
    os.makedirs(OUT_DIR, exist_ok=True)
    print('ok')
