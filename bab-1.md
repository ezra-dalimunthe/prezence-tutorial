# 📘 BAB 1 — PERSIAPAN LINGKUNGAN PENGEMBANGAN

## 1.0 Spesifikasi yang Disarankan

Sebelum memulai pengembangan dengan Laravel 13, gunakan spesifikasi berikut sebagai acuan agar proses pembelajaran berjalan lancar:


| Komponen | Persyaratan yang Disarankan |
|---|---|
| **Sistem Operasi** | Windows 10 atau Windows 11 |
| **Memori (RAM)** | Minimal 4 GB — disarankan 8 GB |
| **PHP** | Versi **8.3 hingga 8.5** |
| **Penyimpanan** | Tersedia ruang kosong minimal 2 GB |

> Laravel 13 memerlukan PHP minimal versi 8.3. Pada saat tutorial ini ditulis, versi PHP yang didukung adalah 8.3 hingga 8.5. Untuk pembelajaran ini, kita akan menggunakan PHP versi 8.4.
>
> Nilai RAM dan ruang penyimpanan pada tabel di atas merupakan rekomendasi praktis agar proses pembelajaran berjalan lancar, bukan persyaratan resmi dari Laravel.

---

## 1.1 Tiga Pilihan Lingkungan Pengembangan

Sebelum memulai pengembangan aplikasi, kita perlu menyiapkan lingkungan kerja agar komputer dapat menjalankan kode program Laravel. Secara umum, terdapat tiga cara yang dapat digunakan untuk menyiapkan lingkungan pengembangan Laravel:

| No | Cara | Prinsip Kerja |
|:--:|:---|:---|
| 1 | Pemasangan PHP Secara Mandiri (Native) | Mengunduh dan mengonfigurasi PHP serta alat pendukung satu per satu secara manual. Paling ringan, hanya alat dasar |
| 2 | Penggunaan Docker / Laravel Sail | Menjalankan seluruh lingkungan di dalam wadah terpisah yang terisolasi dari sistem operasi utama. Banyak digunakan untuk menjaga konsistensi lingkungan tim; pada Windows, Docker Desktop umumnya menggunakan WSL 2 sebagai mesin pendukung |
| 3 | Penggunaan Laravel Herd | Menggunakan aplikasi pendukung yang menyediakan kebutuhan pengembangan secara terintegrasi dan siap pakai. Berjalan langsung di sistem Windows tanpa memerlukan WSL 2, sehingga praktis untuk pembelajaran |

Ketiga cara di atas dapat digunakan untuk mengembangkan aplikasi Laravel. Namun, dalam pembelajaran ini kita akan memilih satu cara yang paling sesuai dengan kebutuhan dan kemampuan perangkat yang digunakan.

---

## 1.2 Alasan Pemilihan Laravel Herd

Kita memilih **Laravel Herd** sebagai lingkungan pengembangan untuk pembelajaran ini dengan pertimbangan berikut:

### 1. Lengkap dan Siap Pakai
Laravel Herd menyediakan komponen utama yang dibutuhkan — yaitu PHP, server web Nginx, Node.js, Composer, dan Laravel Installer — dalam satu paket pemasangan. Siswa tidak perlu mengunduh, mengatur, atau mengonfigurasi setiap komponen secara terpisah. Hal ini mengurangi kemungkinan kesalahan konfigurasi pada tahap awal.

### 2. Tidak Memerlukan Teknologi Tambahan
Cara lain, khususnya Docker, memerlukan program tambahan serta WSL 2 pada sistem operasi Windows. Teknologi tersebut belum dipelajari dan berada di luar lingkup materi pada tahap ini. Laravel Herd berjalan langsung pada sistem Windows yang telah digunakan sehari-hari, sehingga tidak menambah beban materi baru yang belum relevan.

### 3. Efisien terhadap Sumber Daya Perangkat
Docker memerlukan program tambahan. Pada Windows, Docker Desktop umumnya menggunakan WSL 2 sebagai backend yang direkomendasikan. Docker Desktop beserta WSL 2 dapat memakan sumber daya tambahan dan berpotensi memperlambat komputer dengan RAM terbatas. Karena Herd berjalan secara native di Windows, konfigurasinya lebih sederhana dan dapat terasa lebih ringan dibandingkan Docker Desktop beserta WSL 2, terutama pada komputer dengan RAM terbatas.

