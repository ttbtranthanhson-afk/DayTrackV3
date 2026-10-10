
  # Design mobile productivity app

  This is a code bundle for Design mobile productivity app. The original project is available at https://www.figma.com/design/ZxnT9eDPW8I5rxesumQCZY/Design-mobile-productivity-app.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## AI (Google Gemini)

  Ứng dụng dùng Google Gemini để phân tích lịch trình (nút "Gọi AI sắp xếp lịch" trong bảng giờ bận, gợi ý theo từng khối lịch và gợi ý AI hàng ngày).

  ### Chạy local

  - Muốn test AI ngay bằng `npm run dev`: dán key vào `VITE_GEMINI_API_KEY` trong `.env` (chỉ dùng trên máy cá nhân, key sẽ nằm trong bundle).
  - Muốn test đúng luồng production (qua server, key không lộ): dùng `npx vercel dev` và dán key vào `GEMINI_API_KEY`.

  ### Deploy công khai (Vercel)

  1. Push code lên GitHub rồi import project vào Vercel (hoặc chạy `npx vercel`).
  2. Trong **Project Settings → Environment Variables**, thêm biến (không có tiền tố `VITE_`):
     - `GEMINI_API_KEY` = API key Gemini của bạn
     - `GEMINI_MODEL` = `gemini-2.5-flash` (tùy chọn)
     - `ALLOWED_ORIGINS` = danh sách domain phụ được phép gọi API, cách nhau bằng dấu phẩy (tùy chọn; domain của chính site luôn được phép)
  3. Deploy. Frontend gọi `POST /api/ai`, serverless function `api/ai.ts` giữ key và gọi Gemini. Key **không** xuất hiện trong bundle.

  > Bảo mật: key được gửi tới Google qua header `x-goog-api-key` (không nằm trong URL/log). Endpoint chỉ chấp nhận request `POST` có `Origin` hợp lệ (cùng domain hoặc nằm trong `ALLOWED_ORIGINS`), request kiểu `curl` không có `Origin` sẽ bị từ chối.
  >
  > Quan trọng: không đặt `VITE_GEMINI_API_KEY` trên môi trường production, nếu không key sẽ bị nhúng vào bundle phía client.

  