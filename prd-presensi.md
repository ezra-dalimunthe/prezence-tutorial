# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Sistem Presensi Siswa

**Status:** Draft

**Versi:** 1.0

**Target pengembangan:** Tutorial Laravel 13 pada Windows

---

## 1. Ringkasan Produk

Sistem Presensi Siswa adalah aplikasi web sederhana untuk membantu guru atau petugas sekolah mencatat kehadiran siswa dan melihat laporan presensi.

Aplikasi ini dibuat sebagai proyek pembelajaran Laravel. Walaupun sederhana, aplikasi mencakup beberapa konsep penting, yaitu halaman statis, autentikasi, role-based access, CRUD data, relasi data, pencatatan presensi, validasi formulir, dan laporan.

---

## 2. Latar Belakang

Pencatatan kehadiran siswa sering dilakukan secara manual menggunakan buku atau lembar kerja. Cara tersebut dapat menyulitkan ketika data perlu diperiksa kembali atau diringkas menjadi laporan.

Aplikasi ini menyediakan tempat sederhana untuk menyimpan data siswa, mencatat presensi berdasarkan tanggal, dan melihat rekap kehadiran.

---

## 3. Masalah yang Ingin Diselesaikan

Aplikasi ini dibuat untuk membantu menyelesaikan masalah berikut:

- data siswa belum tersimpan secara teratur;
- pencatatan kehadiran masih dilakukan secara manual;
- data presensi sulit dicari berdasarkan tanggal atau siswa;
- pembuatan rekap kehadiran membutuhkan waktu;
- pengguna belum memiliki gambaran sederhana tentang hubungan data siswa dan data presensi.

---

## 4. Tujuan Produk

Tujuan aplikasi adalah:

- menyediakan data siswa yang dapat dikelola melalui browser;
- memungkinkan pengguna mencatat kehadiran siswa;
- menyimpan riwayat presensi berdasarkan tanggal;
- menampilkan laporan presensi yang mudah dibaca;
- menjadi contoh proyek praktis untuk mempelajari Laravel 13.

---

## 5. Pengguna Sasaran

### 5.1 Administrator (Role: `admin`)

`Admin` adalah pengguna yang mengelola akun pengguna dan data dasar aplikasi. Akun awal `admin` dibuat melalui database seeder.

`Admin` dapat membuat dan mengelola akun `teacher`, `student`, dan `staff` secara manual melalui aplikasi atau melalui proses import file CSV untuk `teacher` dan `student`.

### 5.2 Teacher (Role: `teacher`)

Pengguna utama yang mengelola data `Student`, mencatat `Attendance`, dan melihat laporan. `Teacher` dapat mencatat presensi sesuai `TeachingAssignment` yang dimilikinya.

### 5.3 Student (Role: `student`)

`Student` merupakan objek yang datanya dicatat dalam aplikasi sekaligus pengguna yang dapat login. Setiap `Student` memiliki akun `User` yang terhubung dengan data `Student` tersebut. Setelah login, `Student` hanya dapat melihat riwayat `Attendance` miliknya sendiri.

> Pada versi awal, aplikasi sudah memiliki sistem login. Sistem menyediakan fitur sesuai dengan `Role` pengguna yang sedang login.

### 5.4 Staff (Role: `admin` atau `report_viewer`)

`Staff` merupakan profile pengguna yang memiliki data `name` dan `position`. Nilai `position` berupa teks, misalnya `Kepala Sekolah`, `Tata Usaha`, atau posisi lainnya.

`Staff` dapat memiliki salah satu role berikut:

- `admin`: mengelola akun dan data aplikasi;
- `report_viewer`: melihat laporan `Attendance` seluruh `Student`.

Role `report_viewer` tidak dapat mengubah data master, mencatat Attendance, atau mengelola akun.

`User` tidak menyimpan field `name`. Nama pengguna disimpan pada profile `Teacher`, `Student`, atau `Staff`. Relasi antara `User` dan profile menggunakan polymorphic relation bernama `profile`.

---

## 6. Ruang Lingkup Versi Awal

### 6.1 Fitur yang Termasuk

Versi awal aplikasi mencakup:

- login dan autentikasi pengguna;
- pembagian hak akses berdasarkan `Role`;
- pembuatan akun awal `admin` melalui database seeder;
- pengelolaan akun `teacher`, `student`, dan `staff` oleh `admin`;
- import data profile `teacher` dan `student` melalui file CSV;
- pengelolaan password sementara dan perubahan password oleh pengguna;
- pengiriman email akun menggunakan Laravel Mail;
- pengelolaan `Teacher` oleh `Admin`;
- pengelolaan `Subject` oleh `Admin`;
- pengelolaan `ClassRoom` secara terpisah oleh `Admin`;
- pengelolaan `TeachingAssignment` oleh `Admin`, yang menghubungkan `Teacher`, `Subject`, dan `ClassRoom`;
- halaman beranda atau dashboard;
- halaman statis tentang aplikasi;
- halaman petunjuk penggunaan;
- CRUD data `Student`;
- pencatatan `Attendance` oleh `Teacher`;
- perubahan dan penghapusan `Attendance` oleh `Teacher` yang berwenang;
- riwayat `Attendance` milik `Student`;
- laporan `Attendance` berdasarkan `TeachingAssignment` dan `Student`;
- laporan `Attendance` seluruh `Student` untuk role `report_viewer`;
- ringkasan jumlah setiap status `Attendance`.

### 6.2 Fitur yang Tidak Termasuk

Fitur berikut belum termasuk dalam versi awal:

- pengelolaan jadwal pelajaran;
- pengelolaan tahun ajaran;
- notifikasi kepada orang tua;
- export laporan ke Excel atau PDF;
- aplikasi mobile;
- API;
- integrasi dengan sistem sekolah lain.

Fitur-fitur tersebut dapat dipertimbangkan sebagai pengembangan lanjutan.

---

## 7. Fitur Produk

### 7.1 Beranda atau Dashboard

Beranda memberikan gambaran singkat tentang aplikasi dan menyediakan navigasi menuju fitur utama.


Informasi yang dapat ditampilkan pada beranda sesuai dengan `Role`:

`teacher`:
- jumlah siswa;
- jumlah presensi hari ini;
- ringkasan status kehadiran hari ini;
- tautan menuju data `Student`, `Attendance`, dan laporan.

`student`:
- jumlah kehadiran per bulan;
- filter berdasarkan `Subject`;
- tautan menuju riwayat `Attendance` miliknya sendiri.
 

### 7.2 Halaman Statis

Aplikasi menyediakan halaman yang isinya tidak bergantung pada data database.

Halaman tersebut dapat berupa:

- **About:** penjelasan singkat tentang aplikasi;
- **How To:** langkah penggunaan aplikasi;
- **Contact:** informasi pembuat atau pengelola aplikasi.

Halaman statis digunakan untuk memperkenalkan konsep halaman dan navigasi sebelum masuk ke fitur yang menggunakan database.

### 7.3 Data Student

`Admin` dapat membuat dan mengelola akun serta data `Student` secara manual atau melalui import CSV. `Teacher` dapat melihat data `Student` yang berada pada `ClassRoom` terkait dengan `TeachingAssignment` miliknya.

Data minimal `Student`:

- nama lengkap;
- `nis` atau nomor induk siswa;
- `ClassRoom`;
- `gender`;
- `birth_date`;
- `birth_place`;
- email akun pada `User`;
- akun `User` yang terhubung dengan `Student`.

`nis` harus unik untuk setiap `Student`.
Email harus disimpan pada `User` dan harus unik untuk setiap akun.

Operasi yang tersedia:

- melihat daftar `Student`;
- melihat detail `Student`;
- menambah `Student`;
- mengubah data `Student`;
- menghapus `Student`.

`Admin` dapat mengelola akun `Student` saat menambahkan atau mengubah data `Student`. `Student` hanya dapat melihat data dan riwayat `Attendance` miliknya sendiri setelah login.

### 7.4 User dan Account Management

`Admin` dapat mengelola akun pengguna dengan operasi berikut:

- melihat daftar `User`;
- membuat akun `teacher` secara manual;
- membuat akun `student` secara manual;
- membuat akun `staff` secara manual;
- mengubah data akun;
- mengaktifkan atau menonaktifkan akun;
- membuat atau mengatur ulang password sementara.
- mengirimkan informasi akun melalui email.

Data minimal `Teacher`:

- nama lengkap;
- `mobile_phone`;
- akun `User` yang terhubung dengan `Teacher`.

`mobile_phone` harus unik untuk setiap `Teacher`.
Email akun `Teacher` disimpan pada `User` dan harus unik. `User` terhubung dengan profile menggunakan polymorphic relation bernama `profile`.

