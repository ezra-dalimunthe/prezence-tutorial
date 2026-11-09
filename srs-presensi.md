# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Sistem Presensi Siswa

**Status:** Draft

**Versi:** 1.0

**Dokumen acuan:** `prd-presensi.md`

**Target teknologi:** Laravel 13, PHP 8.4, SQLite atau MySQL, Laravel Herd, smtp4dev

---

## 1. Tujuan Dokumen

Dokumen ini menerjemahkan kebutuhan produk Sistem Presensi Siswa menjadi kebutuhan teknis yang dapat digunakan sebagai acuan pengembangan aplikasi Laravel.

Dokumen ini menjelaskan:

- role dan hak akses pengguna;
- entitas dan relasi data;
- kebutuhan fungsional;
- aturan validasi;
- format import CSV;
- alur authentication dan email;
- struktur halaman dan route;
- kebutuhan nonfungsional;
- acceptance criteria.

---

## 2. Gambaran Sistem

Sistem Presensi Siswa adalah aplikasi web untuk mengelola data `Teacher`, `Student`, `Staff`, `Subject`, `ClassRoom`, `TeachingAssignment`, dan `Attendance`.

Aplikasi memiliki empat `Role`:

```text
admin   → mengelola akun dan data dasar aplikasi
teacher → mencatat Attendance dan melihat laporan assignment miliknya
student → melihat Attendance miliknya sendiri
report_viewer → melihat laporan Attendance seluruh Student
```

Sistem berjalan pada komputer lokal menggunakan Laravel Herd. Email ditangkap oleh `smtp4dev`, sedangkan database dapat menggunakan SQLite atau MySQL.

---

## 3. Ruang Lingkup Teknis

### 3.1 Termasuk

- authentication dan login;
- role-based access control;
- pembuatan akun awal `admin` melalui database seeder;
- account management oleh `admin`;
- import `teacher.csv` dan `student.csv`;
- pengiriman temporary password melalui email;
- perubahan password;
- CRUD `Subject`, `ClassRoom`, `TeachingAssignment`, `Student`, dan `Staff`;
- pencatatan dan pengelolaan `Attendance`;
- laporan `Attendance`;
- halaman statis.

### 3.2 Tidak Termasuk

- `Schedule` atau jadwal pelajaran;
- `AcademicYear` atau tahun ajaran;
- notifikasi orang tua;
- export Excel atau PDF;
- aplikasi mobile;
- API publik;
- integrasi dengan sistem sekolah lain.

---

## 4. Role dan Hak Akses

### 4.1 `admin`

`admin` dapat:

- login ke aplikasi;
- mengelola akun `teacher`, `student`, dan `staff`;
- mengelola akun `staff`;
- mengaktifkan atau menonaktifkan akun;
- membuat atau mengatur ulang temporary password;
- mengirim ulang informasi akun melalui email;
- mengelola `Subject`;
- mengelola `ClassRoom`;
- mengelola `TeachingAssignment`;
- melihat data dan laporan aplikasi.

Akun awal `admin` dibuat melalui database seeder sebagai `Staff` dengan `role = admin`. Karena kolom profile wajib diisi, setiap `User`, termasuk `admin`, harus memiliki satu profile.

### 4.2 `teacher`

`teacher` dapat:

- login menggunakan email dan password;
- melihat `TeachingAssignment` miliknya;
- melihat `Student` pada `ClassRoom` yang terkait dengan assignment miliknya;
- membuat dan mengubah `Attendance` pada assignment miliknya;
- melihat laporan berdasarkan assignment miliknya;
- mengubah password sendiri.

### 4.3 `student`

`student` dapat:

- login menggunakan email dan password;
- melihat profil sendiri;
- melihat riwayat `Attendance` sendiri;
- melihat ringkasan kehadiran sendiri;
- mengubah password sendiri.

`student` tidak dapat mengubah data `Attendance`.

### 4.4 `report_viewer`

`report_viewer` adalah `Staff` yang dapat:

- login menggunakan email dan password;
- melihat laporan `Attendance` seluruh `Student`;
- memfilter laporan berdasarkan bulan, tahun, dan `TeachingAssignment`;
- melihat ringkasan status `Attendance`.

`report_viewer` tidak dapat mengubah data master atau mencatat `Attendance`.

---

## 5. Entitas dan Relasi Data

