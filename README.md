# Tutorial Laravel 13 — Prezence

Repository ini berisi materi tutorial pengembangan aplikasi web menggunakan Laravel 13. Aplikasi latihan yang digunakan adalah **Prezence**, yaitu aplikasi presensi siswa.

Tutorial ditulis untuk lingkungan Windows dengan Laravel Herd, tetapi sebagian besar langkah dapat diterapkan pada sistem operasi lain selama PHP, Composer, Node.js, dan database telah tersedia.

## Kredit

Tutorial ini dibuat dengan bantuan AI assistant **Codex berbasis GPT-5**.
Dalam proyek ini, assistant tersebut diberi nama **GPT-5.6-Luna**.

Konfigurasi bantuan AI:

- Basis model: `GPT-5`
- Nama assistant dalam proyek: `GPT-5.6-Luna`
- Temperature level: `medium`

Kontribusi AI assistant tersebut mencakup perancangan materi, peninjauan
dokumen PRD dan SRS, penyusunan contoh kode, serta pendampingan implementasi
project.

## Tujuan Tutorial

Tutorial ini membahas konsep dan praktik berikut:

- persiapan lingkungan Laravel;
- cara kerja aplikasi web, request, dan response;
- pembuatan project Laravel dengan React dan Inertia;
- penggunaan TypeScript dan MUI;
- routing Laravel dan Inertia;
- authentication dan middleware;
- migration dan model;
- relasi antar-model, termasuk polymorphic relationship;
- validasi data;
- CRUD aplikasi presensi;
- import data melalui CSV;
- pengiriman email menggunakan Laravel Mail.

## Teknologi Utama

- Laravel 13;
- PHP 8.4;
- React;
- Inertia.js;
- TypeScript;
- MUI v9;
- mui-file-input;
- Day.js;
- SQLite atau MySQL;
- Laravel Herd;
- smtp4dev untuk menangkap email pada lingkungan lokal.

Laravel Herd, MySQL, dan smtp4dev bukan satu-satunya pilihan. Herd dapat digantikan dengan konfigurasi PHP dan web server lain, sedangkan database dapat menggunakan MariaDB atau PostgreSQL. smtp4dev juga dapat digantikan dengan Gmail, Mailtrap, atau SMTP service lainnya.

## Urutan Materi

### Bab 1 — Persiapan Lingkungan Pengembangan

Menyiapkan Laravel Herd, PHP, Composer, Node.js, serta pilihan database dan SMTP.

[Baca Bab 1](bab-1.md)

### Bab 2 — Cara Kerja Aplikasi Web

Mengenal browser, client, server, HTTP request, HTTP response, web server, serta penggunaan Developer Tools.

[Baca Bab 2](bab-2.md)

### Bab 3 — Membuat Project dengan React dan Inertia

Membuat project Laravel, memasang MUI dan Day.js, membuat halaman statis, mengatur routing, membuat authentication dasar, serta memperkenalkan polymorphic profile melalui `Staff` dan account `User`.

[Baca Bab 3](bab-3.md)

### Bab 4 — Migration, Model, dan Relasi Domain

Membuat migration dan model `Teacher`, `Subject`, serta `ClassRoom`. Setelah `ClassRoom` tersedia, siswa mengerjakan `Student` sebagai latihan mandiri.

[Baca Bab 4](bab-4.md)

### Bab 5 — Teaching Assignment

Membuat `TeachingAssignment` sebagai penghubung antara `Teacher`, `Subject`, dan `ClassRoom`, termasuk foreign key, unique constraint, dan relasi antar-model.

[Baca Bab 5](bab-5.md)

### Bab 6 — Attendance

Membuat entitas `Attendance`, relasi dengan `Student` dan `TeachingAssignment`, status presensi, serta pola `firstOrNew()` dan `isDirty()` berdasarkan tanggal.

[Baca Bab 6](bab-6.md)

### Bab 7 — Admin Page dan Pembuatan Profile

Membuat middleware role, menu admin, Admin Dashboard, serta page untuk membuat profile `Teacher`, `Student`, dan `Staff`.

[Baca Bab 7](bab-7.md)

### Bab 8 — Upload File dan Import Data CSV

Mempelajari upload file sebagai proses aplikasi web, validasi `UploadedFile`, pembacaan dan pengolahan data CSV, penanganan data `imported`, `skipped`, dan `failed`, serta pembuatan profile tanpa langsung membuat account `User`.

[Baca Bab 8](bab-8.md)

### Bab 9 — Teaching Assignment