Data minimal `Staff`:

- nama lengkap;
- `position` maksimal 50 karakter;
- akun `User` yang terhubung dengan `Staff`;
- role `admin` atau `report_viewer`.

Pada versi awal, profile `Staff` dan akun awal `admin` tidak dibuat melalui formulir aplikasi. Keduanya dibuat menggunakan database seeder dan dihubungkan melalui polymorphic relation `profile`.

### 7.5 Authentication dan Password

Pengguna login menggunakan login identifier dan password.

| Role | Login Identifier | Password |
|---|---|---|
| `admin` | Email yang dibuat pada database seeder | Dibuat pada database seeder |
| `teacher` | `mobile_phone` | Password sementara dari `Admin` |
| `student` | `nis` dan `birth_date` dengan format `YYYY-MM-DD` | Password sementara dari `Admin` |
| `report_viewer` | Email akun `User` | Password sementara dari `Admin` |

Aturan password:

- `Admin` dapat membuat password sementara saat membuat akun;
- `Admin` dapat membuat password sementara baru jika pengguna lupa password;
- `Teacher`, `Student`, dan `Staff` dapat mengubah password sendiri setelah login;
- password harus disimpan dalam bentuk hash dan tidak boleh disimpan sebagai teks biasa;
- temporary password dikirimkan ke alamat email yang terdaftar;
- `Teacher`, `Student`, dan `Staff` diwajibkan mengganti temporary password saat login pertama.

Email dikirim menggunakan Laravel Mail melalui SMTP lokal `smtp4dev`. Pada lingkungan pembelajaran, email tidak dikirim ke layanan email eksternal, tetapi ditangkap oleh `smtp4dev` untuk diperiksa melalui inbox lokal.

> Catatan: tanggal lahir tidak selalu unik. Detail cara membedakan dua `Student` dengan tanggal lahir yang sama, misalnya menggunakan `nis` sebagai identifier tambahan, akan ditentukan dalam SRS.

### 7.6 Import User melalui CSV

`Admin` dapat mengimpor data profile `Teacher` dan `Student` melalui dua file CSV yang berbeda:

- `teacher.csv` untuk data `Teacher`;
- `student.csv` untuk data `Student`.

File CSV tidak memiliki kolom `email` dan tidak langsung membuat credential `User`. Setelah data berhasil diimpor, `Admin` membuat credential untuk setiap profile dengan memasukkan email. Sistem kemudian membuat password sementara dan mengirimkannya ke email tersebut.

Proses import harus:

- menerima file dengan format CSV;
- membedakan format `teacher.csv` dan `student.csv`;
- memvalidasi header dan struktur kolom;
- memvalidasi setiap baris data;
- melewati data `Student` dengan `nis` yang sudah tersimpan;
- menolak atau melaporkan data lain yang tidak valid;
- mendeteksi data duplikat;
- menampilkan ringkasan jumlah data berhasil dan gagal diimpor.

`nis` harus unik. Jika `nis` pada `student.csv` sudah ada di database, baris tersebut tidak diimpor dan dicatat dalam hasil import.

`mobile_phone` pada `Teacher` harus unik. Email divalidasi ketika `Admin` membuat credential `User`, bukan ketika file CSV diimpor. Email pada `User` harus unik untuk semua Role.

Detail nama kolom, aturan validasi, dan format pesan kesalahan akan ditentukan dalam SRS.

### 7.7 Subject dan ClassRoom

`Subject` merupakan master data mata pelajaran yang dikelola oleh `Admin`. Satu `Subject` dapat digunakan pada beberapa `ClassRoom` dan dapat diajarkan oleh beberapa `Teacher`.

`ClassRoom` merupakan kelompok belajar siswa yang dikelola oleh `Admin`. Level kelas dapat berupa `X`, `XI`, atau `XII`, sedangkan nama `ClassRoom` dapat membedakan kelompok seperti `X-A` dan `X-B`.

Data minimal `Subject`:

- nama subject.

Data minimal `ClassRoom`:

- nama `ClassRoom`;
- level `ClassRoom`.

Pada database, data `ClassRoom` disimpan pada tabel `class_rooms`. Nama model dan tabel ini digunakan secara konsisten pada implementasi Laravel.

### 7.8 TeachingAssignment

`TeachingAssignment` menghubungkan satu `Teacher`, satu `Subject`, dan satu `ClassRoom`. Entitas ini digunakan untuk menentukan konteks pengajaran dan presensi.

