# 📘 BAB 4 — MIGRATION, MODEL, DAN RELASI DOMAIN

Pada Bab 3, kita telah menyiapkan tabel `users`, model `User`, profile `Staff`, dan polymorphic relation `profile`.

Pada bab ini kita membuat struktur domain aplikasi presensi. Urutan pembuatan mengikuti dependency antar tabel:

```text
users dan staff       ← sudah dibuat pada Bab 3
        ↓
teachers
        ↓
subjects
        ↓
class_rooms
        ↓
students
```

`Student` dibuat setelah `ClassRoom` karena tabel `students` memiliki foreign key ke tabel `class_rooms`.

Semua struktur tabel harus merujuk pada SRS. Perhatikan nama field, tipe data, constraint, dan relasi sebelum membuat migration.

---

## 4.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda diharapkan mampu:

- membaca struktur entitas dari SRS;
- membuat model dan migration menggunakan Artisan;
- menentukan tipe data dan constraint tabel;
- membuat relasi `belongsTo`, `hasMany`, dan polymorphic relation;
- memahami dependency antar tabel;
- menjalankan dan memeriksa migration;
- menguji model dan relasi menggunakan Tinker.

---

## 4.2 Membaca SRS Sebelum Membuat Migration

Sebelum membuat file, periksa bagian entitas berikut pada [srs-presensi.md](srs-presensi.md):

- `Teacher`;
- `Subject`;
- `ClassRoom`;
- `Student`.

Migration merupakan penerjemahan struktur entitas pada SRS ke dalam kode database. Jangan menambahkan field hanya karena tersedia pada contoh project lain.

---

## 4.3 Membuat Model dan Migration `Teacher`

`Teacher` adalah profile pengguna yang dapat memiliki banyak `TeachingAssignment`. Email dan password tidak disimpan pada tabel `teachers`; data tersebut berada pada tabel `users`.

```powershell
php artisan make:model Teacher -m
```

### 4.3.1 Migration `teachers`

Buka migration `create_teachers_table` dan gunakan struktur berikut:

```php
Schema::create('teachers', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('mobile_phone')->unique();
    $table->timestamps();
});
```

Migration ini tidak memiliki `user_id`, `email`, atau `password`. Hubungan dengan `User` menggunakan `profile_type` dan `profile_id` pada tabel `users`.

### 4.3.2 Model `Teacher`

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Teacher extends Model
{
    protected $fillable = [
        'name',
        'mobile_phone',
    ];

    public function user(): MorphOne
    {
        return $this->morphOne(User::class, 'profile');
    }
}
```

Pada sisi `User`, method `profile()` sudah dibuat pada Bab 3:

```php
public function profile(): MorphTo
{
    return $this->morphTo();
}
```

Jalankan dan periksa migration:

```powershell
php artisan migrate
php artisan migrate:status
```

---

## 4.4 Menguji Model `Teacher`

Untuk membuat data pengujian secara konsisten, gunakan seeder. Buat seeder:

```powershell
php artisan make:seeder TeacherSeeder
```

Buka file `database/seeders/TeacherSeeder.php`, lalu isi dengan:

```php
<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        // Profile dibuat terlebih dahulu.
        $teacher = Teacher::firstOrCreate(
            ['mobile_phone' => '081234567890'],
            ['name' => 'Budi Santoso']
        );

        // Account dibuat setelah profile tersedia.
        User::updateOrCreate(
            ['email' => 'budi@prezence.test'],
            [
                'password' => 'password',
                'role' => 'teacher',
                'is_active' => true,
                'must_change_password' => true,
                'profile_type' => Teacher::class,
                'profile_id' => $teacher->id,
            ]
        );
    }
}
```

Jalankan seeder tersebut:

```powershell
php artisan db:seed --class=TeacherSeeder
```

Password akan di-hash oleh cast `password` pada model `User`.

### Menguji Relasi melalui Tinker

Jalankan Tinker:

```powershell
php artisan tinker
```

Ambil profile `Teacher` berdasarkan `mobile_phone`:

```php
$teacher = App\Models\Teacher::where(
    'mobile_phone',
    '081234567890'
)->first();
```

Uji relasi dari `Teacher` ke `User`:

```php
$teacher->fresh()->user;
```

Selanjutnya, ambil account berdasarkan email:

```php
$user = App\Models\User::where(
    'email',
    'budi@prezence.test'
)->first();
```

Uji relasi dari `User` ke profile:

```php
$user->fresh()->profile;
```

Alur tersebut menunjukkan bahwa profile dibuat lebih dahulu, kemudian account `User` dibuat oleh Admin.

---

## 4.5 Membuat Model dan Migration `Subject`

Buat model dan migration:

```powershell
php artisan make:model Subject -m
```

Migration `subjects`:

```php
Schema::create('subjects', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->timestamps();
});
```

Model `Subject`:

```php
class Subject extends Model
{
    protected $fillable = [
        'name',
    ];
}
```

Relasi `Subject` dengan `TeachingAssignment` akan dibuat ketika entitas `TeachingAssignment` dibahas.

---

## 4.6 Membuat Model dan Migration `ClassRoom`

Nama model adalah `ClassRoom`, sedangkan nama tabel adalah `class_rooms`.

```powershell
php artisan make:model ClassRoom -m
```

Migration `class_rooms`:

```php
Schema::create('class_rooms', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->string('level');
    $table->timestamps();
});
```

Model `ClassRoom`:

```php
class ClassRoom extends Model
{
    protected $table = 'class_rooms';

