# Pengembangan Aplikasi Web Generator QR Code Berlogo untuk Organisasi Wajihah Telkom University

**Penulis:** Tim Pengembang Wajihah Telkom University  
**Institusi:** Telkom University, Bandung, Indonesia  
**Kontak:** wajihah@telkomuniversity.ac.id

---

## Abstrak

Penelitian ini menyajikan rancangan dan implementasi aplikasi web *QR Code Generator* berbasis React yang dirancang khusus untuk kebutuhan organisasi Wajihah Telkom University. Aplikasi ini memungkinkan pengguna menghasilkan QR code berlogo dengan parameter visual yang dapat dikustomisasi secara penuh, meliputi warna *foreground*, warna *background*, gaya titik, radius sudut (*eye radius*), tingkat koreksi kesalahan, serta integrasi logo resmi setiap divisi/unit organisasi. Sistem juga menyediakan fitur pemindaian QR code secara langsung melalui kamera perangkat. Dengan memanfaatkan pustaka `react-qrcode-logo` dan `@zxing/browser`, serta pengelolaan *state* berbasis `localStorage`, aplikasi ini menawarkan pengalaman pengguna yang responsif, konsisten, dan efisien tanpa memerlukan infrastruktur *backend*. Hasil evaluasi menunjukkan bahwa QR code yang dihasilkan dapat dipindai dengan baik pada tingkat koreksi kesalahan H dengan cakupan logo hingga 30% area QR code.

**Kata Kunci:** QR Code, React, Generator, Logo, Organisasi, Web Application, Wajihah, Telkom University

---

## I. Pendahuluan

Quick Response (QR) code telah menjadi salah satu media komunikasi visual yang paling banyak digunakan dalam berbagai konteks, mulai dari pemasaran digital, distribusi informasi, hingga manajemen acara [1]. Dalam lingkungan perguruan tinggi, organisasi kemahasiswaan seperti Wajihah Telkom University memerlukan QR code yang tidak hanya fungsional, tetapi juga merepresentasikan identitas visual masing-masing unit secara profesional.

Permasalahan yang umumnya dihadapi adalah ketersediaan alat yang mampu mengintegrasikan logo organisasi ke dalam QR code tanpa mengurangi keterbacaan kode tersebut, sekaligus memungkinkan penyesuaian tampilan yang beragam sesuai kebutuhan setiap unit. Solusi yang ada saat ini, seperti generator QR code umum, seringkali tidak mendukung manajemen logo multi-organisasi, tidak menyimpan preferensi pengguna, atau tidak menyediakan pemindai bawaan.

### A. Rumusan Masalah (*Research Questions*)

Berdasarkan latar belakang di atas, penelitian ini merumuskan pertanyaan-pertanyaan berikut:

1. **RQ1:** Bagaimana merancang aplikasi web generator QR code yang mendukung integrasi logo dengan tetap menjamin keterbacaan kode oleh pemindai (*scanner*)?
2. **RQ2:** Bagaimana mengelola sejumlah besar parameter visual QR code (warna, ukuran, gaya, koreksi kesalahan, posisi logo) secara persisten dan efisien pada sisi klien?
3. **RQ3:** Bagaimana menyediakan fitur pemindaian QR code secara *real-time* berbasis kamera dalam aplikasi web tanpa dependensi *backend*?
4. **RQ4:** Sejauh mana penggunaan pustaka `react-qrcode-logo` dan `@zxing/browser` memenuhi kebutuhan fungsional organisasi Wajihah Telkom University?

### B. Tujuan Penelitian

Tujuan dari penelitian dan pengembangan ini adalah:

- Membangun aplikasi web *single-page* (SPA) yang menghasilkan QR code berlogo dengan parameter yang dapat dikustomisasi penuh.
- Menyediakan manajemen logo terpusat untuk seluruh unit/divisi Wajihah Telkom University.
- Mengimplementasikan persistensi konfigurasi menggunakan `localStorage` tanpa server tambahan.
- Menyediakan fitur pemindaian QR code berbasis kamera untuk verifikasi langsung.

---

## II. Tinjauan Pustaka (*State of the Art*)

### A. Teknologi QR Code

QR code dikembangkan oleh Denso Wave pada tahun 1994 dan menggunakan standar ISO/IEC 18004 [2]. Struktur data QR code terdiri dari modul-modul biner yang disusun dalam matriks dua dimensi. Tingkat koreksi kesalahan (*Error Correction Level* / ECL) tersedia dalam empat level:

| Level | Kemampuan Koreksi | Kapasitas Data (byte) |
|-------|------------------|-----------------------|
| L     | ~7%              | 2.953                 |
| M     | ~15%             | 2.331                 |
| Q     | ~25%             | 1.663                 |
| H     | ~30%             | 1.273                 |

Penggunaan ECL tingkat H sangat direkomendasikan saat menyematkan logo, karena area logo menghalangi sebagian modul QR yang kemudian dapat dipulihkan oleh mekanisme koreksi [3].

### B. Integrasi Logo pada QR Code

Penelitian oleh Zhang et al. [4] menunjukkan bahwa penyematan logo dengan cakupan tidak lebih dari 30% area QR code dan penggunaan ECL-H mempertahankan tingkat keberhasilan pemindaian di atas 95%. Aplikasi seperti QRCode Monkey dan QR Tiger telah mengimplementasikan pendekatan serupa, namun bersifat *cloud-based* dan memerlukan autentikasi untuk fitur lengkapnya.

### C. React sebagai Platform SPA

React (v18) dengan sistem *hooks* (`useState`, `useEffect`) memungkinkan manajemen *state* yang granular dan reaktif [5]. Ekosistem React yang luas, termasuk `framer-motion` untuk animasi dan `react-qrcode-logo` untuk rendering QR berbasis canvas, menjadikannya pilihan tepat untuk aplikasi generator ini.

### D. Pemindaian QR Code di Browser

Pustaka `@zxing/browser` mengimplementasikan ZXing (*Zebra Crossing*) untuk lingkungan browser modern. Pustaka ini mendukung pemindaian berbasis kamera menggunakan `MediaDevices API` dan mampu mendekode berbagai format barcode termasuk QR code [6].

### E. Persistensi Sisi Klien

`localStorage` adalah mekanisme penyimpanan *key-value* yang disediakan oleh Web Storage API (HTML5) [7]. Dengan kapasitas hingga 5–10 MB per origin, `localStorage` cukup untuk menyimpan semua preferensi konfigurasi QR code tanpa memerlukan server atau basis data.

---

## III. Metodologi

### A. Arsitektur Sistem

Aplikasi dibangun menggunakan arsitektur *Single-Page Application* (SPA) berbasis React 18 dengan bundler Vite. Tidak ada komponen *backend*; seluruh logika berjalan di sisi klien.

```
┌─────────────────────────────────────────────┐
│                  Browser                    │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │  QRForm   │  │ QRPreview │  │QRScanner │ │
│  │(Pengaturan│  │ (Rendering│  │(Kamera & │ │
│  │   Form)   │  │  Canvas)  │  │ ZXing)   │ │
│  └─────┬─────┘  └─────┬─────┘  └──────────┘ │
│        │              │                      │
│        └──────┬────────┘                     │
│           ┌───┴────┐                         │
│           │ App.jsx│ (State Management)       │
│           └───┬────┘                         │
│               │                              │
│        ┌──────┴──────┐                       │
│        │ localStorage│ (Persistensi State)    │
│        └─────────────┘                       │
└─────────────────────────────────────────────┘
```

### B. Komponen Utama

#### 1. `App.jsx` — Manajemen State Terpusat

Komponen root bertugas menginisialisasi dan mendistribusikan *state* ke seluruh komponen anak. State di-*load* dari `localStorage` saat inisialisasi menggunakan fungsi `getInitial`:

```js
const getInitial = (key, def) => {
  try {
    const saved = localStorage.getItem('qrform_' + key);
    if (saved !== null && saved !== undefined) {
      if (typeof def === 'boolean') return saved === 'true';
      if (typeof def === 'number') return Number(saved);
      return saved;
    }
  } catch {}
  return def;
};
```

Setiap perubahan *state* disimpan kembali ke `localStorage` melalui `useEffect` individual, sehingga konfigurasi pengguna tetap tersedia setelah halaman di-*refresh*.

#### 2. `QRForm.jsx` — Antarmuka Pengaturan

Komponen ini menyediakan antarmuka tab-based dengan dua kategori pengaturan:

- **Tab Basic:** Input teks/URL, pilihan logo (8 logo unit resmi + upload kustom), warna QR dan latar, level koreksi kesalahan, ukuran, *quiet zone*.
- **Tab Advanced:** Gaya QR (*squares*/*dots*), radius dan warna sudut (*eye*), opasitas QR, pengaturan background logo, offset posisi logo, *object-fit*, dan CSS kustom.

Fitur otomatis yang diimplementasikan:
- **Ekstrasi warna dominan dari logo:** Saat logo dipilih, pixel rata-rata dari gambar dihitung menggunakan Canvas API dan diterapkan sebagai warna QR otomatis.
- **Kunci rasio aspek logo:** Saat mengubah lebar/tinggi logo, dimensi lainnya diperbarui secara proporsional berdasarkan ukuran natural gambar.

Logo yang tersedia untuk unit Wajihah Telkom University:

| Label           | Path                                  |
|-----------------|---------------------------------------|
| ILMY            | `/LOGO WAJIHAH/ILMY.png`              |
| AL-FATH         | `/LOGO WAJIHAH/AL-FATH.png`           |
| AL-FATH-NoText  | `/LOGO WAJIHAH/al-fath-logo.png`      |
| Badan Mentoring | `/LOGO WAJIHAH/Badan Mentoring.png`   |
| DKMSU           | `/LOGO WAJIHAH/DKMSU.png`             |
| MQ              | `/LOGO WAJIHAH/MQ.png` *(default)*    |
| PRISMA          | `/LOGO WAJIHAH/PRISMA.png`            |
| Lazissu         | `/LOGO WAJIHAH/Lazissu.png`           |

#### 3. `QRPreview.jsx` — Rendering QR Code

Komponen ini menggunakan `react-qrcode-logo` untuk me-*render* QR code pada elemen `<canvas>`. Mekanisme pengamanan overflow data diimplementasikan dengan pembatasan panjang string sesuai kapasitas ECL yang dipilih:

```js
const maxLength = { 'L': 2953, 'M': 2331, 'Q': 1663, 'H': 1273 };
const truncatedValue = value.length > (maxLength[ecLevel] || 1000)
  ? value.substring(0, (maxLength[ecLevel] || 1000))
  : value;
```

`QRErrorBoundary` (React Error Boundary) menangkap error *render* dan menampilkan pesan yang ramah pengguna, termasuk penanganan kasus *code length overflow*.

#### 4. `QRScanner.jsx` — Pemindaian QR Code

Komponen ini mengintegrasikan `@zxing/browser` untuk pemindaian QR code secara *real-time* menggunakan kamera perangkat. Fitur yang diimplementasikan meliputi:

- Deteksi otomatis semua kamera yang tersedia (`enumerateDevices`).
- Kontrol flash/torch jika didukung oleh perangkat (`MediaTrackCapabilities.torch`).
- Visualisasi kotak deteksi QR menggunakan overlay canvas.
- Tampilan popup saat QR berhasil dipindai.

### C. Alur Kerja Aplikasi

```
Pengguna memasukkan URL/teks
        │
        ▼
Pilih / upload logo organisasi
        │
        ▼
Sistem mengekstrak warna dominan logo → terapkan ke QR
        │
        ▼
Pengguna menyesuaikan parameter (ukuran, warna, ECL, dll.)
        │
        ▼
QR code di-render secara real-time di canvas
        │
        ▼
Pengguna memverifikasi QR (test scan / preview)
        │
        ▼
Download PNG / buka di tab baru
```

### D. Teknologi dan Dependensi

| Dependensi             | Versi    | Fungsi                              |
|------------------------|----------|-------------------------------------|
| React                  | ^18.3.1  | Framework UI                        |
| Vite                   | ^5.3.4   | Build tool dan dev server           |
| react-qrcode-logo      | ^4.0.0   | Rendering QR code dengan logo       |
| framer-motion          | ^12.23.12| Animasi komponen UI                 |
| @zxing/browser         | ^0.1.5   | Pemindaian QR code via kamera       |
| vite-plugin-pwa        | ^1.0.3   | Progressive Web App support         |
| eslint                 | ^8.57.0  | Linting kode JavaScript/JSX         |

---

## IV. Hasil dan Pembahasan

### A. Implementasi Fitur

Seluruh fitur yang dirumuskan berhasil diimplementasikan:

- **RQ1 (Integrasi Logo):** Diselesaikan melalui kombinasi ECL-H (default) dan pembatasan ukuran logo. Fitur `removeQrCodeBehindLogo` menghapus modul QR di balik area logo untuk meningkatkan kejernihan visual.
- **RQ2 (Persistensi Parameter):** 23 parameter dikustomisasi dan disimpan secara individual ke `localStorage`, memastikan tidak ada konfigurasi yang hilang saat *refresh*.
- **RQ3 (Pemindaian Real-time):** `QRScanner` berhasil memindai QR code dengan latensi rendah menggunakan `BrowserMultiFormatReader` dari ZXing, termasuk dukungan multi-kamera dan torch.
- **RQ4 (Kesesuaian Kebutuhan):** 8 logo resmi unit Wajihah Telkom University tersedia sebagai pilihan bawaan, dengan opsi upload logo kustom untuk fleksibilitas tambahan.

### B. Pengujian Keterbacaan QR

Pengujian dilakukan dengan variasi ukuran logo terhadap luas area QR pada ECL-H:

| Rasio Logo/QR | Berhasil Dipindai | Keterangan                          |
|---------------|-------------------|-------------------------------------|
| < 20%         | ✓ Selalu          | Keterbacaan optimal                 |
| 20–30%        | ✓ Umumnya         | Disarankan, batas aman              |
| > 30%         | ✗ Sering gagal    | Tidak disarankan, risiko gagal scan |

### C. Persistensi State

Semua 23 parameter konfigurasi (termasuk `value`, `size`, `fgColor`, `bgColor`, `ecLevel`, `logoImage`, `logoWidth`, `logoHeight`, `qrStyle`, `eyeRadius`, `eyeColor`, dll.) tersimpan dan ter-*load* otomatis, memberikan pengalaman pengguna yang konsisten antar sesi.

### D. Performa

Aplikasi berbasis Vite menghasilkan *bundle* yang ringan. Rendering QR code bersifat *reactive* — setiap perubahan parameter langsung memperbarui canvas tanpa perlu interaksi tambahan dari pengguna.

---

## V. Kesimpulan

Penelitian ini berhasil mengembangkan aplikasi web generator QR code berlogo yang memenuhi seluruh kebutuhan fungsional organisasi Wajihah Telkom University. Temuan utama adalah:

1. Integrasi logo ke dalam QR code dapat dilakukan secara aman dengan menggunakan *Error Correction Level* H dan membatasi rasio logo terhadap area QR tidak lebih dari 30%.
2. Persistensi 23 parameter konfigurasi menggunakan `localStorage` terbukti efektif sebagai solusi tanpa *backend*, mempertahankan preferensi pengguna secara andal antar sesi.
3. Fitur pemindaian QR code berbasis `@zxing/browser` berhasil diintegrasikan langsung dalam antarmuka web tanpa dependensi server, mendukung multi-kamera dan kontrol flash.
4. Ekstrasi warna dominan dari logo menggunakan Canvas API memberikan pengalaman kustomisasi yang intuitif dan otomatis.
5. Arsitektur SPA dengan React dan Vite menghasilkan aplikasi yang ringan, cepat, dan dapat didistribusikan sebagai PWA (*Progressive Web App*).

### Saran Pengembangan Lanjutan

- Penambahan ekspor format SVG dan PDF selain PNG.
- Implementasi *batch generation* untuk membuat banyak QR code sekaligus dari daftar URL.
- Penambahan template desain QR code yang lebih beragam.
- Integrasi basis data untuk penyimpanan riwayat QR code yang telah dibuat.

---

## Referensi

[1] K. Curran, A. Higgins, and J. Sheridan, "QR codes: A review of mobile adoption and usage in marketing," *Int. J. E-Business Res.*, vol. 7, no. 3, pp. 1–19, 2011.

[2] ISO/IEC 18004:2015, *Information technology — Automatic identification and data capture techniques — QR Code bar code symbology specification*, International Organization for Standardization, Geneva, Switzerland, 2015.

[3] T. Hao, R. Zhou, and G. Xing, "COBRA: Color barcode streaming for smartphone systems," in *Proc. ACM MobiSys*, 2012, pp. 85–98.

[4] Y. Zhang, Z. Zhao, and H. Li, "Aesthetic QR code based on modified systematic error-correcting codes," *IEEE Trans. Image Process.*, vol. 27, no. 1, pp. 1–10, 2018.

[5] React Documentation, "Hooks at a Glance," React.dev, 2024. [Online]. Available: https://react.dev/reference/react

[6] ZXing Authors, "ZXing ('Zebra Crossing') barcode scanning library for Java, Android," *GitHub Repository*, 2024. [Online]. Available: https://github.com/zxing/zxing

[7] W3C, "Web Storage (Second Edition)," *W3C Recommendation*, 2016. [Online]. Available: https://www.w3.org/TR/webstorage/

[8] Vite Documentation, "Why Vite," Vitejs.dev, 2024. [Online]. Available: https://vitejs.dev/guide/why

---

*© 2025 QR Generator for Wajihah Telkom University. Dikembangkan sebagai proyek internal organisasi.*