### 5.1 `User`

`User` adalah akun yang digunakan untuk login.

Field minimal:

| Field                  | Tipe        | Aturan                             |
| ---------------------- | ----------- | ---------------------------------- |
| `id`                   | bigint      | Primary key                        |
| `email`                | string      | Required, unique                   |
| `password`             | string      | Required, hashed                   |
| `role`                 | enum/string | `admin`, `teacher`, `student`, atau `report_viewer` |
| `is_active`            | boolean     | Default `true`                     |
| `must_change_password` | boolean     | Default `true` untuk akun baru     |
| `profile_type`         | string      | Required, polymorphic profile      |
| `profile_id`           | bigint      | Required, polymorphic profile      |
| `created_at`           | timestamp   | Laravel timestamp                  |
| `updated_at`           | timestamp   | Laravel timestamp                  |

`email` merupakan atribut akun dan hanya disimpan pada tabel `users`. Data `Teacher`, `Student`, dan `Staff` mengakses email melalui relasi polymorphic `profile` ke `User`. Field `name` juga tidak disimpan pada `users`; nama disimpan pada masing-masing profile.

Kolom polymorphic pada migration `users` dapat dibuat dengan:

```php
$table->morphs('profile');
$table->unique(['profile_type', 'profile_id']);
```

Model `User` menyediakan relasi:

```php
public function profile(): MorphTo
{
    return $this->morphTo();
}
```

Model `Teacher`, `Student`, dan `Staff` masing-masing menyediakan relasi `morphOne(User::class, 'profile')`. Satu `User` harus terhubung dengan tepat satu profile. Profile boleh tersedia tanpa account, tetapi account hanya boleh dibuat setelah profile tersedia.

### 5.2 `Teacher`

Field minimal:

| Field          | Tipe        | Aturan                             |
| -------------- | ----------- | ---------------------------------- |
| `id`           | bigint      | Primary key                        |
| `name`         | string      | Required                           |
| `mobile_phone` | string      | Required, unique                   |
| `created_at`   | timestamp   | Laravel timestamp                  |
| `updated_at`   | timestamp   | Laravel timestamp                  |

`Teacher` memiliki banyak `TeachingAssignment` dan dapat terhubung dengan satu `User` melalui polymorphic relation `profile`.

### 5.3 `Student`

Field minimal:

| Field         | Tipe        | Aturan                             |
| ------------- | ----------- | ---------------------------------- |
| `id`          | bigint      | Primary key                        |
| `class_id`    | foreign key | Required                           |
| `nis`         | string      | Required, unique                   |
| `name`        | string      | Required                           |
| `gender`      | string/enum | Required                           |
| `birth_date`  | date        | Required                           |
| `birth_place` | string      | Required                           |
| `created_at`  | timestamp   | Laravel timestamp                  |
| `updated_at`  | timestamp   | Laravel timestamp                  |

`Student` berada pada satu `ClassRoom`, memiliki banyak `Attendance`, dan dapat terhubung dengan satu `User` melalui polymorphic relation `profile`.

### 5.4 `Staff`

Nama tabel database: `staff`.

Field minimal:

| Field      | Tipe   | Aturan                                      |
| ---------- | ------ | ------------------------------------------- |
| `id`       | bigint | Primary key                                 |
| `name`     | string | Required                                    |
| `position` | string | Required, maksimal 50 karakter              |
| `created_at` | timestamp | Laravel timestamp                         |
| `updated_at` | timestamp | Laravel timestamp                         |

`Staff` dapat terhubung dengan satu `User` melalui polymorphic relation `profile`. `Staff` dapat memiliki `role = admin` atau `role = report_viewer` pada account `User`-nya.

### 5.5 `Subject`

Field minimal:

| Field        | Tipe      | Aturan            |
| ------------ | --------- | ----------------- |
| `id`         | bigint    | Primary key       |
| `name`       | string    | Required, unique  |
| `created_at` | timestamp | Laravel timestamp |
| `updated_at` | timestamp | Laravel timestamp |

Satu `Subject` dapat digunakan pada banyak `TeachingAssignment`.

### 5.6 `ClassRoom`

Field minimal:

