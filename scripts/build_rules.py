#!/usr/bin/env python3
"""Build a compact, app-importable ruleset at shared/rules/data.json.

Reads the curated daytrack_rules/*.json plus the extra sheets that only exist in
DayTrack_du_lieu.xlsx (meals / exercises / sports), and emits one small JSON that
both src/ and api/ can import on Vercel.
"""
import json
import os
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RULE_DIR = os.path.join(ROOT, 'daytrack_rules')
XLSX = os.path.join(ROOT, 'DayTrack_du_lieu.xlsx')
OUT = os.path.join(ROOT, 'shared', 'rules', 'data.json')


def load_sheet_json(fname):
    with open(os.path.join(RULE_DIR, fname), encoding='utf-8') as f:
        return json.load(f)['rows']


def load_xlsx_sheet(name):
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb[name]
    it = ws.iter_rows(values_only=True)
    headers = [str(h).strip() if h is not None else '' for h in next(it)]
    rows = []
    for r in it:
        if all(c is None for c in r):
            continue
        rows.append({headers[i]: r[i] for i in range(len(headers))})
    return rows


def s(v):
    if v is None:
        return ''
    return str(v).strip()


def num(v):
    try:
        if v in (None, ''):
            return None
        return float(str(v).replace('%', '').replace(',', '.').strip())
    except Exception:
        return None


def frac(v):
    x = num(v)
    if x is None:
        return None
    return round(x / 100.0, 3) if x > 1 else x