### 4. Materi yang Dipelajari Tetap Berlaku Umum
Hal yang paling penting untuk dipahami adalah: **kode program yang ditulis menggunakan Laravel Herd sama persis** dengan kode yang ditulis menggunakan cara lain. Konsep, perintah, dan struktur aplikasi yang dipelajari dapat diterapkan pada lingkungan kerja apa pun, baik untuk keperluan belajar maupun lingkungan profesional.

---

## 1.3 Langkah Pemasangan Laravel Herd

Berikut adalah langkah-langkah pemasangan Laravel Herd:

### Langkah 1 — Mengunduh Aplikasi Laravel Herd
1. Buka browser yang tersedia.
2. Masukkan alamat: **herd.laravel.com**
3. Pilih versi untuk Windows dan mulailah pengunduhan.
4. Tunggu hingga proses pengunduhan selesai.

### Langkah 2 — Melakukan Pemasangan Laravel Herd
1. Buka folder tempat berkas tersimpan.
2. Jalankan berkas pemasangan. Windows mungkin meminta izin administrator selama proses pemasangan.
3. Ikuti petunjuk yang muncul pada layar hingga proses selesai.
4. Setelah selesai, buka aplikasi Herd untuk memulai proses pengaturan awal. Herd akan mengunduh versi PHP dan Node.js terbaru.

> Jika terdapat ikon Laravel Herd pada area pemberitahuan di bagian bawah layar, berarti pemasangan telah berhasil.

### Langkah 3 — Memastikan Kesiapan
Setelah proses pengaturan awal selesai, pastikan PHP 8.4 telah dipasang dan dipilih sebagai versi yang digunakan. Buka aplikasi Terminal atau PowerShell, lalu ketik perintah berikut:

```powershell
php --version
```

Jika nomor versi PHP 8.4 muncul, berarti lingkungan telah siap. Lakukan hal yang sama untuk memeriksa alat pendukung lainnya:

```powershell
composer --version
laravel --version
node --version
npm --version
```

Semua perintah di atas harus menampilkan informasi versi yang tersedia. Jika perintah belum dikenali, tutup dan buka kembali Terminal atau PowerShell agar perubahan PATH diterapkan.

---

## 1.4 Mengelola Versi PHP di Laravel Herd

Laravel Herd memiliki keunggulan dalam hal pengelolaan versi PHP — kita dapat mengubah versi yang digunakan kapan saja dengan mudah, baik untuk seluruh sistem maupun per proyek.

### Memeriksa Versi PHP Saat Ini

Buka Terminal atau PowerShell, lalu ketik:

```powershell
php --version
```

Pastikan versi yang muncul berada pada rentang **8.3 hingga 8.5**. Jika belum, ikuti langkah di bawah untuk mengubahnya.

### Mengubah Versi PHP Secara Keseluruhan

Ada dua cara yang dapat digunakan:

#### Cara 1 — Melalui Antarmuka Grafis
1. Klik ikon Laravel Herd pada area pemberitahuan di bagian bawah layar.
2. Dari menu Herd, pilih versi PHP yang ingin digunakan secara menyeluruh.
3. Untuk memasang atau mengelola beberapa versi PHP, buka **Pengaturan (Preferences)**, lalu pilih tab **PHP**.
4. Pilih versi **8.4** yang akan digunakan. Herd akan menerapkan perubahan secara otomatis.

#### Cara 2 — Melalui Perintah Terminal
```powershell
# Melihat daftar versi yang tersedia
herd php:list

# Menginstal versi PHP yang diperlukan
herd php:install 8.4

# Menggunakan versi tersebut secara menyeluruh
herd use 8.4
```

Verifikasi kembali dengan:
```powershell
php --version
```

### Menggunakan Versi PHP Berbeda per Proyek

Jika diperlukan, Herd dapat mengatur versi PHP yang berbeda untuk setiap proyek secara terpisah:

```powershell
# Masuk ke folder proyek
cd ~/Herd/web-sekolah

# Tetapkan versi PHP khusus untuk proyek ini
herd isolate 8.4
```

Dengan demikian, proyek `web-sekolah.test` akan selalu menggunakan PHP 8.4, terlepas dari versi PHP yang ditetapkan secara menyeluruh pada sistem. Perintah ini digunakan setelah proyek berada di folder yang dikelola Herd atau telah didaftarkan menggunakan `herd link`.

---

## 1.5 Gambaran Singkat Cara Lain

Berikut perbandingan ketiga cara tersebut agar Anda memiliki gambaran yang utuh:

| Cara | Kelebihan | Hal yang Perlu Diperhatikan |
|---|---|---|
| Pemasangan PHP Mandiri (Native) | Membutuhkan ruang penyimpanan yang kecil | Konfigurasi dilakukan secara manual; kesalahan pengaturan dapat menyebabkan aplikasi tidak berjalan |
| Docker / Laravel Sail | Lingkungan berjalan seragam di mana saja | Memerlukan pemahaman konsep baru serta program tambahan; pada Windows umumnya memerlukan WSL 2 |
| **Laravel Herd** ✅ | Pemasangan mudah, pengaturan otomatis, hemat sumber daya | Fitur layanan basis data lengkap tersedia pada versi berbayar; untuk pembelajaran, kita akan menggunakan basis data SQLite yang sudah cukup memadai |

> **Catatan:** Pada tahap lanjut atau saat bekerja di lingkungan kerja profesional, teknologi seperti Docker akan dipelajari dan digunakan. Namun untuk memahami konsep dasar dan cara kerja Laravel, Laravel Herd adalah pilihan yang paling tepat.

---

## 1.6 Layanan Pendukung untuk Pembelajaran

Laravel Herd sudah cukup untuk menjalankan aplikasi Laravel. Namun, tutorial ini juga menggunakan dua layanan pendukung untuk materi email dan database:

| Layanan | Kegunaan | Status |
|---|---|---|
| **smtp4dev** | Menangkap email yang dikirim aplikasi secara lokal | Opsional |
| **MySQL** | Menyediakan database relasional selain SQLite | Opsional |

### smtp4dev

`smtp4dev` adalah SMTP server lokal yang digunakan untuk menangkap email dari aplikasi. Dengan layanan ini, email tidak dikirim ke alamat email sungguhan, tetapi dapat dilihat melalui inbox lokal.

Pada tutorial ini, `smtp4dev` digunakan untuk mempelajari fitur pengiriman email Laravel. `smtp4dev` bukan persyaratan utama untuk menjalankan Laravel. Kita juga dapat menggunakan layanan SMTP lain, seperti Gmail atau layanan email lainnya.

Panduan instalasi dan konfigurasi `smtp4dev` tersedia pada [bab tambahan tentang smtp4dev dan MySQL](bab-tambahan-smtp4dev-mysql.md).

### MySQL

MySQL adalah salah satu database relasional yang dapat digunakan oleh Laravel. MySQL tidak wajib digunakan karena tutorial ini dapat berjalan menggunakan SQLite.

Selain MySQL, Laravel juga dapat menggunakan database lain, seperti MariaDB, PostgreSQL, dan database relasional lain yang didukung Laravel.

Pada tutorial ini, MySQL diperkenalkan sebagai pilihan database tambahan agar siswa memahami bahwa aplikasi Laravel tidak bergantung pada satu jenis database saja.

Panduan instalasi MySQL dan konfigurasi database tersedia pada [bab tambahan tentang smtp4dev dan MySQL](bab-tambahan-smtp4dev-mysql.md).

> **Catatan:** smtp4dev dan MySQL merupakan layanan pendukung. Keduanya tidak diperlukan untuk menjalankan Laravel secara dasar. Pilihan layanan dapat disesuaikan dengan kebutuhan dan lingkungan pengembangan.

---

## 📝 Ringkasan Bab Ini

Sebelum melanjutkan ke bab berikutnya, pastikan Anda telah memahami hal-hal berikut:

- ✅ Terdapat tiga cara untuk menyiapkan lingkungan pengembangan Laravel.
- ✅ Kita memilih Laravel Herd karena pemasangannya mudah dan tidak memerlukan Docker atau WSL 2, hemat sumber daya komputer, dan materi yang dipelajari tetap berlaku secara umum.
- ✅ Laravel Herd berjalan langsung pada sistem Windows tanpa memerlukan WSL 2 maupun Docker.
- ✅ Kode program yang ditulis dapat dipindahkan dan digunakan pada lingkungan kerja lainnya.
- ✅ smtp4dev dan MySQL merupakan layanan pendukung, bukan persyaratan utama Laravel.

> **Catatan:** Jika di kemudian hari Anda bertemu atau menggunakan cara lain, ingatlah bahwa perbedaannya hanya pada alat yang digunakan — cara penulisan kode program tetap sama. Setiap alat memiliki kegunaan pada tempat dan waktu yang tepat.

