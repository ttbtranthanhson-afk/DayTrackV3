# Tài liệu Giao diện: Bảng Cài đặt Giờ Bận

## 1. Tổng quan

Bảng **Cài đặt Giờ Bận** là một bottom sheet modal (tấm trượt lên từ phía dưới màn hình), xuất hiện khi người dùng nhấn nút **"Khảo sát giờ bận"** trong trang Lịch học. Bảng này cho phép người dùng đánh dấu các khung giờ trong ngày mà họ không thể học, sau đó gọi AI để phân tích và sắp xếp lịch một cách khoa học.

---

## 2. Kích hoạt (Trigger)

- **Vị trí nút kích hoạt:** Trang Lịch học (`/timetable`), chế độ xem tuần (không phải "Hôm nay")
- **Hình dạng nút:**
  - Chiều rộng: 100% container (max 448px)
  - Chiều cao: 52px
  - Bo góc: 16px (`rounded-2xl`)
  - Viền: nét đứt (`border-dashed`), màu xanh lá nhạt (`border-green-200`)
  - Màu chữ và icon: xanh lá (`text-green-500`)
  - Nền: trong suốt, hover → xanh lá rất nhạt (`bg-green-50`)
  - Nội dung: icon kính lúp (16×16px) + chữ `"Khảo sát giờ bận"` (14px, font-semibold)
  - Nằm ngay phía dưới nút `"Tạo khối lịch trình mới"`, cách nhau 8px

---

## 3. Cấu trúc tổng thể của Modal

```
┌──────────────────────────────────┐
│            [Handle bar]          │  ← 4px, 40px wide, centered
├──────────────────────────────────┤
│  Cài đặt giờ bận        [✕]     │  ← Header
│  Nhấn giữ trên đường thời gian… │
├──────────────────────────────────┤
│                                  │
│       [TIMELINE DỌC]             │  ← Vùng cuộn dọc, cao cố định 320px
│                                  │
├──────────────────────────────────┤
│  ⚡ Nhấn giữ để đánh dấu…       │  ← Hint bar màu vàng nhạt
├──────────────────────────────────┤
│       [VÙNG CUỘN DỌC]           │  ← Phần còn lại, cuộn được
│  • Chip giờ bận (nếu có)        │
│  • Nút Gọi AI                   │
│  • Kết quả AI (nếu có)          │
└──────────────────────────────────┘
```

### Thông số chung của Modal

| Thuộc tính | Giá trị |
|---|---|
| Loại | Bottom sheet (trượt lên từ dưới) |
| Chiều rộng | 100% màn hình, tối đa 448px, căn giữa |
| Chiều cao tối đa | 90% chiều cao viewport (`max-h: 90vh`) |
| Bo góc trên | 24px (`rounded-t-3xl`) |
| Màu nền | Trắng (`#ffffff`) |
| Animation vào | Trượt lên từ `y: 100%` → `y: 0`, spring damping=30, stiffness=300 |
| Animation ra | Trượt xuống về `y: 100%` |
| Backdrop | Màu đen mờ 40% (`bg-black/40`), nhấn vào đóng modal |
| z-index | 50 (backdrop), 50 (modal), 60 (dialog xác nhận xóa) |

---

## 4. Chi tiết từng phần

### 4.1 Handle Bar

- **Vị trí:** Trên cùng của modal, căn giữa ngang
- **Kích thước:** rộng 40px, cao 4px
- **Bo góc:** tròn hoàn toàn (`rounded-full`)
- **Màu:** xám nhạt (`bg-gray-200`)
- **Khoảng cách:** padding top 12px, margin bottom 0

---

### 4.2 Header

- **Bố cục:** Flex row, space-between, padding ngang 20px, padding dọc 12px
- **Đường kẻ dưới:** 1px solid xám rất nhạt (`border-gray-50`)

#### Nhóm văn bản (bên trái):
- **Tiêu đề chính:** `"Cài đặt giờ bận"` — 18px, font-bold, màu `gray-900`
- **Phụ đề:** `"Nhấn giữ trên đường thời gian để đánh dấu giờ bận"` — 11px, font-medium, màu `gray-400`

