# 📘 BAB TAMBAHAN — SMTP4DEV DAN MYSQL

Bab tambahan ini menjelaskan pemasangan dua layanan pendukung untuk tutorial Laravel:

- `smtp4dev` untuk menangkap email secara lokal;
- MySQL sebagai pilihan database relasional selain SQLite.

Keduanya bersifat opsional. Laravel tetap dapat dijalankan menggunakan Laravel Herd dan SQLite tanpa memasang kedua layanan ini.

---

## 1. smtp4dev

### 1.1 Apa Itu smtp4dev?

`smtp4dev` adalah SMTP server lokal yang dapat menangkap email dari aplikasi. Email tersebut tidak dikirim ke alamat email sungguhan, tetapi disimpan di inbox lokal agar dapat diperiksa selama proses pengembangan.

Alurnya:

```text
Laravel mengirim email
        ↓
smtp4dev menerima email
        ↓
Email dapat dilihat melalui inbox lokal
```

Dengan smtp4dev, kita dapat mempelajari fitur email Laravel tanpa menggunakan layanan email eksternal.

### 1.2 Mengunduh smtp4dev

1. Buka halaman proyek smtp4dev di GitHub:

   <https://github.com/rnwood/smtp4dev>

2. Buka bagian **Releases**.
3. Unduh installer yang sesuai untuk Windows.
4. Tunggu hingga proses pengunduhan selesai.

Gunakan rilis stabil terbaru yang tersedia. Nama berkas dapat berbeda bergantung pada versi smtp4dev.

### 1.3 Memasang dan Menjalankan smtp4dev

1. Jalankan berkas installer yang telah diunduh.
2. Ikuti instruksi pemasangan hingga selesai.
3. Jalankan aplikasi smtp4dev.
4. Buka browser dan kunjungi:

   ```text
   http://localhost:5000
   ```

Jika inbox smtp4dev tampil, berarti aplikasi sudah berjalan.

Secara umum, smtp4dev menggunakan port berikut:

| Fungsi | Nilai Umum |
|---|---:|
| Web interface | `5000` |
| SMTP | `2525` |

Port dapat berbeda jika diubah melalui pengaturan smtp4dev. Gunakan nilai yang ditampilkan oleh aplikasi jika konfigurasinya berbeda.

### 1.4 Konfigurasi Laravel

Pada berkas `.env` Laravel, gunakan konfigurasi SMTP lokal berikut:

```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@presensi.test"
MAIL_FROM_NAME="${APP_NAME}"
```

Setelah mengubah `.env`, bersihkan cache konfigurasi Laravel jika diperlukan:

```powershell
php artisan config:clear
```

Setelah aplikasi mengirim email, buka kembali:

```text
http://localhost:5000
```

Email yang dikirim aplikasi seharusnya muncul pada inbox smtp4dev.

### 1.5 Alternatif smtp4dev

`smtp4dev` hanya digunakan sebagai mail server lokal untuk pembelajaran. Pada lingkungan lain, Laravel dapat menggunakan:

- Gmail SMTP;
- Mailtrap;
- layanan email transactional;
- SMTP server milik organisasi.

Konfigurasi setiap layanan dapat berbeda. Jangan menyimpan password email pada repository atau membagikannya kepada orang lain.

---

## 2. MySQL

### 2.1 Apa Itu MySQL?

MySQL adalah sistem database relasional yang dapat digunakan oleh Laravel untuk menyimpan data aplikasi.

Pada tutorial ini, SQLite tetap dapat digunakan sebagai database utama karena lebih sederhana. MySQL disediakan sebagai pilihan tambahan untuk mengenalkan penggunaan database server.

Laravel juga mendukung database lain, seperti MariaDB dan PostgreSQL.

### 2.2 Mengunduh MySQL untuk Windows

1. Buka halaman resmi MySQL:

   <https://dev.mysql.com/downloads/installer/>

2. Unduh **MySQL Installer for Windows**.
3. Pilih installer Community jika tersedia.
4. Jalankan installer setelah proses pengunduhan selesai.

### 2.3 Memasang MySQL Server

1. Pilih tipe pemasangan yang menyediakan **MySQL Server**.
2. Ikuti instruksi pemeriksaan kebutuhan sistem.
3. Gunakan port default `3306`, kecuali port tersebut sudah digunakan program lain.
4. Buat password untuk user `root` dan simpan dengan aman.
5. Biarkan MySQL dikonfigurasi sebagai Windows Service agar dapat dijalankan secara otomatis.
6. Selesaikan proses pemasangan.

MySQL Workbench dapat ikut dipasang sebagai aplikasi visual untuk mengelola database. Namun, Workbench tidak wajib digunakan karena database juga dapat dikelola melalui Laravel atau command line.

### 2.4 Memeriksa Instalasi MySQL

Buka Terminal atau PowerShell, lalu jalankan:

```powershell
mysql --version
```

Jika perintah `mysql` belum dikenali, tambahkan folder `bin` MySQL ke PATH Windows atau gunakan MySQL Command Line Client yang disediakan oleh installer.

Untuk masuk ke MySQL:

```powershell
mysql -u root -p
```

Masukkan password `root` yang dibuat saat instalasi.

### 2.5 Membuat Database untuk Laravel

Setelah masuk ke MySQL, buat database untuk aplikasi:

```sql
CREATE DATABASE presensi_laravel;
```

Keluar dari MySQL dengan perintah:

```sql
exit;
```

### 2.6 Konfigurasi Laravel Menggunakan MySQL

Pada berkas `.env`, ubah konfigurasi database menjadi:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=presensi_laravel
DB_USERNAME=root
DB_PASSWORD=password_root_anda
```

Sesuaikan `DB_PASSWORD` dengan password yang dibuat saat instalasi.

Setelah itu, jalankan migration untuk menguji koneksi:

```powershell
php artisan migrate
```

Jika migration berhasil dijalankan, Laravel telah berhasil terhubung dengan MySQL.

### 2.7 Kembali Menggunakan SQLite

Jika ingin kembali menggunakan SQLite, ubah konfigurasi `.env` sesuai kebutuhan proyek. Laravel versi baru biasanya menggunakan SQLite sebagai pilihan sederhana pada saat pembuatan project.

MySQL, MariaDB, PostgreSQL, dan SQLite dapat digunakan secara bergantian selama konfigurasi database dan dukungan driver telah disiapkan dengan benar.

---

## Ringkasan

- `smtp4dev` digunakan untuk menangkap email Laravel secara lokal.
- Inbox smtp4dev umumnya dapat dibuka melalui `http://localhost:5000`.
- SMTP lokal smtp4dev umumnya menggunakan port `2525`.
- MySQL adalah pilihan database tambahan selain SQLite.
- MySQL umumnya menggunakan port `3306`.
- Laravel juga dapat menggunakan MariaDB, PostgreSQL, dan database lain yang didukung.
- smtp4dev dan MySQL bukan persyaratan utama untuk menjalankan Laravel.
