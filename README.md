# Tutorial Laravel 13 — Prezence

Repository ini berisi materi tutorial pengembangan aplikasi web menggunakan Laravel 13. Aplikasi latihan yang digunakan adalah **Prezence**, yaitu aplikasi presensi siswa.

Tutorial ditulis untuk lingkungan Windows dengan Laravel Herd, tetapi sebagian besar langkah dapat diterapkan pada sistem operasi lain selama PHP, Composer, Node.js, dan database telah tersedia.

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

## Dokumen Perancangan

Sebelum membuat fitur aplikasi, kebutuhan produk dan teknis dirumuskan dalam dua dokumen:

- [Product Requirements Document](prd-presensi.md)
- [Software Requirements Specification](srs-presensi.md)

SRS menjadi acuan utama ketika menentukan field, tipe data, constraint, relasi, route, dan hak akses.

## Bab Tambahan

- [Sekitar Laravel Herd](bab-tambahan-sekitar-laravel-herd.md)
- [smtp4dev dan MySQL](bab-tambahan-smtp4dev-mysql.md)
- [Contoh Penyelesaian Student Model](bab-tambahan-student-model.md)

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