#### Nút đóng (bên phải):
- Hình dạng: hình vuông 36×36px, bo góc 12px (`rounded-xl`)
- Màu nền: xám nhạt (`bg-gray-100`)
- Icon: dấu X, 16×16px, màu `gray-600`

---

### 4.3 Timeline (Đường Thời Gian Dọc)

Đây là thành phần trung tâm và phức tạp nhất.

#### Khung chứa timeline:
- **Chiều cao cố định:** 320px (`flex-shrink-0`)
- **Overflow:** ẩn (`overflow: hidden`) — cuộn được bằng JS thủ công
- **Màu nền:** trắng
- **Không có border riêng**

#### Vùng nội dung bên trong (Inner div):
- **Chiều cao thực:** 1.536px (24 giờ × 64px mỗi giờ)
- **touch-action:** `none` — tắt cuộn mặc định của trình duyệt, cuộn được xử lý bằng JS
- **cursor:** `crosshair` để gợi ý tương tác
- **Cuộn mặc định khi mở:** cuộn đến 7:00 sáng (vị trí `scrollTop = 7 × 64 = 448px`)

#### Tỉ lệ thời gian:
- 1 giờ = 64px chiều cao
- 1 phút = 64/60 ≈ 1.067px chiều cao
- Snap tự động mỗi 15 phút (= 16px)
- Tổng chiều cao: 24 × 64 = 1.536px

#### Cột giờ (Hour Labels + Grid Lines):
- **Vị trí:** Absolute, trải từ trên xuống dưới theo mỗi giờ
- **Cột nhãn giờ:** rộng 44px, text right
  - Font: 10px, font-bold, màu `gray-300`
  - Định dạng: `"7:00"`, `"8:00"`, ..., `"23:00"`
- **Đường kẻ ngang chính (mỗi giờ):** 1px, màu `gray-100`, kéo từ pixel 44 sang phải hết
- **Đường kẻ ngang phụ (30 phút):** 1px, màu `gray-50` (rất nhạt), bắt đầu từ pixel 44

---

#### Khối lịch trình (Schedule Blocks):

Hiển thị các buổi học đã được tạo sẵn tại vị trí thời gian tương ứng.

- **Vị trí:** Absolute, `left: 44px`, `right: 32px`
- **Top:** `giờBắtĐầu (phút) × (64/60)` px
- **Chiều cao:** `(giờKếtThúc - giờBắtĐầu) (phút) × (64/60)` px, tối thiểu 18px
- **Bo góc:** 12px (`rounded-xl`)
- **Màu nền:** màu pastel tương ứng với màu lịch (xanh-50, tím-50, xanh lá-50, v.v.)
- **Viền trái:** 4px solid màu đậm của lịch (xanh-400, tím-400, v.v.)
- **Nội dung:**
  - Tên lịch: 10px, font-bold, màu đậm tương ứng, cắt ngắn nếu dài
  - Giờ: 9px, màu `gray-400`, cắt ngắn

**Ví dụ cụ thể — khối "Toán học" (9:00–10:30):**
- top = (9×60) × (64/60) = 576px
- height = 90 phút × (64/60) = 96px
- Màu nền: `bg-blue-50`, viền trái: `border-blue-400`

---

### 4.4 Hệ thống Kim Đôi (Needle Pairs)

Đây là cơ chế chính để người dùng đánh dấu giờ bận.

#### Tạo cặp kim mới:

**Bước 1 — Nhấn giữ:**
- Người dùng chạm và giữ ngón tay trên bất kỳ vị trí nào trong timeline (không phải trên tay cầm kim)
- Sau **420ms** mà ngón tay không di chuyển quá 6px: kích hoạt chế độ tạo kim

**Bước 2 — Kim đầu xuất hiện:**
- Kim số 1 xuất hiện tại vị trí người dùng đang giữ
- Kim số 2 ban đầu trùng với kim số 1

