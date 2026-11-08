# 📘 BAB 6 — ATTENDANCE

Pada Bab 5, kita telah membuat `TeachingAssignment` yang menghubungkan `Teacher`, `Subject`, dan `ClassRoom`.

Pada bab ini kita membuat entitas `Attendance`. `Attendance` menghubungkan seorang `Student` dengan sebuah `TeachingAssignment` dan menyimpan status kehadirannya.

```text
Student ───────────────┐
                       ├── Attendance
TeachingAssignment ────┘
```

Satu `Student` dapat memiliki banyak `Attendance`, dan satu `TeachingAssignment` dapat memiliki banyak `Attendance`.

---

## 6.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda diharapkan mampu:

- membaca struktur `Attendance` dari SRS;
- membuat migration dan model `Attendance`;
- membuat relasi `belongsTo` dan `hasMany`;
- menggunakan tipe data `date` dan `text`;
- menyimpan status Attendance;
- menggunakan `firstOrNew()` dan `isDirty()` untuk Attendance berdasarkan tanggal;
- menguji relasi menggunakan seeder dan Tinker.

---

## 6.2 Membaca Struktur `Attendance` pada SRS

Periksa entitas `Attendance` pada [srs-presensi.md](srs-presensi.md).

Field minimal:

| Field                    | Tipe        | Aturan                            |
| ------------------------ | ----------- | --------------------------------- |
| `id`                     | bigint      | Primary key                       |
| `student_id`             | foreign key | Required                          |
| `teaching_assignment_id` | foreign key | Required                          |
| `attendance_date`        | date        | Required, key tanggal             |
| `status`                 | string      | Required                          |
| `note`                   | text        | Nullable                          |
| `created_at`             | timestamp   | Laravel timestamp                |
| `updated_at`             | timestamp   | Laravel timestamp                |

Status internal yang digunakan:

| Nilai Internal | Label Tampilan |
| -------------- | -------------- |
| `present`      | Hadir          |
| `excused`      | Izin           |
| `sick`         | Sakit          |
| `absent`       | Alpa           |

---

## 6.3 Membuat Model dan Migration

```powershell
php artisan make:model Attendance -m
```

Perintah tersebut membuat:

```text
app/Models/Attendance.php
database/migrations/xxxx_xx_xx_xxxxxx_create_attendances_table.php
```

---

## 6.4 Membuat Migration `attendances`

Buka migration `create_attendances_table`:

```php
Schema::create('attendances', function (Blueprint $table) {
    $table->id();

    $table->foreignId('student_id')
        ->constrained('students')
        ->restrictOnDelete();

    $table->foreignId('teaching_assignment_id')
        ->constrained('teaching_assignments')
        ->restrictOnDelete();

    $table->date('attendance_date');
    $table->string('status', 20);
    $table->text('note')->nullable();
    $table->unique([
        'student_id',
        'teaching_assignment_id',
        'attendance_date',
    ]);
    $table->timestamps();
});
```

`Attendance` tidak menyimpan `teacher_id`, `subject_id`, atau `class_id` secara langsung. Data tersebut dapat diketahui melalui relasi:

```text
Attendance
    → TeachingAssignment
        → Teacher
        → Subject
        → ClassRoom
```

Jalankan migration:

```powershell
php artisan migrate
php artisan migrate:status
```

---

## 6.5 Membuat Model `Attendance`

Buka `app/Models/Attendance.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'student_id',
        'teaching_assignment_id',
        'attendance_date',
        'status',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function teachingAssignment(): BelongsTo
    {
        return $this->belongsTo(TeachingAssignment::class);
    }
}
```

Setiap `Attendance` dimiliki oleh satu `Student` dan satu `TeachingAssignment`, sehingga digunakan dua relasi `belongsTo`.

---

## 6.6 Menambahkan Relasi Kebalikan

### Model `Student`

Tambahkan pada `Student`:

```php
use App\Models\Attendance;
use Illuminate\Database\Eloquent\Relations\HasMany;

public function attendances(): HasMany
{
    return $this->hasMany(Attendance::class);
}
```

### Model `TeachingAssignment`

Tambahkan pada `TeachingAssignment`:

```php
use App\Models\Attendance;
use Illuminate\Database\Eloquent\Relations\HasMany;

public function attendances(): HasMany
{
    return $this->hasMany(Attendance::class);
}
```

Relasi dapat digunakan dari dua arah:

```php
$attendance->student;
$attendance->teachingAssignment;

$student->attendances;
$assignment->attendances;
```

---

## 6.7 Membuat Data Pengujian dengan Seeder

Buat seeder:

```powershell
php artisan make:seeder AttendanceSeeder
```

