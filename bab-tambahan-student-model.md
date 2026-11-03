# Contoh Penyelesaian — Model dan Migration `Student`

File ini merupakan contekan untuk latihan pada Bab 4. Cobalah menyelesaikan latihan secara mandiri terlebih dahulu.

Struktur `Student` harus merujuk pada SRS dan dibuat setelah tabel `class_rooms` tersedia.

## Membuat Model dan Migration

```powershell
php artisan make:model Student -m
```

## Migration `students`

Buka migration `create_students_table`:

```php
Schema::create('students', function (Blueprint $table) {
    $table->id();
    $table->foreignId('class_id')
        ->constrained('class_rooms')
        ->restrictOnDelete();
    $table->string('nis')->unique();
    $table->string('name');
    $table->string('gender');
    $table->date('birth_date');
    $table->string('birth_place', 100);
    $table->timestamps();
});
```

Tabel `students` tidak memiliki `email` atau `user_id`. Account `User` terhubung melalui polymorphic relation pada tabel `users`.

Jalankan migration:

```powershell
php artisan migrate
php artisan migrate:status
```

## Model `Student`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Student extends Model
{
    protected $fillable = [
        'class_id',
        'nis',
        'name',
        'gender',
        'birth_date',
        'birth_place',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function user(): MorphOne
    {
        return $this->morphOne(User::class, 'profile');
    }

    public function classRoom(): BelongsTo
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }
}
```

Tambahkan import model:

```php
use App\Models\ClassRoom;
use App\Models\User;
```

`Student` memiliki dua relasi:

- `classRoom()` menggunakan `belongsTo` karena setiap Student berada pada satu ClassRoom;
- `user()` menggunakan `morphOne` karena Student merupakan profile dari satu User.

## Relasi Kebalikan pada `ClassRoom`

Buka `app/Models/ClassRoom.php` dan tambahkan:

```php
use App\Models\Student;
use Illuminate\Database\Eloquent\Relations\HasMany;

public function students(): HasMany
{
    return $this->hasMany(Student::class, 'class_id');
}
```

Relasi tersebut memungkinkan penggunaan:

```php
$student->classRoom;
$classRoom->students;
$student->user;
$user->profile;
```

## Pengujian dengan Tinker

```powershell
php artisan tinker
```

Buat `ClassRoom`:

```php
$classRoom = App\Models\ClassRoom::create([
    'name' => 'X-A',
    'level' => 'X',
]);
```

Buat `Student`:

```php
$student = App\Models\Student::create([
    'class_id' => $classRoom->id,
    'nis' => '2026001',
    'name' => 'Siti Aminah',
    'gender' => 'female',
    'birth_date' => '2010-05-12',
    'birth_place' => 'Jakarta',
]);
```

Periksa relasi:

```php
$student->classRoom;
$classRoom->students;
```

Account `User` dibuat setelah profile `Student` tersedia:

```php
$user = App\Models\User::create([
    'email' => 'siti@prezence.test',
    'password' => 'password',
    'role' => 'student',
    'is_active' => true,
    'must_change_password' => true,
    'profile_type' => App\Models\Student::class,
    'profile_id' => $student->id,
]);
```

Uji polymorphic relation:

```php
$student->fresh()->user;
$user->fresh()->profile;
```