**Bước 3 — Kéo để tạo vùng:**
- Người dùng kéo ngón tay lên hoặc xuống
- Kim số 2 di chuyển theo ngón tay (snap 15 phút)
- Vùng giữa 2 kim bôi màu đỏ nhạt (`bg-rose-500/25`)

**Bước 4 — Thả tay:**
- Cặp kim được lưu vào danh sách
- Vùng màu đỏ được giữ nguyên
- Cả 2 kim có thể kéo độc lập

---

#### Hình dạng một cây kim:

```
 ┌────────┐
 │ 9:00   │   ← Nhãn thời gian (badge)
 └────────┘
────────────────────────────────── ←── Đường ngang (1px)   ──────[▶]
                                                              ↑ Tay cầm tam giác
```

**Nhãn thời gian (Time Badge):**
- Kích thước: tự động theo nội dung
- Padding: 4px ngang, 2px dọc
- Bo góc: 4px (`rounded`)
- Font: 9px, font-bold
- Màu (kim đã đặt): viền `rose-300`, chữ `rose-500`, nền trắng
- Màu (đang tạo — kim thứ 2 đang kéo): nền `rose-500`, chữ trắng
- Màu (đang tạo — kim thứ 1 cố định): nền `rose-100`, chữ `rose-600`
- Vị trí: nằm trong cột trái rộng 44px, căn phải

**Đường ngang:**
- Chiều cao: 1px
- Màu (đã đặt): `rose-400`
- Màu (đang tạo kim 1): `rose-400`
- Màu (đang tạo kim 2 — đang kéo): `rose-500`
- Kéo dài từ pixel 44 đến hết chiều rộng container trừ 32px

**Tay cầm tam giác (Handle):**
- **Vùng chạm:** 32×32px để dễ nhấn trên mobile
- **Hình dạng:** tam giác nhọn chỉ sang phải (►)
  - Tạo bằng CSS border trick: `borderTop: 7px transparent`, `borderBottom: 7px transparent`, `borderLeft: 10px solid`
- **Màu (đã đặt):** `#f87171` (rose-400)
- **Màu (đang kéo):** `#ef4444` (rose-500)
- **Cursor:** `grab` (khi không kéo), `grabbing` (khi đang kéo)
- **touch-action:** `none`
- Thuộc tính DOM: `data-nh="true"` để phân biệt với vùng tạo kim

**Vị trí tổng thể của mỗi kim:**
- `position: absolute`
- `top: phút × (64/60) px`, `transform: translateY(-50%)` để căn giữa đường theo giờ
- Flex row: `[badge 44px] [đường ngang flex-1] [handle 32px]`
- z-index: 10 (kim đã đặt), 20 (kim đang tạo)

---

#### Vùng đỏ giữa 2 kim:

- **Vị trí:** Absolute, `left: 44px`, `right: 0`
- **Top:** `min(kimA, kimB) × (64/60)` px
- **Chiều cao:** `|kimA - kimB| × (64/60)` px
- **Màu nền (đã đặt):** `bg-rose-400/20` (đỏ nhạt 20% opacity)
- **Viền trên/dưới (đã đặt):** 1px solid `rose-200`
- **Màu nền (đang tạo):** `bg-rose-500/25` (đỏ nhạt 25% opacity)
- **Viền trên/dưới (đang tạo):** 1px solid `rose-400`
- **pointer-events:** none (không chặn tương tác bên dưới)

---

#### Kéo kim độc lập sau khi tạo:

- Người dùng nhấn vào tay cầm tam giác của kim A hoặc B
- Nếu di chuyển ngón tay > 4px trong vòng 420ms: kích hoạt kéo
- Kim di chuyển theo ngón tay, snap mỗi 15 phút
- Vùng đỏ tự động cập nhật theo vị trí 2 kim
- Nhãn thời gian cập nhật theo thời gian thực

---

#### Xóa một cặp kim:

- Người dùng nhấn giữ tay cầm tam giác của bất kỳ kim nào trong cặp
- Sau 420ms mà ngón tay không di chuyển > 4px: mở **Dialog xác nhận xóa**

**Dialog xác nhận xóa:**
- Vị trí: giữa màn hình (fixed, flex center)
- Backdrop: màu đen 20% (`bg-black/20`), nhấn vào hủy
- Hộp dialog:
  - Rộng tối đa 320px, padding 20px
  - Bo góc 24px (`rounded-3xl`)
  - Nền trắng, shadow đậm
  - Animation: scale 0.9 → 1.0
- **Icon:** thùng rác 20×20px, nền `rose-100`, bo góc 12px, màu `rose-500`
- **Tiêu đề:** `"Xóa khung giờ bận?"` — 14px, font-bold, `gray-800`, căn giữa
- **Phụ đề:** hiển thị khung giờ bị xóa, ví dụ `"9:00 – 11:00"` — 12px, `gray-400`, căn giữa
- **2 nút hành động** (flex row, gap 8px):
  - Nút **"Hủy":** flex-1, 12px padding dọc, bo góc 12px, nền `gray-100`, chữ `gray-600`
  - Nút **"Xóa":** flex-1, 12px padding dọc, bo góc 12px, nền `rose-500`, chữ trắng

---

### 4.5 Hint Bar (Thanh gợi ý)

- **Vị trí:** Nằm ngay dưới timeline, giữa timeline và phần body cuộn
- **Chiều cao:** tự động (khoảng 32px)
- **Màu nền:** vàng nhạt (`bg-amber-50`)
- **Viền trên/dưới:** 1px solid `amber-100`
- **Bố cục:** flex row, căn giữa, gap 8px
- **Nội dung:**
  - Chấm tròn 6×6px, màu `amber-400`, có animation `animate-pulse`
  - Chữ: `"Nhấn giữ trên đường thời gian → kéo để chọn vùng bận"` — 11px, font-semibold, màu `amber-700`

---

### 4.6 Phần thân cuộn (Body Area)

- **Layout:** `flex-1`, cuộn dọc (`overflow-y: auto`)
- **Padding:** 20px ngang, 16px trên, 24px dưới
- **Khoảng cách giữa các phần:** 12px

#### 4.6.1 Chips Giờ Bận (hiện khi có ít nhất 1 cặp kim)

- **Container:** bo góc 16px, nền `rose-50`, viền `rose-100`, padding 12px
- **Tiêu đề:** `"Khung giờ bận đã đặt"` — 12px, font-bold, `rose-600`
- **Chips (dạng pill):**
  - Flex wrap, gap 6px
  - Mỗi chip hiển thị 1 cặp: ví dụ `"9:00–11:00"`
  - Padding: 4px dọc, 10px ngang
  - Bo góc tròn hoàn toàn (`rounded-full`)
  - Màu: chữ `rose-600`, nền trắng, viền `rose-200`
  - Font: 11px, font-bold
  - Có icon X (10×10px) ở phải
  - Nhấn vào chip → mở dialog xác nhận xóa cặp kim đó

---

#### 4.6.2 Nút Gọi AI

- **Chiều rộng:** 100%
- **Chiều cao:** 56px (padding 16px dọc)
- **Bo góc:** 16px (`rounded-2xl`)
- **Màu nền:** gradient từ `violet-500` → `indigo-500` (từ trái sang phải)
- **Màu chữ:** trắng
- **Font:** 14px, font-bold
- **Shadow:** `shadow-md shadow-violet-100`
- **Trạng thái thường:**
  - Icon: Sparkles (16×16px, trắng)
  - Chữ: `"Gọi AI sắp xếp lịch"`
- **Trạng thái loading:**
  - Icon: spinner tròn 16×16px (border 2px, trắng)
  - Chữ: `"Đang phân tích lịch..."`
  - Opacity: 70% (`disabled:opacity-70`)
- **Hiệu ứng nhấn:** scale 0.98 (`active:scale-[0.98]`)

---

#### 4.6.3 Kết quả AI (hiện sau khi AI phân tích xong)