| Field        | Tipe        | Aturan                |
| ------------ | ----------- | --------------------- |
| `id`         | bigint      | Primary key           |
| `name`       | string      | Required, unique      |
| `level`      | string/enum | `X`, `XI`, atau `XII` |
| `created_at` | timestamp   | Laravel timestamp     |
| `updated_at` | timestamp   | Laravel timestamp     |

Model Laravel yang digunakan adalah `ClassRoom`, sedangkan nama tabel database adalah `class_rooms`. Penggunaan nama `ClassRoom` menghindari benturan dengan keyword `class` pada PHP.

Model dibuat dengan perintah:

```bash
php artisan make:model ClassRoom -m
```

Migration harus membuat tabel `class_rooms`:

```php
Schema::create('class_rooms', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->string('level');
    $table->timestamps();
});
```

Jika nama tabel tidak mengikuti konvensi plural Laravel, model harus mendeklarasikan nama tabel secara eksplisit:

```php
protected $table = 'class_rooms';
```

Satu `ClassRoom` memiliki banyak `Student` dan banyak `TeachingAssignment`.

### 5.7 `TeachingAssignment`

Field minimal:

| Field        | Tipe        | Aturan            |
| ------------ | ----------- | ----------------- |
| `id`         | bigint      | Primary key       |
| `teacher_id` | foreign key | Required          |
| `subject_id` | foreign key | Required          |
| `class_id`   | foreign key | Required, references `class_rooms` |
| `created_at` | timestamp   | Laravel timestamp |
| `updated_at` | timestamp   | Laravel timestamp |

Tidak ada field jadwal pada versi awal.

Kombinasi berikut harus unik:

```text
teacher_id + subject_id + class_id
```

### 5.8 `Attendance`

Field minimal:

| Field                    | Tipe        | Aturan            |
| ------------------------ | ----------- | ----------------- |
| `id`                     | bigint      | Primary key       |
| `student_id`             | foreign key | Required          |
| `teaching_assignment_id` | foreign key | Required          |
| `attendance_date`        | date        | Required, key tanggal |
| `status`                 | string/enum | Required          |
| `note`                   | text        | Nullable          |
| `created_at`             | timestamp   | Laravel timestamp |
| `updated_at`             | timestamp   | Laravel timestamp |

Nilai internal `status` yang disarankan:

| Nilai Internal | Label Tampilan |
| -------------- | -------------- |
| `present`      | Hadir          |
| `excused`      | Izin           |
| `sick`         | Sakit          |
| `absent`       | Alpa           |

Kombinasi berikut harus unik berdasarkan tanggal kalender:

```text
student_id + teaching_assignment_id + attendance_date
```

`Student` pada `Attendance` harus berasal dari `ClassRoom` yang sama dengan `TeachingAssignment`.

---

## 6. Relasi Model

```text
User
└── morphTo profile: Teacher / Student / Staff

Teacher
├── morphOne User sebagai profile
└── hasMany TeachingAssignment

Student
├── morphOne User sebagai profile
├── belongsTo ClassRoom
└── hasMany Attendance

Staff
└── morphOne User sebagai profile

Subject
└── hasMany TeachingAssignment

ClassRoom
├── hasMany Student
└── hasMany TeachingAssignment

TeachingAssignment
├── belongsTo Teacher
├── belongsTo Subject
├── belongsTo ClassRoom
└── hasMany Attendance

Attendance
├── belongsTo Student
└── belongsTo TeachingAssignment
```

---

## 7. Authentication dan Password

### 7.1 Login

| Role            | Login credential   |
| --------------- | ------------------ |
| `admin`         | Email dan password |
| `teacher`       | Email dan password |
| `student`       | Email dan password |
| `report_viewer` | Email dan password |

Semua account `User` wajib memiliki email yang unik. `mobile_phone`, `nis`, dan
`birth_date` tetap merupakan data profile dan tidak digunakan sebagai login
identifier.

### 7.2 Temporary Password

Ketika `Admin` membuat akun:

1. Sistem membuat temporary password.
2. Sistem menyimpan password dalam bentuk hash.
3. Sistem mengatur `must_change_password = true`.
4. Sistem mengirim email account dan temporary password melalui email tersebut.
5. User login menggunakan credential tersebut.
6. User diarahkan untuk mengganti password.
7. Setelah berhasil mengganti password, sistem mengubah `must_change_password` menjadi `false`.

`Admin` dapat membuat temporary password baru jika User lupa password.

### 7.3 Email