Contoh:

```text
Teacher: Budi
Subject: Matematika
ClassRoom: X-A
```

`Admin` dapat membuat `TeachingAssignment`. Satu `Teacher` dapat memiliki banyak `TeachingAssignment`. Satu `Subject` juga dapat digunakan pada banyak `TeachingAssignment` untuk `ClassRoom` atau `Teacher` yang berbeda.

Pada versi awal, `TeachingAssignment` tidak memiliki jadwal. Presensi dapat dicatat berdasarkan assignment dan waktu pencatatan.

### 7.9 Attendance

`Teacher` dapat mencatat status kehadiran `Student` berdasarkan `TeachingAssignment` tertentu.

Status presensi yang digunakan:

- Hadir;
- Izin;
- Sakit;
- Alpa.

Data minimal `Attendance`:

- `Student`;
- `TeachingAssignment`;
- tanggal dan waktu presensi (`attendance_datetime`);
- status kehadiran;
- catatan tambahan jika diperlukan.

Operasi yang tersedia:

- melihat daftar `Attendance` sesuai hak akses;
- menambah `Attendance`;
- mengubah `Attendance`;
- menghapus `Attendance`.

Pada frontend, tanggal presensi secara default menampilkan tanggal saat ini dan dapat diubah jika diperlukan. Daftar `Student` yang ditampilkan harus sesuai dengan `ClassRoom` pada `TeachingAssignment` yang dipilih. Saat disimpan, data menggunakan format tanggal dan waktu.

### 7.10 Laporan Attendance

Pengguna dapat melihat data `Attendance` dalam bentuk laporan sesuai hak aksesnya.

Laporan minimal menyediakan:

- filter berdasarkan tanggal atau rentang tanggal;
- filter berdasarkan `TeachingAssignment`;
- filter berdasarkan `Student`;
- daftar tanggal dan waktu, nama `Student`, `ClassRoom`, `Subject`, `Teacher`, dan status kehadiran;
- jumlah Hadir, Izin, Sakit, dan Alpa.

`Teacher` hanya dapat melihat laporan yang berkaitan dengan `TeachingAssignment` yang dimilikinya. `report_viewer` dapat melihat laporan seluruh `Student`. `Student` hanya dapat melihat laporan atau riwayat `Attendance` miliknya sendiri.

### 7.11 Login dan Hak Akses

Pengguna harus login sebelum mengakses fitur yang berkaitan dengan data aplikasi.

Hak akses dibedakan sebagai berikut:

| Role | Hak Akses Utama |
|---|---|
| `admin` | Mengelola akun `User`, mengelola data dasar aplikasi, dan mengimport profile melalui CSV |
| `teacher` | Mengelola `Attendance` dan melihat data serta laporan yang menjadi kewenangannya |
| `student` | Melihat data akun dan riwayat `Attendance` miliknya sendiri |
| `report_viewer` | Melihat laporan `Attendance` seluruh `Student` |

Pengguna tidak boleh melihat atau mengubah data yang berada di luar hak akses `Role`-nya.

---

## 8. Alur Utama Pengguna

### 8.1 Login dan Mengubah Password

```text
User membuka halaman login
        ↓
User mengisi login identifier dan password
        ↓
Sistem memeriksa Role dan kredensial User
        ↓
Sistem menampilkan dashboard sesuai Role
        ↓
User dapat mengubah password melalui profil akun
```

Saat membuat atau mengatur ulang akun, `Admin` dapat meminta sistem mengirimkan temporary password ke email akun `Teacher`, `Student`, atau `Staff`.

### 8.2 Membuat Akun melalui Import CSV

```text
Admin membuka menu Import User
        ↓
Admin memilih file CSV
        ↓
Sistem memeriksa struktur dan isi file
        ↓
Sistem menampilkan hasil validasi
        ↓
Admin mengonfirmasi proses import
        ↓
Sistem membuat data profile Teacher atau Student
        ↓
Admin membuat credential User untuk profile yang dipilih
        ↓
Admin memasukkan email
        ↓
Sistem membuat temporary password dan mengirimkannya melalui email
```

### 8.7 Melihat Laporan sebagai `report_viewer`

```text
Staff login dengan Role: report_viewer
        ↓
Staff membuka menu Laporan
        ↓
Sistem mengambil Attendance seluruh Student
        ↓
Sistem menghitung ringkasan Attendance
        ↓
Staff melihat laporan
```