- **Animation:** fade in + slide up 8px
- **Container:** bo góc 16px, nền gradient `violet-50 → indigo-50`, viền `violet-100`, padding 16px

- **Header kết quả:**
  - Icon container: 24×24px, bo góc 8px, gradient `violet-500 → indigo-500`
  - Icon Sparkles: 12×12px, trắng
  - Chữ: `"Phân tích từ AI"` — 14px, font-bold, `violet-800`

- **Nội dung văn bản:**
  - Font: 12px, màu `violet-700`
  - Line-height: relaxed (1.625)
  - `white-space: pre-line` để giữ xuống hàng
  - Cấu trúc nội dung:
    - Tiêu đề lịch ngày + danh sách buổi học
    - Giờ bận đã đặt
    - Gợi ý sắp xếp khoa học (4 dòng bullet)

---

## 5. Luồng tương tác đầy đủ

```
Người dùng mở trang Lịch học
    ↓
Nhấn nút "Khảo sát giờ bận" (xanh lá, dashed border)
    ↓
Modal trượt lên từ phía dưới (spring animation)
    ↓
Timeline hiển thị các buổi học hiện tại tại đúng vị trí giờ
    ↓
Người dùng cuộn timeline để tìm vùng muốn đánh dấu
    ↓
Nhấn giữ tại vị trí bắt đầu (~420ms)
    ↓
Kim 1 xuất hiện tại vị trí đó (màu nhạt hơn)
Kim 2 cũng tại vị trí đó (đang chờ kéo)
    ↓
Kéo lên/xuống → Kim 2 đi theo + vùng đỏ xuất hiện
    ↓
Thả tay → cặp kim được lưu, vùng đỏ cố định
    ↓
(Tùy chọn) Kéo từng kim để điều chỉnh vị trí
(Tùy chọn) Giữ kim 420ms → dialog xác nhận xóa
(Tùy chọn) Tạo thêm cặp kim khác
    ↓
Nhấn "Gọi AI sắp xếp lịch"
    ↓
Spinner loading 2 giây
    ↓
Hiển thị phân tích AI với gợi ý sắp xếp lịch
    ↓
Nhấn ✕ hoặc backdrop để đóng modal
```

---

## 6. Bảng thông số kỹ thuật tổng hợp

| Thành phần | Giá trị |
|---|---|
| Thời gian nhấn giữ để tạo kim | 420ms |
| Ngưỡng di chuyển hủy nhấn giữ | 6px |
| Ngưỡng di chuyển để kéo kim | 4px |
| Snap thời gian | 15 phút |
| Tỉ lệ pixel/giờ | 64px |
| Tỉ lệ pixel/phút | 64/60 ≈ 1.067px |
| Tổng chiều cao timeline | 1.536px (24 × 64) |
| Chiều cao khung nhìn timeline | 320px |
| Cuộn mặc định khi mở | 7:00 sáng (scrollTop = 448px) |
| Màu vùng bận (đang tạo) | rose-500 / 25% opacity |
| Màu vùng bận (đã lưu) | rose-400 / 20% opacity |
| z-index backdrop | 50 |
| z-index modal | 50 |
| z-index dialog xóa | 60 |
| z-index kim đã đặt | 10 |
| z-index kim đang tạo | 20 |
| Thời gian giả lập AI | 2.000ms |

---

## 7. Các trạng thái giao diện

| Trạng thái | Mô tả |
|---|---|
| `idle` | Timeline bình thường, có thể cuộn dọc |
| `pending` | Người dùng đang giữ, chờ 420ms |
| `scrolling` | Người dùng đang cuộn (ngón tay di > 6px trước 420ms) |
| `creating` | Đang kéo để tạo cặp kim mới |
| Kim `dragging` | Đang kéo một kim đã tạo |
| `deleteTarget` | Dialog xác nhận xóa đang hiển thị |
| `aiLoading` | Nút AI đang loading |
| `aiResult` | Kết quả AI đã hiển thị |