Email dikirim menggunakan Laravel Mail melalui SMTP lokal `smtp4dev`.

Email akun minimal berisi:

- nama profile atau penerima;
- Role;
- email account;
- temporary password;
- instruksi login;
- instruksi mengganti password.

Pada lingkungan lain, SMTP dapat diganti dengan Gmail, Mailtrap, atau layanan SMTP lainnya.

---

## 8. Kebutuhan Fungsional

### FR-001 Authentication

Sistem harus menyediakan halaman login untuk `admin`, `teacher`, `student`, dan `report_viewer`.

Jika User belum login dan mengakses route `/`, sistem harus mengarahkan User ke `/login`. Setelah login berhasil, sistem mengarahkan User ke dashboard pada route `/`.

### FR-002 Role Access

Sistem harus membatasi halaman dan tindakan berdasarkan `Role` User.

### FR-003 Admin Seeder

Sistem harus menyediakan database seeder untuk membuat satu profile `Staff` dan satu akun awal `admin` yang terhubung dengan profile tersebut.

### FR-004 Account Management

`Admin` harus dapat:

- melihat daftar profile dan status account-nya;
- membuat credential `User` untuk profile `Teacher` yang sudah tersedia;
- membuat credential `User` untuk profile `Student` yang sudah tersedia;
- membuat credential `User` untuk profile `Staff` yang sudah tersedia, dengan role `admin` atau `report_viewer`;
- mengubah data akun;
- mengaktifkan atau menonaktifkan akun;
- membuat temporary password;
- mengirim ulang email akun.

Urutan pembuatan account adalah:

1. `Admin` membuat atau memilih profile `Teacher`, `Student`, atau `Staff`.
2. Sistem menyimpan profile dan menampilkan dialog pilihan pembuatan account.
3. Jika `Admin` memilih membuat account, sistem meminta email.
4. Sistem membuat `User` dengan `profile_type` dan `profile_id` yang wajib diisi.
5. Sistem membuat temporary password dan mengirimkan credential ke email tersebut.
6. Jika `Admin` memilih nanti, profile tetap tersimpan tanpa account dan tidak dapat digunakan untuk login.

Pembuatan dan perubahan profile tidak boleh meminta field `email`. Email hanya diminta pada proses pembuatan atau perubahan credential `User`.

Untuk frontend, page `Create` dan `Edit` harus menggunakan component `Form` yang sama. Page tersebut bertanggung jawab atas data awal dan HTTP method, sedangkan `Form` bertanggung jawab atas tampilan field. Dialog pembuatan account menggunakan endpoint terpisah dari endpoint penyimpanan profile.

Contoh resource endpoint:

```text
POST /admin/teachers
PUT  /admin/teachers/{teacher}
POST /admin/teachers/{teacher}/account

POST /admin/students
PUT  /admin/students/{student}
POST /admin/students/{student}/account

POST /admin/staff
PUT  /admin/staff/{staff}
POST /admin/staff/{staff}/account
```

Pembuatan `User` dan pengiriman email harus dilakukan setelah profile berhasil disimpan. Jika pembuatan account gagal, profile tidak boleh ikut terhapus. Email dikirim setelah transaksi account berhasil dilakukan.

### FR-005 Student Management

`Admin` harus dapat melakukan CRUD data `Student`.

### FR-006 Staff Management

`Admin` harus dapat melakukan CRUD data `Staff` dan menentukan role `admin` atau `report_viewer` untuk akun Staff.

### FR-007 Subject Management

`Admin` harus dapat melakukan CRUD data `Subject`.

### FR-008 ClassRoom Management

`Admin` harus dapat melakukan CRUD data `ClassRoom`.

### FR-009 TeachingAssignment Management

`Admin` harus dapat membuat, melihat, mengubah, dan menghapus `TeachingAssignment`.

Sistem harus menolak kombinasi `Teacher`, `Subject`, dan `ClassRoom` yang sudah ada.

### FR-010 Attendance Entry

`Teacher` harus dapat:

- memilih `TeachingAssignment` miliknya;
- memilih tanggal presensi, dengan tanggal saat ini sebagai nilai default;
- melihat daftar `Student` dari `ClassRoom` assignment;
- mengisi status setiap `Student`;
- menyimpan `attendance_date`;
- menambahkan catatan jika diperlukan.

### FR-011 Attendance Validation

