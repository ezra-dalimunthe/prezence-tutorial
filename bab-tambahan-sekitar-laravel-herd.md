# 📘 BAB TAMBAHAN — SEKITAR LARAVEL HERD

## Tujuan Pembelajaran
Setelah mempelajari bab ini, Anda diharapkan dapat:
- Memahami komponen penyusun Laravel Herd
- Mengetahui cara kerja server web dan pemroses kode
- Mengetahui lokasi berkas pengaturan serta alasan tidak mengubahnya secara manual

---

## 1 Komponen Utama Laravel Herd

Laravel Herd bukanlah satu program saja. Ia terdiri dari beberapa program yang bekerja bersama-sama sebagai satu kesatuan:

| Komponen | Fungsi |
|---|---|
| **Server Web Nginx** | Menerima permintaan dari peramban, mengirimkan berkas kepada pengguna, dan meneruskan permintaan kode ke PHP |
| **PHP-FPM** | Memproses kode program Laravel, menjalankan perintah, menyusun halaman yang akan ditampilkan |
| **Pengelola Konfigurasi** | Membuat dan memperbarui pengaturan secara otomatis saat proyek ditambah, diubah, atau dihapus |
| **Pembantu Alamat** | Mengatur agar nama seperti `web-sekolah.test` dapat dikenali oleh komputer |

> Kesemuanya dipasang sekaligus dan berjalan secara otomatis di latar belakang.

---

## 2 Cara Kerja Secara Umum

Ketika Anda mengetik `web-sekolah.test` di peramban, urutan proses yang terjadi adalah sebagai berikut:

```
1. Anda mengetik alamat di peramban
        ↓
2. Sistem membaca berkas `hosts` → mengetahui alamat tujuan adalah komputer sendiri
        ↓
3. Permintaan diterima oleh Server Web Nginx
        ↓
4. Nginx meneruskan kode PHP ke PHP-FPM untuk diproses
        ↓
5. Hasil dikembalikan ke Nginx → ditampilkan sebagai halaman web
```

Susunan ini **sama persis** dengan cara kerja situs web di internet.

---

## 3 Konfigurasi Server Web

Agar Nginx mengenali alamat proyek Anda, Laravel Herd membuat pengaturan secara otomatis. Bentuk dasarnya adalah sebagai berikut:

```nginx
server {
    listen 80;
    server_name web-sekolah.test;
    root C:/Users/NamaAnda/Herd/web-sekolah/public;
}
```

### Penjelasan Singkat
- `listen 80` → Server siap menerima permintaan pada port standar web
- `server_name web-sekolah.test` → Nama alamat yang akan dilayani
- `root .../public` → Folder utama tempat berkas aplikasi berada

> Bagian lengkapnya mencakup pengaturan untuk meneruskan kode ke PHP serta aturan keamanan. Semua ini ditulis otomatis oleh Herd.

---

## 4 Berkas `hosts` — Peta Alamat Lokal

Di sistem operasi Windows terdapat berkas khusus yang berfungsi menerjemahkan nama alamat menjadi lokasi komputer.

### Lokasi Berkas
```
C:\Windows\System32\drivers\etc\hosts
```

### Isi yang Dibuat Otomatis
```
# Herd generated Hosts. Do not change.
127.0.0.1   web-sekolah.test
127.0.0.1   proyek-lain.test
# End Herd generated Hosts
```

Artinya:
- `127.0.0.1` adalah alamat yang menunjuk ke **komputer Anda sendiri**
- Setiap nama yang terdaftar di sini akan diarahkan langsung ke komputer tersebut

---

## 5 Penting: Mengapa Tidak Mengubah Secara Manual?

Anda tidak disarankan menyunting berkas-berkas di atas secara mandiri, dengan alasan berikut:

| Alasan | Keterangan |
|---|---|
| **Dapat tertimpa** | Saat Herd memperbarui daftar proyek, perubahan manual dapat hilang |
| **Mengganggu fungsi** | Pengaturan yang tidak tepat dapat menyebabkan situs tidak dapat diakses |
| **Tidak perlu** | Semua perubahan yang dibutuhkan dapat dilakukan melalui perintah Herd |
| **Dibersihkan otomatis** | Jika Herd dihapus nanti, semua catatan tersebut akan dihapus sendiri oleh sistem |

> ✅ **Cara yang Benar:** Gunakan perintah `laravel new` atau `herd link` untuk menambahkan proyek. Biarkan Herd yang mengurus berkas pengaturan di belakang layar.

---

## 📝 Ringkasan Bab Ini

Sebelum melanjutkan, pastikan Anda telah memahami:

- ✅ Laravel Herd terdiri dari Nginx, PHP-FPM, dan alat pengelola otomatis
- ✅ Nginx berperan sebagai server web, PHP-FPM menjalankan kode program
- ✅ Nama alamat seperti `web-sekolah.test` dicatat dalam berkas `hosts`
- ✅ Semua konfigurasi Nginx dan berkas `hosts` dikelola secara otomatis
- ✅ **Jangan menyunting berkas pengaturan secara manual** — gunakan perintah yang disediakan
- ✅ Susunan kerja ini sama dengan server web sesungguhnya

---

Bagaimana menurut Anda? Apakah sudah sesuai dengan gambaran yang ingin Anda sampaikan kepada siswa? 😊