### 8.3 Menambahkan Data Student

```text
Admin membuka menu Data Student
        ↓
Admin memilih Tambah Student
        ↓
Admin mengisi data Student dan akun User
        ↓
Sistem memvalidasi data
        ↓
Sistem menyimpan data Student dan User
        ↓
Sistem menampilkan daftar Student
```

### 8.4 Mencatat Attendance

```text
Teacher login dengan Role: teacher
        ↓
Teacher memilih TeachingAssignment
        ↓
Frontend menampilkan tanggal saat ini secara default
        ↓
Sistem menampilkan daftar Student dari ClassRoom terkait
        ↓
Teacher mengisi status kehadiran
        ↓
Sistem memvalidasi dan menyimpan Attendance dengan tanggal dan waktu
        ↓
Sistem menampilkan hasil pencatatan
```

### 8.5 Melihat Laporan sebagai Teacher

```text
Teacher membuka menu Laporan
        ↓
Teacher memilih filter tanggal, TeachingAssignment, atau Student
        ↓
Sistem mengambil data `Attendance`
        ↓
Sistem menghitung ringkasan Attendance
        ↓
Sistem menampilkan laporan
```

### 8.6 Melihat Riwayat sebagai Student

```text
Student login dengan Role: student
        ↓
Student membuka menu Riwayat Attendance
        ↓
Sistem mengambil Attendance milik Student tersebut
        ↓
Student melihat riwayat dan ringkasan kehadirannya
```

---

## 9. Aturan Bisnis Awal

Aturan bisnis yang digunakan pada versi awal:

1. Setiap `Student` memiliki `nis` yang unik.
2. Setiap `Teacher`, `Student`, dan `Staff` harus dibuat terlebih dahulu sebagai profile sebelum credential `User` dibuat.
3. Satu akun `User` dapat terhubung dengan satu profile `Teacher`, `Student`, atau `Staff` melalui polymorphic relation `profile`.
4. Profile `Staff` dan akun awal `Admin` dibuat melalui database seeder. Akun `Admin` memiliki role `admin` dan wajib terhubung dengan profile `Staff`.
5. Hanya `Admin` yang dapat membuat atau mengelola profile `Teacher`, `Student`, dan `Staff`, serta membuat credential `User` untuk profile tersebut.
6. `mobile_phone` setiap `Teacher` harus unik.
7. `email` setiap `User` wajib diisi dan harus unik. `Teacher`, `Student`, dan `Staff` menggunakan email dari akun `User` yang terhubung.
8. Profile tanpa credential `User` tidak dapat login. Email dan temporary password ditentukan ketika `Admin` membuat credential setelah profile tersedia.
9. `birth_date` `Student` wajib diisi dengan format tanggal yang valid.
10. Nama `Student` wajib diisi.
11. Setiap `Student` harus terhubung dengan satu `ClassRoom`.
12. Setiap `TeachingAssignment` harus terhubung dengan satu `Teacher`, satu `Subject`, dan satu `ClassRoom`.
13. Kombinasi `Teacher`, `Subject`, dan `ClassRoom` hanya boleh memiliki satu `TeachingAssignment` pada konteks yang sama.
14. Setiap `Attendance` harus terhubung dengan satu `Student` dan satu `TeachingAssignment`.
15. `Student` pada `Attendance` harus berasal dari `ClassRoom` yang sama dengan `TeachingAssignment`.
16. Tanggal dan waktu `Attendance` wajib diisi. Pada frontend, nilainya secara default menggunakan tanggal dan waktu saat ini, tetapi dapat diubah jika diperlukan.
17. Status `Attendance` wajib berupa Hadir, Izin, Sakit, atau Alpa.
18. Satu `Student` hanya boleh memiliki satu `Attendance` untuk `TeachingAssignment` dan tanggal kalender yang sama.
19. `Teacher` hanya dapat membuat atau mengubah `Attendance` pada `TeachingAssignment` yang menjadi kewenangannya.
20. `Student` hanya dapat melihat riwayat `Attendance` miliknya sendiri.
21. `Admin` dapat membuat atau mengatur ulang password sementara untuk `Teacher`, `Student`, dan `Staff`.
22. `Teacher`, `Student`, dan `Staff` dapat mengubah password sendiri setelah login.
23. `Teacher`, `Student`, dan `Staff` wajib mengganti temporary password saat login pertama.
24. Password harus disimpan dalam bentuk hash.
25. Data `Student` yang masih memiliki riwayat `Attendance` tidak boleh dihapus tanpa konfirmasi.
26. Laporan hanya menampilkan data yang sesuai dengan filter dan hak akses `Role` pengguna.