Sistem harus menolak pencatatan `Attendance` jika:

- `Student` tidak berasal dari `ClassRoom` assignment;
- status tidak termasuk nilai yang diizinkan.

Jika kombinasi `Student`, `TeachingAssignment`, dan `attendance_date` sudah
memiliki data, sistem memperbarui record tersebut. Jika belum ada, sistem
membuat record baru. Jika status tidak berubah, record tidak perlu disimpan
ulang sehingga `updated_at` tidak berubah.

### FR-012 Attendance Management

`Teacher` dapat mengubah `Attendance` yang terkait dengan assignment miliknya.

### FR-013 Student Attendance History

`Student` hanya dapat melihat Attendance yang memiliki `student_id` sesuai dengan akun yang sedang login.

### FR-014 Attendance Report

Sistem harus menyediakan laporan yang dapat difilter berdasarkan:

- bulan;
- tahun;
- `TeachingAssignment`.

Rentang tanggal laporan dihitung dari hari pertama sampai hari terakhir bulan
pada tahun yang dipilih. Filter Student tidak diperlukan karena Student sudah
ditentukan oleh `ClassRoom` pada `TeachingAssignment`.

Laporan menampilkan tanggal, Student, Class, Subject, Teacher, dan status.

`admin` dan `report_viewer` dapat melihat laporan seluruh `Student`. `teacher` hanya dapat melihat laporan berdasarkan `TeachingAssignment` miliknya.

### FR-015 Attendance Summary

Sistem harus menghitung jumlah `present`, `excused`, `sick`, dan `absent` sesuai filter laporan.

### FR-016 Static Pages

Sistem harus menyediakan halaman `About`, `Guide`, dan `Contact`.

---

## 9. Import CSV

### 9.1 File `teacher.csv`

Kolom minimal:

```text
name,mobile_phone
```

Sistem membuat data profile `Teacher`. Sistem tidak membuat credential `User` pada tahap import.

Setelah import, `Admin` dapat membuat credential `User` untuk setiap `Teacher` dengan memasukkan email. Sistem membuat temporary password dan mengirimkannya melalui email tersebut.

### 9.2 File `student.csv`

Kolom minimal:

```text
name,nis,gender,birth_date,birth_place,class_name
```

Sistem membuat data profile `Student`. Sistem tidak membuat credential `User` pada tahap import.

- relasi ke `ClassRoom` pada tabel `class_rooms` berdasarkan `class_name`;

Setelah import, `Admin` dapat membuat credential `User` untuk setiap `Student` dengan memasukkan email. Sistem membuat temporary password dan mengirimkannya melalui email tersebut.

### 9.3 Validasi Import

Sistem harus:

- memeriksa ekstensi atau format CSV;
- memeriksa header;
- memeriksa kolom wajib;
- memvalidasi `birth_date` dengan format `YYYY-MM-DD`;
- memvalidasi `nis` unik;
- memvalidasi `mobile_phone` unik;
- memeriksa `class_name` yang tersedia;
- mendeteksi duplikasi dalam file;
- menampilkan hasil import.

Jika `nis` sudah terdapat di database, baris `student.csv` tersebut tidak diimpor dan dicatat sebagai skipped.

Email tidak divalidasi pada proses import karena belum menjadi bagian dari file CSV. Email divalidasi ketika credential `User` dibuat. Jika email sudah digunakan, credential tidak boleh dibuat.

### 9.4 Hasil Import

Hasil import minimal menampilkan:

- jumlah baris yang dibaca;
- jumlah data berhasil dibuat;
- jumlah data skipped;
- jumlah data gagal;
- nomor baris yang bermasalah;
- alasan data skipped atau gagal.

---

## 10. Validasi Data

### 10.1 `Student`

| Field         | Validasi Minimal                                      |
| ------------- | ----------------------------------------------------- |
| `name`        | Required, string, maksimal 255 karakter               |
| `nis`         | Required, string, unique                              |
| `gender`      | Required, nilai yang diizinkan                        |
| `birth_date`  | Required, date, format `YYYY-MM-DD`, sebelum hari ini |
| `birth_place` | Required, string, maksimal 100 karakter               |
| `class_id`    | Required, exists pada `class_rooms`                   |

Email, password, status akun, dan role divalidasi pada entitas `User`.

### 10.2 `Teacher`

