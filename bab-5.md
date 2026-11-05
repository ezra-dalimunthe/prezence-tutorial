# 📘 BAB 5 — TEACHING ASSIGNMENT

Pada Bab 4, kita telah membuat model `Teacher`, `Subject`, dan `ClassRoom`. Pada bab ini kita menghubungkan ketiga entitas tersebut melalui `TeachingAssignment`.

`TeachingAssignment` menyatakan bahwa seorang `Teacher` mengajar sebuah `Subject` pada sebuah `ClassRoom`.

```text
Teacher + Subject + ClassRoom
              ↓
    TeachingAssignment
```

Pada versi awal, `TeachingAssignment` belum memiliki field jadwal.

---

## 5.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda diharapkan mampu:

- membuat model dan migration;
- membuat foreign key ke beberapa tabel;
- membuat constraint kombinasi unik;
- membuat relasi `belongsTo` dan `hasMany`;
- menguji relasi menggunakan seeder dan Tinker.

---

## 5.2 Membaca SRS

Periksa entitas `TeachingAssignment` pada [srs-presensi.md](srs-presensi.md).

Field minimal:

| Field        | Tipe        | Aturan                              |
| ------------ | ----------- | ----------------------------------- |
| `id`         | bigint      | Primary key                         |
| `teacher_id` | foreign key | Required                            |
| `subject_id` | foreign key | Required                            |
| `class_id`   | foreign key | Required, merujuk ke `class_rooms` |
| `created_at` | timestamp   | Laravel timestamp                  |
| `updated_at` | timestamp   | Laravel timestamp                  |

Kombinasi berikut harus unik:

```text
teacher_id + subject_id + class_id
```

Tidak ada field jadwal pada versi awal aplikasi.

---

## 5.3 Membuat Model dan Migration

```powershell
php artisan make:model TeachingAssignment -m
```

Perintah tersebut membuat:

```text
app/Models/TeachingAssignment.php
database/migrations/xxxx_xx_xx_xxxxxx_create_teaching_assignments_table.php
```

---

## 5.4 Migration `teaching_assignments`

Buka migration `create_teaching_assignments_table`:

```php
Schema::create('teaching_assignments', function (Blueprint $table) {
    $table->id();

    $table->foreignId('teacher_id')
        ->constrained('teachers')
        ->restrictOnDelete();

    $table->foreignId('subject_id')
        ->constrained('subjects')
        ->restrictOnDelete();

    $table->foreignId('class_id')
        ->constrained('class_rooms')
        ->restrictOnDelete();

    $table->unique([
        'teacher_id',
        'subject_id',
        'class_id',
    ]);

    $table->timestamps();
});
```

`restrictOnDelete()` mencegah `Teacher`, `Subject`, atau `ClassRoom` dihapus jika masih digunakan oleh assignment.

Jalankan migration:

```powershell
php artisan migrate
php artisan migrate:status
```

---

## 5.5 Model `TeachingAssignment`

Buka `app/Models/TeachingAssignment.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeachingAssignment extends Model
{
    protected $fillable = [
        'teacher_id',
        'subject_id',
        'class_id',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function classRoom(): BelongsTo
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }
}
```

Setiap assignment dimiliki oleh satu `Teacher`, satu `Subject`, dan satu `ClassRoom`, sehingga model menggunakan tiga relasi `belongsTo`.

---

## 5.6 Relasi Kebalikan

Tambahkan relasi berikut pada model `Teacher`:

```php
use App\Models\TeachingAssignment;
use Illuminate\Database\Eloquent\Relations\HasMany;

public function teachingAssignments(): HasMany
{
    return $this->hasMany(TeachingAssignment::class);
}
```

Tambahkan method yang sama pada model `Subject`:

```php
public function teachingAssignments(): HasMany
{
    return $this->hasMany(TeachingAssignment::class);
}
```

Tambahkan pada model `ClassRoom`:

```php
public function teachingAssignments(): HasMany
{
    return $this->hasMany(TeachingAssignment::class, 'class_id');
}
```

Relasi dapat digunakan dari dua arah:

```php
$assignment->teacher;
$assignment->subject;
$assignment->classRoom;

$teacher->teachingAssignments;
$subject->teachingAssignments;
$classRoom->teachingAssignments;
```

---

## 5.7 Membuat Data Pengujian dengan Seeder

Buat seeder:

```powershell
php artisan make:seeder TeachingAssignmentSeeder
```

Buka `database/seeders/TeachingAssignmentSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeachingAssignment;
use Illuminate\Database\Seeder;

class TeachingAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = Teacher::firstOrCreate(
            ['mobile_phone' => '081234567890'],
            ['name' => 'Budi Santoso']
        );

        $subject = Subject::firstOrCreate([
            'name' => 'Matematika',
        ]);

        $classRoom = ClassRoom::firstOrCreate(
            ['name' => 'X-A'],
            ['level' => 'X']
        );

        TeachingAssignment::firstOrCreate([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'class_id' => $classRoom->id,
        ]);
    }
}
```

Jalankan seeder:

```powershell
php artisan db:seed --class=TeachingAssignmentSeeder
```

`firstOrCreate()` membuat seeder dapat dijalankan kembali tanpa membuat kombinasi assignment yang sama.

---

## 5.8 Menguji Relasi dengan Tinker

```powershell
php artisan tinker
```

Ambil assignment pertama:

```php
$assignment = App\Models\TeachingAssignment::first();
```

Uji relasi dari assignment:

```php
$assignment->teacher;
$assignment->subject;
$assignment->classRoom;
```

Uji relasi kebalikan:

```php
$assignment->teacher->teachingAssignments;
$assignment->subject->teachingAssignments;
$assignment->classRoom->teachingAssignments;
```

Coba membuat kombinasi yang sama:

```php
App\Models\TeachingAssignment::create([
    'teacher_id' => $assignment->teacher_id,
    'subject_id' => $assignment->subject_id,
    'class_id' => $assignment->class_id,
]);
```

Database seharusnya menolak data tersebut karena kombinasi ketiga field memiliki unique constraint.

---

## 5.9 Latihan Mandiri

1. Buat `TeachingAssignment` dengan Subject yang berbeda.
2. Buat `ClassRoom` baru dan gunakan pada assignment tersebut.
3. Tampilkan semua assignment dari satu `Teacher`.
4. Tampilkan semua assignment pada satu `ClassRoom`.
5. Coba hapus `Subject` yang masih digunakan oleh assignment. Amati pengaruh `restrictOnDelete()`.

Pastikan setiap field, relasi, dan constraint dapat dijelaskan dengan merujuk kembali pada SRS.

---

## 5.10 Ringkasan Bab Ini

Pada bab ini kita telah:

- membuat migration dan model `TeachingAssignment`;
- menghubungkan assignment dengan `Teacher`, `Subject`, dan `ClassRoom`;
- membuat relasi kebalikan `HasMany`;
- menggunakan foreign key dan unique constraint;
- membuat data pengujian melalui seeder;
- menguji relasi menggunakan Tinker.

Pada bab berikutnya, `TeachingAssignment` akan digunakan sebagai dasar untuk membuat `Attendance`.