Membuat CRUD `TeachingAssignment`, menghubungkan `Teacher`, `Subject`, dan `ClassRoom`, serta menjalankan seeder secara manual dari terminal.

[Baca Bab 9](bab-9.md)

### Bab 10 — Teacher dan Pencatatan Attendance

Menggunakan dashboard dinamis untuk Role `teacher`, memilih `TeachingAssignment`, menampilkan Student sesuai ClassRoom, dan mencatat `Attendance`.

[Baca Bab 10](bab-10.md)

### Bab 11 — Review dan Penyempurnaan Teacher Dashboard

Menambahkan ringkasan kelas, jumlah Student berdasarkan gender, dan ringkasan Attendance minggu berjalan dengan filter `TeachingAssignment`.

[Baca Bab 11](bab-11.md)

### Bab 12 — Report Attendance untuk Teacher

Membuat report Attendance berdasarkan bulan, tahun, dan `TeachingAssignment` dengan tabel Student × tanggal serta ringkasan status H/I/S/A.

[Baca Bab 12](bab-12.md)

### Bab 13 — Profile dan Password User

Membuat halaman profile dinamis berdasarkan polymorphic relation, menampilkan
informasi account, mengubah data profile, dan mengubah password User.

[Baca Bab 13](bab-13.md)

### Bab 14 — Penyelesaian dan Penyempurnaan Aplikasi

Melakukan gap analysis terhadap PRD dan SRS, menyelesaikan fitur secara mandiri,
menguji authorization, serta menyesuaikan tampilan dan istilah aplikasi agar
lebih intuitif.

[Baca Bab 14](bab-14.md)

## Dokumen Perancangan

Sebelum membuat fitur aplikasi, kebutuhan produk dan teknis dirumuskan dalam dua dokumen:

- [Product Requirements Document](prd-presensi.md)
- [Software Requirements Specification](srs-presensi.md)
- [Entity Relationship Diagram](entities.md)

SRS menjadi acuan utama ketika menentukan field, tipe data, constraint, relasi, route, dan hak akses.

## Bab Tambahan

- [Sekitar Laravel Herd](bab-tambahan-sekitar-laravel-herd.md)
- [smtp4dev dan MySQL](bab-tambahan-smtp4dev-mysql.md)
- [Contoh Penyelesaian Student Model](bab-tambahan-student-model.md)
- [Contekan CRUD Subject](bab-tambahan-crud-subject.md)
- [Contekan CRUD ClassRoom](bab-tambahan-crud-classroom.md)
- [MUI Styling dan Theme](bab-tambahan-mui-styling.md)
- [Konfigurasi Timezone Laravel](bab-tambahan-konfigurasi-timezone.md)
- [Contekan Implementasi Dashboard Teacher](bab-tambahan-implementasi-dashboard-teacher.md)

Contoh file import CSV tersedia pada folder [contoh-csv](contoh-csv):

- [teachers.csv](contoh-csv/teachers.csv)
- [students.csv](contoh-csv/students.csv)

File `bab-tambahan-student-model.md` berfungsi sebagai contekan. Siswa sebaiknya mengerjakan latihan pada Bab 4 terlebih dahulu sebelum membuka file tersebut.

## Project Contoh

Project Laravel yang digunakan untuk pengujian tutorial berada di luar folder materi ini. Setelah membuat project, sesuaikan nama folder dan URL dengan konfigurasi lokal masing-masing.

Contoh nama project:

```text
prezence
```

Perintah yang sering digunakan selama tutorial:

```powershell
php artisan migrate:status
php artisan migrate
php artisan db:seed
php artisan tinker
npm run dev
```

Untuk project contoh yang masih bersifat latihan, database dapat dibangun ulang dengan:

```powershell
php artisan migrate:fresh --seed
```

Perintah tersebut menghapus seluruh tabel dan data pada database yang sedang dikonfigurasi. Jangan menjalankannya pada database penting.

## Status Materi

Materi masih dikembangkan secara bertahap. Beberapa bab berikutnya akan membahas implementasi domain, validation, `TeachingAssignment`, `Attendance`, laporan, import CSV, dan email secara lebih lanjut.

## Bahasa dan Konvensi

Penjelasan menggunakan bahasa Indonesia. Istilah teknis dan nama entitas aplikasi menggunakan istilah development berbahasa Inggris, seperti:

```text
User, Teacher, Student, Staff, Subject, ClassRoom,
TeachingAssignment, Attendance, Role, Controller, Model,
Migration, Middleware, Policy, dan Request.
```