    protected $fillable = [
        'name',
        'level',
    ];
}
```

Nilai `level` yang diizinkan adalah `X`, `XI`, atau `XII`. Validasi nilai tersebut akan dibahas pada bab validasi.

Jalankan migration dan pastikan `create_class_rooms_table` berstatus `Ran`:

```powershell
php artisan migrate
php artisan migrate:status
```

---

## 4.7 Latihan Mandiri — Membuat `Student`

Tabel `class_rooms` sudah tersedia. Sekarang buat sendiri migration dan model `Student` dengan merujuk pada SRS.

Tugas Anda:

1. Buat model dan migration:

   ```powershell
   php artisan make:model Student -m
   ```

2. Buat tabel `students` dengan field:
   - `class_id` yang merujuk ke `class_rooms`;
   - `nis` yang unik;
   - `name`;
   - `gender`;
   - `birth_date`;
   - `birth_place`;
   - timestamps.
3. Buat relasi `belongsTo` dari `Student` ke `ClassRoom` dengan nama method `classRoom()`.
4. Buat relasi `MorphOne` dari `Student` ke `User` dengan nama method `user()`.
5. Tambahkan relasi kebalikan `HasMany` pada model `ClassRoom` dengan nama method `students()`.
6. Jalankan migration dan periksa statusnya.
7. Uji relasi menggunakan Tinker.

Jangan menambahkan `email` atau `user_id` ke tabel `students`. Relasi account menggunakan polymorphic relation pada tabel `users`.

Jika mengalami kesulitan, gunakan [bab-tambahan-student-model.md](bab-tambahan-student-model.md) sebagai contekan. Cobalah mengerjakan sendiri terlebih dahulu.

---

## 4.8 Ringkasan Bab Ini

Pada bab ini kita telah:

- membuat migration dan model `Teacher`;
- menghubungkan `Teacher` dan `User` menggunakan polymorphic relation;
- membuat migration dan model `Subject`;
- membuat migration dan model `ClassRoom`;
- menyiapkan latihan pembuatan migration dan model `Student` setelah `ClassRoom` tersedia;
- menggunakan constraint `unique` dan foreign key;
- menguji model dan relasi menggunakan Tinker.

Pada bab berikutnya, relasi `Subject`, `Teacher`, dan `ClassRoom` dapat digunakan untuk membuat `TeachingAssignment`.