def build():
    with open(os.path.join(RULE_DIR, 'lookup_job_profile.json'), encoding='utf-8') as f:
        jobs = json.load(f)
    with open(os.path.join(RULE_DIR, 'lookup_task_rules.json'), encoding='utf-8') as f:
        tasks = json.load(f)

    profiles = {}
    for r in load_sheet_json('QT_Hồ_sơ_nghề.json'):
        pid = s(r.get('Mã'))
        if not pid:
            continue
        profiles[pid] = {
            'name': s(r.get('Hồ sơ')),
            'wake': s(r.get('Giờ thức')),
            'sleep': s(r.get('Giờ ngủ')),
            'sleepH': num(r.get('Số giờ ngủ')),
            'meals': {
                'sang': s(r.get('Bữa sáng')),
                'trua': s(r.get('Bữa trưa')),
                'toi': s(r.get('Bữa tối')),
                'phu': s(r.get('Bữa phụ')),
            },
            'blocks': {
                'SANG': s(r.get('SÁNG (lập kế hoạch)')),
                'D1': s(r.get('D1 (cao điểm 1: việc nặng, sáng tạo)')),
                'D2': s(r.get('D2 (cao điểm 2: nhớ, giao tiếp)')),
                'TR': s(r.get('TR (trũng: việc nhẹ, ngủ trưa)')),
                'VD': s(r.get('VD (vận động)')),
                'CT': s(r.get('CT (chiều tối: việc nhà, xã hội)')),
                'TOI': s(r.get('TOI (tối nhẹ)')),
                'NGU': s(r.get('NGU (trước ngủ)')),
            },
            'deepFocusMax': s(r.get('Giờ tập trung sâu tối đa/ngày')),
            'constraints': s(r.get('Ràng buộc cố định')),
            'note': s(r.get('Lưu ý riêng')),
        }

    work_types = {}
    for r in load_sheet_json('QT_Loại_việc.json'):
        code = s(r.get('Mã'))
        if not code:
            continue
        work_types[code] = {
            'name': s(r.get('Loại việc')),
            'traits': s(r.get('Đặc điểm')),
            'block': s(r.get('Khối giờ mặc định')),
            'maxSession': num(r.get('Phiên tối đa (phút)')),
            'breakMin': num(r.get('Nghỉ giữa phiên (phút)')),
            'methods': s(r.get('Phương pháp mặc định')),
            'avoid': s(r.get('Giờ nên tránh')),
            'healthAdj': s(r.get('Điều chỉnh khi sức khỏe yếu / có bệnh')),
            'mentalAdj': s(r.get('Điều chỉnh khi tinh thần căng thẳng - lo âu - trầm cảm - ADHD')),
            'link': s(r.get('Gắn với ăn uống / vận động')),
        }

    task_details = {}
    for r in load_sheet_json('QT_Lịch_theo_việc.json'):
        name = s(r.get('Công việc'))
        if not name:
            continue
        task_details[name] = {
            'group': s(r.get('Nhóm')),
            'priority': s(r.get('Ưu tiên')),
            'durationMin': num(r.get('Thời lượng gợi ý (phút)')),
            'workType': s(r.get('Loại việc')),
            'block': s(r.get('Khối giờ')),
            'bestP03': s(r.get('Giờ tốt nhất - học sinh THPT (P03)')),
            'bestP04': s(r.get('Giờ tốt nhất - sinh viên (P04)')),
            'bestP07': s(r.get('Giờ tốt nhất - nhân viên văn phòng (P07)')),
            'avoid': s(r.get('Giờ nên tránh')),
            'split': s(r.get('Cách chia phiên')),
            'methods': s(r.get('Phương pháp (mã, xem QT Phương pháp)')),
            'howto': s(r.get('Cách thực hiện cụ thể')),
            'value': s(r.get('Giá trị tạo ra')),
            'healthAdj': s(r.get('Điều chỉnh khi sức khỏe yếu / có bệnh')),
            'mentalAdj': s(r.get('Điều chỉnh khi tinh thần căng thẳng - lo âu - trầm cảm - ADHD')),
            'foodLink': s(r.get('Gắn với ăn uống / vận động')),
        }

    matrix = {}
    for r in load_sheet_json('QT_Ma_trận_giờ.json'):
        name = s(r.get('Công việc'))
        if not name:
            continue
        row = {}
        for k, v in r.items():
            key = s(k)
            if key.startswith('P') and s(v):
                row[key.split(' ')[0]] = s(v)
        if row:
            matrix[name] = row

    health = {}
    for r in load_sheet_json('QT_Sức_khỏe.json'):
        cond = s(r.get('Tình trạng / bệnh'))
        if not cond:
            continue
        health[cond] = {
            'group': s(r.get('Loại')),
            'subgroup': s(r.get('Nhóm')),
            'loadFactor': frac(r.get('Hệ số tải học - làm')),
            'maxSession': num(r.get('Phiên tập trung tối đa (phút)')),
            'activityMax': frac(r.get('Hệ số vận động tối đa')),
            'activityLimit': s(r.get('Mức hạn chế vận động')),
            'mealGoal': s(r.get('Mục tiêu ăn (khớp sheet Món ăn theo mục tiêu)')),
            'foodPriority': s(r.get('Nhóm món ưu tiên')),
            'foodAvoid': s(r.get('Nhóm món hạn chế')),
            'foodSuggest': s(r.get('Món gợi ý (lấy từ sheet Món ăn theo mục tiêu)')),
            'exGoal': s(r.get('Mục tiêu tập (khớp sheet Bài tập theo mục tiêu)')),
            'exMax': s(r.get('Mức bài tập tối đa')),
            'exAvoid': s(r.get('Bài tập nên tránh')),
            'exSuggest': s(r.get('Bài tập gợi ý (lấy từ sheet Bài tập theo mục tiêu)')),
            'activityGood': s(r.get('Giờ vận động tốt')),
            'avoid': s(r.get('Giờ nên tránh')),
            'rules': s(r.get('Quy tắc lịch cụ thể')),
            'stop': s(r.get('Dừng khi / cảnh báo')),
            'doctor': s(r.get('Nên hỏi bác sĩ?')),
        }

    mental = {}
    for r in load_sheet_json('QT_Tinh_thần.json'):
        cond = s(r.get('Vấn đề tinh thần'))
        if not cond:
            continue
        mental[cond] = {
            'group': s(r.get('Nhóm')),
            'signs': s(r.get('Biểu hiện thường gặp')),
            'impact': s(r.get('Ảnh hưởng đến học tập / làm việc')),
            'loadFactor': frac(r.get('Hệ số tải học - làm')),
            'session': num(r.get('Phiên tập trung (phút)')),
            'breakMin': num(r.get('Nghỉ giữa phiên (phút)')),
            'priorityBlock': s(r.get('Khối giờ ưu tiên')),
            'methods': s(r.get('Phương pháp nên dùng (mã)')),
            'avoid': s(r.get('Nên tránh')),
            'rules': s(r.get('Quy tắc lịch cụ thể')),
            'exercise': s(r.get('Vận động hỗ trợ (từ sheet Bài tập)')),
            'sport': s(r.get('Thể thao hỗ trợ (từ sheet Thể thao phổ biến)')),
            'food': s(r.get('Món / đồ uống hỗ trợ (từ sheet Món ăn)')),
            'expert': s(r.get('Khi cần chuyên gia / an toàn')),
        }

    methods = {}
    for r in load_sheet_json('QT_Phương_pháp.json'):
        code = s(r.get('Mã'))
        if not code:
            continue
        methods[code] = {
            'name': s(r.get('Tên phương pháp')),
            'for': s(r.get('Dùng cho loại việc')),
            'steps': s(r.get('Cách thực hiện từng bước')),
            'value': s(r.get('Giá trị tạo ra')),
            'notes': s(r.get('Tránh / lưu ý')),
        }

    principles = []
    for r in load_sheet_json('QT_Nguyên_tắc.json'):
        principles.append({
            'code': s(r.get('Mã')),
            'group': s(r.get('Nhóm')),
            'rule': s(r.get('Quy tắc')),
            'how': s(r.get('Cách thực hiện cụ thể')),
            'why': s(r.get('Giá trị / lí do')),
            'priority': s(r.get('Cấp ưu tiên')),
        })

    scenarios = []
    for r in load_sheet_json('QT_Kịch_bản_mẫu.json'):
        scenarios.append({
            'scenario': s(r.get('Kịch bản')),
            'time': s(r.get('Giờ')),
            'task': s(r.get('Việc')),
            'how': s(r.get('Cách làm')),
            'why': s(r.get('Lí do')),
        })

    meals_by_goal = {}
    for r in load_xlsx_sheet('Món ăn theo mục tiêu'):
        goal = s(r.get('Mục tiêu'))
        if not goal:
            continue
        meals_by_goal.setdefault(goal, []).append({
            'dish': s(r.get('Món ăn')),
            'group': s(r.get('Nhóm')),
            'portion': s(r.get('Khẩu phần')),
            'kcal': num(r.get('kcal')),
            'protein': num(r.get('Đạm (g)')),
            'meal': s(r.get('Bữa phù hợp')),
        })

    exercises_by_goal = {}
    for r in load_xlsx_sheet('Bài tập theo mục tiêu'):
        goal = s(r.get('Mục tiêu'))
        if not goal:
            continue
        exercises_by_goal.setdefault(goal, []).append({
            'exercise': s(r.get('Bài tập')),
            'group': s(r.get('Nhóm cơ / loại')),
            'place': s(r.get('Địa điểm')),
            'equipment': s(r.get('Dụng cụ')),
            'level': s(r.get('Mức độ')),
            'dose': s(r.get('Gợi ý liều tập')),
        })

    sports = []
    for r in load_xlsx_sheet('Thể thao phổ biến'):
        name = s(r.get('Môn thể thao'))
        if not name:
            continue
        sports.append({
            'name': name,
            'type': s(r.get('Loại')),
            'popularity': s(r.get('Mức phổ biến ở VN')),
            'kcalH': num(r.get('kcal/giờ (ước tính)')),
            'benefit': s(r.get('Lợi ích chính')),
            'place': s(r.get('Địa điểm / dụng cụ')),
            'note': s(r.get('Lưu ý')),
        })

    data = {
        'meta': {
            'source': 'DayTrack_du_lieu.xlsx',
            'profiles': len(profiles),
            'jobs': len(jobs),
            'tasks': len(tasks),
            'health': len(health),
            'mental': len(mental),
        },
        'jobs': jobs,
        'profiles': profiles,
        'workTypes': work_types,
        'tasks': tasks,
        'taskDetails': task_details,
        'matrix': matrix,
        'health': health,
        'mental': mental,
        'methods': methods,
        'principles': principles,
        'scenarios': scenarios,
        'mealsByGoal': meals_by_goal,
        'exercisesByGoal': exercises_by_goal,
        'sports': sports,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print('wrote', OUT, os.path.getsize(OUT), 'bytes')
    print('meta', data['meta'])

    enums = {
        'jobs': jobs,
        'health': list(health.keys()),
        'mental': list(mental.keys()),
        'needs': ['gain', 'lose', 'muscle'],
    }
    enums_path = os.path.join(os.path.dirname(OUT), 'enums.json')
    with open(enums_path, 'w', encoding='utf-8') as f:
        json.dump(enums, f, ensure_ascii=False, separators=(',', ':'))
    print('wrote', enums_path, os.path.getsize(enums_path), 'bytes')


if __name__ == '__main__':
    build()
