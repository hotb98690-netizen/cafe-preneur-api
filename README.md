# Cafe Preneur — Online Research API

API backend sederhana untuk menghubungkan Live Chat Riset Cafe Preneur ke pencarian web online. Endpoint ini cocok dengan format yang digunakan file HTML Cafe Preneur:

- Request: `POST /api/research`
- JSON body: `{ "query": "modal buka cafe", "context": "bisnis cafe Indonesia" }`
- Response: `{ "answer": "...", "sources": [{ "title": "...", "url": "...", "excerpt": "..." }] }`

## Penting

API ini belum online hanya dengan mengunduh file ZIP. Deploy project ini ke akun hosting milik Anda, lalu tambahkan API key Tavily sebagai environment variable. Jangan pernah menaruh API key di file HTML.

## Deploy ke Vercel

1. Buat akun atau masuk ke https://vercel.com/
2. Buat repository GitHub baru dan unggah semua isi folder project ini, atau impor project dari GitHub ke Vercel.
3. Di pengaturan project Vercel, buka **Settings → Environment Variables**.
4. Tambahkan `TAVILY_API_KEY` dengan API key dari dashboard Tavily: https://tavily.com/
5. Tambahkan `ALLOWED_ORIGINS` untuk pengujian bisa diisi `*`. Setelah situs Cafe Preneur di-hosting, sebaiknya ganti dengan origin situs tersebut, misalnya `https://nama-situs-anda.vercel.app` (tanpa garis miring di akhir).
6. Deploy atau redeploy project.
7. Tes endpoint melalui browser dengan membuka `https://NAMA-PROJECT.vercel.app/api/research`. Harus muncul JSON status.
8. Tes POST dengan aplikasi Cafe Preneur, masukkan URL API lengkap `https://NAMA-PROJECT.vercel.app/api/research` di **Sumber Online → URL API riset/proxy backend**, lalu simpan dan tekan **Tes API riset**.

## Catatan sumber

Endpoint mengirim pertanyaan ke Tavily Search dan mengembalikan jawaban ringkas serta tautan sumber yang ditemukan. Hasil pencarian dapat tidak lengkap atau keliru; selalu periksa halaman sumber aslinya. Ketersediaan, batas penggunaan, dan harga Tavily mengikuti ketentuan penyedia.

## Keamanan produksi

- Simpan `TAVILY_API_KEY` hanya di environment variables hosting.
- Batasi `ALLOWED_ORIGINS` ke domain Cafe Preneur setelah domain diketahui.
- Sebelum membuka API ke publik luas, tambahkan autentikasi atau pembatasan penggunaan (rate limiting) untuk mencegah penyalahgunaan.
- Endpoint ini tidak menyimpan pertanyaan pengguna ke database.