| Field          | Validasi Minimal                        |
| -------------- | --------------------------------------- |
| `name`         | Required, string, maksimal 255 karakter |
| `mobile_phone` | Required, string, unique                |

Email dan role `Teacher`, `Student`, serta `Staff` divalidasi pada entitas `User`:

| Field   | Validasi Minimal        |
| ------- | ----------------------- |
| `email` | Required, email, unique |
| `role`  | Required, `admin`, `teacher`, `student`, atau `report_viewer` |

### 10.3 `Staff`

| Field      | Validasi Minimal                                  |
| ---------- | ------------------------------------------------- |
| `name`     | Required, string, maksimal 255 karakter          |
| `position` | Required, string, maksimal 50 karakter           |
| `role`     | Required, `admin` atau `report_viewer`           |

### 10.4 `Subject` dan `ClassRoom`

| Field          | Validasi Minimal                           |
| -------------- | ------------------------------------------ |
| `subject.name` | Required, string, unique                   |
| `ClassRoom.name`  | Required, string, unique                   |
| `ClassRoom.level` | Required, salah satu dari `X`, `XI`, `XII` |

### 10.5 `Attendance`

| Field                    | Validasi Minimal                                      |
| ------------------------ | ----------------------------------------------------- |
| `student_id`             | Required, exists pada `students`                      |
| `teaching_assignment_id` | Required, exists pada `teaching_assignments`          |
| `attendance_date`        | Required, date                                        |
| `status`                 | Required, `present`, `excused`, `sick`, atau `absent` |
| `note`                   | Nullable, string                                      |

---

## 11. Halaman dan Route

Route berikut adalah rancangan awal dan dapat disesuaikan saat implementasi.

### Public

| Method | URI        | Fungsi       |
| ------ | ---------- | ------------ |
| `GET`  | `/about`   | About        |
| `GET`  | `/guide`   | Guide        |
| `GET`  | `/contact` | Contact      |
| `GET`  | `/login`   | Form login   |
| `POST` | `/login`   | Proses login |
| `POST` | `/logout`  | Logout       |

### Authenticated User

Route pada bagian ini dilindungi oleh middleware `auth`. Route `/` adalah entry point dashboard aplikasi.

| Method | URI                 | Fungsi                     |
| ------ | ------------------- | -------------------------- |
| `GET`  | `/`        | Dashboard berdasarkan Role |
| `GET`  | `/profile/password` | Form perubahan password    |
| `PUT`  | `/profile/password` | Proses perubahan password  |

### Admin

| Resource                      | Keterangan                    |
| ----------------------------- | ----------------------------- |
| `/admin/users`                | Account management            |
| `/admin/teachers`             | Teacher management            |
| `/admin/students`             | Student management            |
| `/admin/staff`                | Staff management              |
| `/admin/subjects`             | Subject management            |
| `/admin/class-rooms`          | ClassRoom management          |
| `/admin/teaching-assignments` | TeachingAssignment management |
| `/admin/import/teachers`      | Import `teacher.csv`          |
| `/admin/import/students`      | Import `student.csv`          |

### Teacher

| Resource               | Keterangan            |
| ---------------------- | --------------------- |
| `/teacher/attendances` | Attendance management |
| `/teacher/reports`     | Attendance report     |

### Student

| Resource               | Keterangan                 |
| ---------------------- | -------------------------- |
| `/student/profile`     | Student profile            |
| `/student/attendances` | Student attendance history |

### Report Viewer

| Resource          | Keterangan                         |
| ----------------- | ---------------------------------- |
| `/reports`         | All-student Attendance report      |

---

## 12. Middleware dan Authorization

Sistem minimal memiliki middleware atau mekanisme authorization berikut:

```text
auth
role:admin
role:teacher
role:student
role:report_viewer
```

Aturan authorization penting:

- User yang belum login tidak dapat mengakses halaman internal;
- `admin` dapat mengakses halaman admin;
- `admin` dan `report_viewer` dapat melihat laporan seluruh `Student`;
- `teacher` hanya dapat mengakses assignment miliknya;
- `teacher` tidak dapat mengubah Attendance milik assignment Teacher lain;
- `student` hanya dapat mengakses data dengan `student_id` miliknya;
- `student` tidak dapat mengakses halaman admin atau teacher;
- authorization menggunakan middleware, Gate, atau Policy; `Observer` tidak digunakan untuk menentukan hak akses.