Buka `database/seeders/AttendanceSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeachingAssignment;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
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

        $student = Student::firstOrCreate(
            ['nis' => '2026001'],
            [
                'class_id' => $classRoom->id,
                'name' => 'Siti Aminah',
                'gender' => 'female',
                'birth_date' => '2010-05-12',
                'birth_place' => 'Jakarta',
            ]
        );

        $assignment = TeachingAssignment::firstOrCreate([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'class_id' => $classRoom->id,
        ]);

        $attendance = Attendance::firstOrNew([
            'student_id' => $student->id,
            'teaching_assignment_id' => $assignment->id,
            'attendance_date' => '2026-11-04',
        ]);

        $attendance->fill([
            'status' => 'present',
            'note' => null,
        ]);

        if ($attendance->isDirty()) {
            $attendance->save();
        }
    }
}
```

Jalankan seeder:

```powershell
php artisan db:seed --class=AttendanceSeeder
```

---

## 6.8 Menguji Relasi dengan Tinker

```powershell
php artisan tinker
```

Ambil data Attendance:

```php
$attendance = App\Models\Attendance::first();
```

Uji relasi dari `Attendance`:

```php
$attendance->student;
$attendance->teachingAssignment;
$attendance->teachingAssignment->teacher;
$attendance->teachingAssignment->subject;
$attendance->teachingAssignment->classRoom;
```

Uji relasi kebalikan:

```php
$attendance->student->attendances;
$attendance->teachingAssignment->attendances;
```

---

## 6.9 Menyimpan Rekaman pada Tanggal yang Sama

Field `attendance_date` menjadi key tanggal presensi. Waktu pembuatan dan
perubahan record dilacak oleh `created_at` dan `updated_at`:

```text
attendance_date: 2026-11-04
created_at:      2026-11-04 07:00:00
updated_at:      2026-11-04 07:00:00
```

Sistem menggunakan `firstOrNew()` dan `isDirty()`. Jika kombinasi Student,
TeachingAssignment, dan `attendance_date` belum ada, record baru dibuat. Jika
sudah ada dan status berubah, record tersebut diperbarui.

Contoh pola penyimpanannya:

```php
$attendance = Attendance::query()
    ->where('student_id', $studentId)
    ->where('teaching_assignment_id', $assignment->id)
    ->where('attendance_date', $date)
    ->firstOrNew([
        'student_id' => $studentId,
        'teaching_assignment_id' => $assignment->id,
        'attendance_date' => $date,
    ]);

$attendance->fill(['status' => $status]);

if ($attendance->isDirty()) {
    $attendance->save();
}
```

Validasi yang tetap diperlukan adalah:

- `Student` berasal dari ClassRoom yang sama dengan TeachingAssignment;
- Teacher memiliki TeachingAssignment tersebut;
- status Attendance valid;
- tanggal memiliki format yang valid.

Dengan `attendance_date`, `firstOrNew()` dapat mencocokkan tanggal secara
langsung tanpa memerlukan field datetime tambahan.

---

## 6.10 Memvalidasi Kesesuaian ClassRoom

Student yang dicatat pada Attendance harus berasal dari ClassRoom yang sama dengan TeachingAssignment.

Contoh pemeriksaan:

```php
$isSameClassRoom = $student->class_id === $assignment->class_id;
```

Jika hasilnya `false`, Attendance harus ditolak.

Pemeriksaan ini penting karena foreign key saja belum cukup. Foreign key hanya memastikan bahwa Student dan TeachingAssignment tersedia; foreign key tidak memastikan keduanya berada pada ClassRoom yang sama.

---

## 6.11 Latihan Mandiri

1. Buat Attendance dengan status `excused` dan isi `note`.
2. Buat Attendance dengan status `sick`.
3. Simpan Attendance kedua pada tanggal yang sama dengan status berbeda.
4. Pastikan record lama diperbarui, bukan record baru yang dibuat.
5. Coba membuat Attendance untuk Student dari ClassRoom yang berbeda.
6. Tampilkan seluruh Attendance seorang Student.
7. Tampilkan seluruh Attendance pada sebuah TeachingAssignment.

Gunakan SRS untuk memeriksa field, status, relasi, dan aturan validasinya.

---

## 6.12 Ringkasan Bab Ini

Pada bab ini kita telah:

- membuat migration dan model `Attendance`;
- menghubungkan `Attendance` dengan `Student` dan `TeachingAssignment`;
- membuat relasi kebalikan `HasMany`;
- menyimpan status dan catatan presensi;
- membuat data pengujian melalui seeder;
- menguji relasi menggunakan Tinker;
- menggunakan `firstOrNew()` dan `isDirty()` untuk membuat atau memperbarui Attendance;
- memvalidasi kesesuaian `Student` dan `ClassRoom`.

Pada bab berikutnya, kita akan membuat halaman dan workflow untuk `admin`, termasuk pengelolaan profile, account, master data, dan `TeachingAssignment`. Pencatatan `Attendance` belum dibuat pada tahap ini.
