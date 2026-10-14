#!/usr/bin/env python3
import json
import os
from datetime import datetime

DATA_DIR = '/run/media/fure/New Volume/DayTrack/data'

# simple light paraphrase rules (deterministic) to avoid needing external LLM if not available
JOB_PARAPHRASE = {
    'Học sinh THPT': ['học sinh cấp 3', 'học lớp 12', 'học THPT'],
    'Sinh viên đại học / cao đẳng': ['sinh viên', 'đang học đại học', 'sinh viên ĐH-CĐ'],
    'Nhân viên văn phòng giờ hành chính': ['nhân viên văn phòng', 'làm văn phòng', 'nhân viên hành chính'],
    'Giáo viên / giảng viên / gia sư': ['giáo viên', 'giảng viên', 'gia sư'],
    'Công nghệ thông tin / làm việc sâu linh hoạt': ['lập trình viên', 'nhân viên IT', 'kỹ sư phần mềm'],
    'Quản lí / chủ doanh nghiệp / khởi nghiệp': ['quản lý', 'chủ doanh nghiệp', 'nhà quản lý'],
    'Nhân viên y tế lâm sàng': ['nhân viên y tế', 'bác sĩ điều dưỡng', 'nhân viên bệnh viện'],
    'Lao động thể lực / công nhân / thợ': ['công nhân', 'lao động phổ thông', 'thợ'],
    'Dịch vụ / bán lẻ / nhà hàng - khách sạn': ['nhân viên bán hàng', 'nhân viên dịch vụ', 'nhân viên nhà hàng'],
    'Lái xe / giao hàng / vận tải / hàng không': ['tài xế', 'nhân viên giao hàng', 'tài xế vận tải'],
    'Nông - lâm - ngư nghiệp': ['nông dân', 'lao động nông nghiệp', 'ngư dân'],
    'Sáng tạo / truyền thông / làm việc tự do': ['nhân viên sáng tạo', 'làm việc tự do', 'content creator'],
    'Thể thao - thể hình - dinh dưỡng': ['PT thể hình', 'huấn luyện viên', 'chuyên gia dinh dưỡng'],
    'Công an / bộ đội': ['công an', 'bộ đội', 'sĩ quan quân đội'],
    'Nội trợ / người chăm sóc': ['người nội trợ', 'người chăm sóc', 'ở nhà chăm sóc'],
    'Người về hưu / cao tuổi': ['người về hưu', 'cao tuổi', 'hưu trí'],
    'Lao động tự do / kinh doanh online / tình nguyện viên': ['kinh doanh online', 'lao động tự do', 'tình nguyện viên'],
    'Sinh viên / học sinh trường nghề': ['học sinh trường nghề', 'sinh viên trường nghề', 'học nghề'],
    'Học viên cao học / nghiên cứu sinh': ['nghiên cứu sinh', 'học viên cao học', 'thạc sĩ nghiên cứu'],
    'Học sinh tiểu học': ['học sinh tiểu học', 'em tiểu học'],
    'Học sinh THCS': ['học sinh cấp 2', 'học lớp 8-9'],
}

TASK_PARAPHRASE = {
    'Làm bài tập Toán': ['ôn toán', 'làm bài toán', 'học toán'],
    'Ôn từ vựng tiếng Anh': ['ôn từ tiếng Anh', 'luyện từ vựng', 'học từ vựng Anh'],
    'Làm bài tập Vật lí': ['ôn Vật lí', 'làm bài Lý', 'học Vật lí'],
    'Làm bài tập Hóa học': ['ôn Hóa', 'làm bài Hóa', 'học Hóa học'],
    'Làm bài tập Sinh học': ['ôn Sinh', 'học Sinh học', 'luyện Sinh'],
    'Làm bài tập Ngữ văn': ['ôn Văn', 'làm bài Văn', 'học Ngữ văn'],
    'Làm bài tập Lịch sử': ['ôn Sử', 'học Lịch sử', 'luyện Sử'],
    'Làm bài tập Địa lí': ['ôn Địa', 'học Địa lí', 'luyện Địa'],
    'Làm bài tập Tin học': ['ôn Tin', 'làm bài Tin', 'học Tin học'],
    'Học từ vựng tiếng Anh': ['ôn từ vựng Anh', 'luyện từ mới', 'học từ Anh'],
}

def paraphrase_job(title):
    if title in JOB_PARAPHRASE:
        import random
        random.seed(hash(title) % 10000)
        return random.choice(JOB_PARAPHRASE[title])
    return title

def paraphrase_task(name):
    if name in TASK_PARAPHRASE:
        import random
        random.seed(hash(name) % 10000)
        return random.choice(TASK_PARAPHRASE[name])
    # light generic
    if 'Toán' in name: return 'ôn toán'
    if 'tiếng Anh' in name.lower() or 'Anh' in name: return 'ôn tiếng Anh'
    if 'Vật lí' in name or 'Lý' in name: return 'ôn Vật lí'
    if 'Hóa' in name: return 'ôn Hóa học'
    if 'Sinh' in name: return 'ôn Sinh học'
    if 'Ngữ văn' in name or 'Văn' in name: return 'ôn Ngữ văn'
    if 'Lịch sử' in name or 'Sử' in name: return 'ôn Lịch sử'
    if 'Địa' in name: return 'ôn Địa lí'
    if 'Tin' in name: return 'ôn Tin học'
    return name

def main():
    in_path = os.path.join(DATA_DIR, 'golden_stage1.jsonl')
    out_path = os.path.join(DATA_DIR, 'golden_paraphrased.jsonl')
    samples = []
    with open(in_path) as f:
        for line in f:
            samples.append(json.loads(line))
    out_samples = []
    for s in samples:
        inp = json.loads(json.dumps(s['input']))  # copy
        outp = s['output']
        # paraphrase
        inp['profile']['job_title'] = paraphrase_job(inp['profile']['job_title'])
        for t in inp['tasks']:
            t['name'] = paraphrase_task(t['name'])
        out_samples.append({'input': inp, 'output': outp})
    with open(out_path, 'w', encoding='utf-8') as f:
        for s in out_samples:
            f.write(json.dumps(s, ensure_ascii=False) + '\n')
    print('done', len(out_samples), 'to', out_path)

if __name__ == '__main__':
    main()