---

## 13. Kebutuhan Nonfungsional

### 13.1 Platform

- Windows 10 atau Windows 11;
- PHP 8.3–8.5;
- Laravel 13;
- Laravel Herd;
- browser modern.

### 13.2 Database

- SQLite menjadi pilihan sederhana untuk pembelajaran;
- MySQL dapat digunakan sebagai alternatif;
- MariaDB dan PostgreSQL dapat digunakan dengan konfigurasi yang sesuai.

### 13.3 Email

- lingkungan lokal menggunakan `smtp4dev`;
- konfigurasi email tidak boleh menyimpan credential sensitif dalam repository;
- email akun harus memiliki format yang mudah dipahami.

### 13.4 Security Dasar

- password wajib di-hash;
- route internal wajib dilindungi authentication;
- akses data wajib diperiksa berdasarkan `Role` dan ownership;
- validasi dilakukan pada server;
- input pengguna harus di-escape ketika ditampilkan;
- credential tidak boleh ditulis ke log aplikasi.

### 13.5 Usability

- form menampilkan pesan validasi yang jelas;
- status hasil import mudah dipahami;
- tanggal presensi default menggunakan tanggal saat ini;
- label status Attendance menggunakan bahasa yang mudah dipahami pengguna.

---

## 14. Acceptance Criteria

### Authentication

- `admin` dapat login menggunakan akun hasil seeder;
- `teacher` dapat login menggunakan email dan password;
- `student` dapat login menggunakan email dan password;
- `report_viewer` dapat login menggunakan email dan password;
- User yang belum login dan membuka `/` diarahkan ke `/login`;
- User yang berhasil login diarahkan ke dashboard pada `/`;
- User dengan akun nonaktif tidak dapat login;
- User dapat mengubah password;
- temporary password dikirim melalui email.

### Account dan Import

- `admin` dapat membuat profile `Teacher`, `Student`, dan `Staff` secara manual;
- setelah profile tersimpan, `admin` dapat memilih membuat credential melalui dialog;
- email hanya diminta pada proses pembuatan credential, bukan pada form profile;
- `admin` dapat membuat credential untuk profile yang belum memiliki account;
- `admin` dapat mengimport `teacher.csv`;
- `admin` dapat mengimport `student.csv`;
- profile hasil import tidak langsung memiliki credential `User`;
- data dengan `nis` yang sudah ada tidak dibuat ulang;
- `mobile_phone` duplikat dilaporkan saat import `Teacher`;
- email duplikat ditolak saat pembuatan credential `User`;
- hasil import menampilkan jumlah berhasil, skipped, dan gagal.

### Attendance

- `teacher` hanya melihat `Student` pada `ClassRoom` assignment miliknya;
- tanggal presensi secara default adalah tanggal saat ini;
- sistem menyimpan tanggal presensi;
- data presensi menggunakan kombinasi Student, assignment, dan `attendance_date` sebagai key pencarian;
- jika kombinasi tersebut belum ada, sistem membuat record baru;
- jika kombinasi tersebut sudah ada dan nilainya berubah, sistem memperbarui record menggunakan `firstOrNew()` dan `isDirty()`;
- `student` hanya melihat riwayat miliknya sendiri.
- `report_viewer` hanya melihat laporan dan tidak dapat mengubah data aplikasi.

### Report

- laporan dapat difilter;
- hasil laporan sesuai dengan hak akses User;
- jumlah status Attendance dihitung dengan benar.

---

## 15. Keputusan yang Perlu Dikonfirmasi

Sebelum implementasi final, beberapa keputusan berikut perlu ditetapkan:

1. Jika `mobile_phone` sudah ada saat import atau email sudah ada saat pembuatan credential, apakah data tersebut `skipped` atau `failed`?
2. Apakah `gender` menggunakan nilai internal `male`/`female` dengan label Indonesia, atau nilai lain?
3. Apakah `Teacher` dapat melihat semua `Student` pada assignment miliknya, tetapi tidak dapat mengubah data `Student`?
4. Apakah `Admin` dapat melihat dan mengubah `Attendance`, atau hanya mengelola data master?
5. Apakah password wajib diganti pada login pertama atau hanya dianjurkan?

Keputusan tersebut dapat diperbarui setelah review terhadap SRS ini.