Aturan tersebut dapat disesuaikan setelah rancangan teknis dibuat.

---

## 10. Kriteria Keberhasilan

Produk dianggap berhasil apabila:

- aplikasi dapat dibuka melalui browser;
- `Admin`, `Teacher`, `Student`, dan `Staff` dapat login menggunakan akun masing-masing;
- sistem menampilkan fitur sesuai dengan peran pengguna;
- `Teacher` dapat login menggunakan `mobile_phone` dan password;
- `Student` dapat login menggunakan `birth_date` berformat `YYYY-MM-DD` dan password;
- `Admin` dapat membuat atau mengatur ulang password sementara;
- `Teacher`, `Student`, dan `Staff` dapat mengubah password sendiri;
- pengguna dapat melihat halaman statis;
- `Admin` dapat menambah, melihat, mengubah, dan menghapus akun serta data `Student`;
- `Admin` dapat mengelola `Teacher`, `Subject`, `ClassRoom`, dan `TeachingAssignment`;
- `Admin` dapat membuat akun melalui formulir manual, mengimpor profile melalui dua jenis CSV, dan membuat credential `User` setelah import;
- sistem mengirimkan informasi akun dan temporary password ke email akun `Teacher`, `Student`, atau `Staff`;
- data `Student` dengan `nis` yang sudah ada tidak diimpor ulang;
- `Teacher` memiliki `mobile_phone` yang unik;
- `Teacher` dapat mencatat `Attendance` untuk `Student` pada `ClassRoom` yang sesuai;
- `Teacher` dapat mengubah dan menghapus `Attendance` yang menjadi kewenangannya;
- `Student` hanya dapat melihat `Attendance` miliknya sendiri;
- `report_viewer` dapat melihat laporan `Attendance` seluruh `Student`;
- sistem menolak data yang tidak valid;
- laporan dapat difilter berdasarkan tanggal, `TeachingAssignment`, atau `Student`;
- laporan menampilkan jumlah setiap status `Attendance` dengan benar;
- data tetap tersimpan setelah aplikasi ditutup dan dibuka kembali.

---

## 11. Batasan Produk

Produk ini dibuat untuk keperluan pembelajaran dan demonstrasi konsep dasar Laravel. Oleh karena itu:

- aplikasi belum ditujukan untuk penggunaan produksi;
- keamanan tingkat lanjut belum menjadi fokus utama;
- aplikasi hanya menggunakan satu lingkungan sekolah;
- database yang digunakan pada tutorial adalah SQLite;
- tampilan dibuat sederhana dan mengutamakan pemahaman alur aplikasi;
- seluruh pengembangan dilakukan secara bertahap agar setiap konsep Laravel dapat dijelaskan.

---

## 12. Rencana Pengembangan dalam Tutorial

Pengembangan aplikasi direncanakan dengan urutan berikut:

1. membuat project Laravel;
2. menjalankan project melalui Laravel Herd;
3. membuat halaman statis;
4. membuat autentikasi, login identifier, dan `Role` pengguna;
5. membuat struktur profile `Staff` yang diperlukan oleh akun awal `Admin`;
6. membuat database seeder untuk profile `Staff` dan akun awal `Admin`;
7. membuat fitur password sementara dan perubahan password;
8. mengonfigurasi Laravel Mail dan `smtp4dev`;
9. membuat email akun dan pengiriman temporary password;
10. membuat struktur data `Teacher`, `Student`, `Subject`, dan `ClassRoom`;
11. membuat CRUD profile dan credential oleh `Admin`;
12. membuat fitur import profile melalui CSV dan pembuatan credential `User`;
13. membuat `TeachingAssignment`;
14. membuat struktur data `Attendance`;
15. membuat fitur pencatatan `Attendance`;
16. membuat tampilan riwayat `Attendance` untuk `Student`;
17. membuat laporan `Attendance`;
18. memperbaiki navigasi dan tampilan aplikasi;
19. menguji alur utama setiap `Role`.

Detail teknis seperti route, controller, model, migration, validasi, dan struktur database akan dijelaskan dalam dokumen SRS serta bab-bab tutorial berikutnya.

