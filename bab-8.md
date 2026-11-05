# 📘 BAB 8 — UPLOAD FILE DAN IMPORT DATA CSV

Pada bab ini kita mempelajari proses upload file dan pengolahan data CSV menggunakan Laravel, React, dan Inertia.

Import CSV bukan sekadar proses memasukkan banyak data sekaligus. Fitur ini merupakan contoh lengkap dari alur:

```text
Browser memilih file
        ↓
Browser meng-upload file
        ↓
Laravel menerima file
        ↓
Sistem memvalidasi file
        ↓
Sistem membaca dan mengolah isi file
        ↓
Sistem menyimpan data yang valid
        ↓
Sistem melaporkan data berhasil, skipped, dan failed
        ↓
Browser menampilkan hasil proses
```

Pada aplikasi Prezence, file CSV digunakan untuk membuat profile `Teacher` dan `Student`. File CSV tidak membuat account `User`. Account dibuat kemudian melalui fitur `Create account` yang telah dibuat pada Bab 7.

---

## 8.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda diharapkan mampu:

- memahami konsep upload file pada aplikasi web;
- membuat form upload menggunakan React dan MUI;
- menggunakan `mui-file-input` untuk memilih file;
- mengirim file menggunakan Inertia dan `multipart/form-data`;
- menerima file menggunakan Laravel `Request`;
- memvalidasi tipe dan ukuran file;
- membaca isi file CSV secara bertahap;
- memvalidasi data pada setiap baris;
- menangani data valid, duplikat, dan invalid;
- menyimpan profile hasil import ke database;
- menampilkan ringkasan hasil import kepada Admin;
- membedakan proses import profile dari pembuatan account `User`.

---

## 8.2 Memahami Upload File

Ketika pengguna mengirim form biasa, data biasanya dikirim dalam format URL-encoded. File membutuhkan format khusus, yaitu `multipart/form-data`.

```text
Form biasa
    name=Budi&mobile_phone=081234567890

Form dengan file
    field text + binary file content
```

Pada frontend, Inertia dapat mengubah data form menjadi `FormData`. Pada backend Laravel, file yang dikirim dapat diakses melalui object `UploadedFile`.

```php
$file = $request->file('file');
```

File yang di-upload belum boleh langsung dipercaya. Sistem harus memeriksa validitasnya sebelum file dibaca atau disimpan.

---

## 8.3 Aturan Import pada Prezence

Sesuai SRS, terdapat dua jenis file CSV:

### `teacher.csv`

```csv
name,mobile_phone
Budi Santoso,081234567890
Siti Rahma,081234567891
```

Field yang dibaca:

| Field | Aturan |
| --- | --- |
| `name` | Required, string |
| `mobile_phone` | Required, unique pada tabel `teachers` |

### `student.csv`

```csv
name,nis,gender,birth_date,birth_place,class_name
Siti Rahma,2026001,female,2010-05-12,Jakarta,X-A
```

File contoh yang dapat digunakan untuk latihan tersedia pada folder:

```text
contoh-csv/teachers.csv
contoh-csv/students.csv
```

File tersebut berisi masing-masing 10 data `Teacher` dan 30 data `Student`.

Field yang dibaca:

| Field | Aturan |
| --- | --- |
| `name` | Required, string |
| `nis` | Required, unique pada tabel `students` |
| `gender` | Required |
| `birth_date` | Required, format `YYYY-MM-DD`, sebelum hari ini |
| `birth_place` | Required |
| `class_name` | Required, harus tersedia pada `class_rooms` |

File CSV tidak memiliki field `email`. Import hanya membuat profile. Account `User` dibuat melalui proses terpisah setelah import selesai.

---

## 8.4 Menyiapkan Route Import

Tambahkan route berikut di dalam group `auth` dan `role:admin` pada `routes/web.php`:

```php
use App\Http\Controllers\Admin\ImportStudentController;
use App\Http\Controllers\Admin\ImportTeacherController;

Route::get('/import/teachers', [ImportTeacherController::class, 'create'])
    ->name('import.teachers.create');
Route::post('/import/teachers', [ImportTeacherController::class, 'store'])
    ->name('import.teachers.store');

Route::get('/import/students', [ImportStudentController::class, 'create'])
    ->name('import.students.create');
Route::post('/import/students', [ImportStudentController::class, 'store'])
    ->name('import.students.store');
```

Struktur route tersebut memisahkan:

- `GET`: menampilkan form upload;
- `POST`: menerima dan mengolah file.

Pastikan route berada di dalam middleware berikut:

```php
Route::middleware(['auth', 'role:admin'])
```

Menu upload pada frontend bukan pengganti middleware. Admin tetap harus dilindungi pada server.

---

## 8.5 Membuat Form Request Upload

Buat Form Request:

```powershell
php artisan make:request ImportTeacherRequest
php artisan make:request ImportStudentRequest
```

Contoh `ImportTeacherRequest`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:csv,txt',
                'max:2048',
            ],
        ];
    }
}
```

Aturan `max:2048` menggunakan satuan kilobyte, sehingga batas file adalah sekitar 2 MB.

`mimes` membantu membatasi jenis file, tetapi isi file tetap harus diperiksa. Mengganti nama file menjadi `.csv` tidak otomatis membuat isinya menjadi CSV yang valid.

Form Request Student menggunakan aturan upload file yang sama:

```php
'file' => [
    'required',
    'file',
    'mimes:csv,txt',
    'max:2048',
],
```

---

## 8.6 Memasang `mui-file-input`

Gunakan package `mui-file-input` agar input file memiliki tampilan dan perilaku yang konsisten dengan MUI.

Pasang package pada project:

```powershell
npm install mui-file-input
```

Package ini menyediakan component `MuiFileInput` yang dapat digunakan untuk memilih satu file. Component tersebut menghasilkan object `File` yang dapat diberikan kepada `useForm()` dari Inertia.

---

## 8.7 Membuat Page Upload

Buat struktur page:

```text
resources/js/pages/Admin/Import/
├── Teachers.tsx
├── Students.tsx
└── Result.tsx
```

Contoh page `Teachers.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { MuiFileInput } from 'mui-file-input';
import type { FormEvent } from 'react';
import MainLayout from '@/layouts/MainLayout';

export default function ImportTeachers() {
    const form = useForm<{ file: File | null }>({
        file: null,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        form.post('/admin/import/teachers', {
            forceFormData: true,
        });
    }

    return (
        <>
            <Head title="Import Teachers" />

            <MainLayout>
                <Paper sx={{ maxWidth: 600, p: 4 }}>
                    <Stack
                        component="form"
                        spacing={2}
                        onSubmit={submit}
                    >
                        <Typography variant="h4">
                            Import Teachers
                        </Typography>

                        <MuiFileInput
                            size="small"
                            label="File CSV"
                            value={form.data.file}
                            onChange={(file) => form.setData('file', file)}
                            error={Boolean(form.errors.file)}
                            helperText={form.errors.file ?? 'Pilih file CSV maksimal 2 MB'}
                        />

                        <Box sx={{ width: '100px' }}>
                            <Button size="small" fullWidth type="submit" variant="contained" disabled={form.processing}>
                                Upload dan Import
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </MainLayout>
        </>
    );
}
```

Hal penting pada contoh tersebut adalah:

```tsx
forceFormData: true
```

Tanpa `FormData`, browser tidak mengirim isi file dengan benar kepada server.

Page `Students.tsx` menggunakan pola yang sama, tetapi mengirim ke:

```text
/admin/import/students
```

---

## 8.8 Membuat `ImportResult`

Sistem perlu mengembalikan hasil yang mudah dipahami. Gunakan struktur data seperti berikut:

```php
[
    'imported' => 8,
    'skipped' => 2,
    'failed' => 1,
    'errors' => [
        [
            'row' => 5,
            'reason' => 'mobile_phone sudah digunakan.',
        ],
    ],
]
```

Arti setiap status:

| Status | Arti |
| --- | --- |
| `imported` | Baris berhasil divalidasi dan disimpan |
| `skipped` | Baris dilewati karena data sudah ada |
| `failed` | Baris gagal karena format atau isi tidak valid |

Buat component `Result.tsx` untuk menampilkan ringkasan:

```tsx
type ImportError = {
    row: number;
    reason: string;
};

type ImportResultProps = {
    imported: number;
    skipped: number;
    failed: number;
    errors: ImportError[];
};
```

Component tersebut dapat menampilkan jumlah setiap status menggunakan `Alert`, `Typography`, atau `Table` dari MUI.

---

## 8.9 Membaca File CSV di Laravel

Buat Controller:

```powershell
php artisan make:controller Admin/ImportTeacherController
php artisan make:controller Admin/ImportStudentController
```

Contoh cara membaca file CSV menggunakan PHP:

```php
$handle = fopen($request->file('file')->getRealPath(), 'r');

$header = fgetcsv($handle);

while (($row = fgetcsv($handle)) !== false) {
    $data = array_combine($header, $row);

    // Validasi dan proses $data.
}

fclose($handle);
```

`fgetcsv()` membaca satu baris setiap kali dipanggil. Pendekatan ini sesuai untuk pembelajaran karena memperlihatkan proses pengolahan file secara jelas.

Perhatikan beberapa kemungkinan masalah:

- file kosong;
- header tidak sesuai;
- jumlah kolom pada baris tidak sesuai;
- baris kosong;
- nilai memiliki spasi tambahan;
- file menggunakan delimiter yang berbeda;
- file memiliki encoding yang berbeda.

Jangan langsung memanggil `array_combine()` sebelum memastikan jumlah kolom sesuai dengan jumlah header.

---

## 8.10 Mengolah `teacher.csv`

Contoh alur pada method `store()`:

```php
public function store(ImportTeacherRequest $request): RedirectResponse
{
    $handle = fopen($request->file('file')->getRealPath(), 'r');
    $header = fgetcsv($handle);

    $result = [
        'imported' => 0,
        'skipped' => 0,
        'failed' => 0,
        'errors' => [],
    ];

    $expectedHeader = ['name', 'mobile_phone'];

    if ($header !== $expectedHeader) {
        fclose($handle);

        return back()->withErrors([
            'file' => 'Header CSV tidak sesuai.',
        ]);
    }

    $rowNumber = 1;

    while (($row = fgetcsv($handle)) !== false) {
        $rowNumber++;

        if (count($row) !== count($header)) {
            $result['failed']++;
            $result['errors'][] = [
                'row' => $rowNumber,
                'reason' => 'Jumlah kolom tidak sesuai.',
            ];
            continue;
        }

        $data = array_combine($header, array_map('trim', $row));

        if ($data['name'] === '' || $data['mobile_phone'] === '') {
            $result['failed']++;
            $result['errors'][] = [
                'row' => $rowNumber,
                'reason' => 'Name dan mobile_phone wajib diisi.',
            ];
            continue;
        }

        if (Teacher::where('mobile_phone', $data['mobile_phone'])->exists()) {
            $result['skipped']++;
            continue;
        }

        Teacher::create($data);
        $result['imported']++;
    }

    fclose($handle);

    return back()->with('import_result', $result);
}
```

Pada implementasi lengkap, validasi setiap baris sebaiknya dipindahkan ke `ImportTeacherService` agar Controller tetap ringkas.

Import ini hanya membuat:

```text
Teacher profile
```

Import ini tidak membuat:

```text
User account
email
temporary password
```

---

## 8.11 Mengolah `student.csv`

Import Student memiliki proses tambahan karena harus mencari `ClassRoom` berdasarkan `class_name`.

```php
$classRoom = ClassRoom::where('name', $data['class_name'])->first();

if (! $classRoom) {
    $result['failed']++;
    $result['errors'][] = [
        'row' => $rowNumber,
        'reason' => 'ClassRoom tidak ditemukan.',
    ];
    continue;
}
```

Sebelum membuat `Student`, lakukan pemeriksaan berikut:

```php
if (Student::where('nis', $data['nis'])->exists()) {
    $result['skipped']++;
    continue;
}
```

Data yang disimpan ke tabel `students` tidak lagi menggunakan `class_name`. Field tersebut diubah menjadi `class_id`:

```php
Student::create([
    'class_id' => $classRoom->id,
    'nis' => $data['nis'],
    'name' => $data['name'],
    'gender' => $data['gender'],
    'birth_date' => $data['birth_date'],
    'birth_place' => $data['birth_place'],
]);
```

Validasi `birth_date` harus memastikan:

- formatnya `YYYY-MM-DD`;
- nilainya merupakan tanggal valid;
- tanggal tersebut bukan tanggal masa depan.

---

## 8.12 Menambahkan Link Import pada Halaman Profile

Link menuju halaman import diletakkan pada halaman daftar profile yang terkait. Dengan begitu, Admin dapat melihat hubungan antara data `Teacher` atau `Student` dengan proses import datanya.

Buka `resources/js/pages/Admin/Teachers/Index.tsx` dan letakkan button import di sebelah button tambah:

```tsx
<Stack direction="row" spacing={1}>
    <Button
        onClick={() => router.visit('/admin/teachers/create')}
        variant="contained"
    >
        Tambah Teacher
    </Button>
    <Button
        onClick={() => router.visit('/admin/import/teachers')}
        variant="outlined"
    >
        Import Teacher
    </Button>
</Stack>
```

Pada halaman `Student`, gunakan pola yang sama:

```tsx
<Stack direction="row" spacing={1}>
    <Button
        onClick={() => router.visit('/admin/students/create')}
        variant="contained"
    >
        Tambah Student
    </Button>
    <Button
        onClick={() => router.visit('/admin/import/students')}
        variant="outlined"
    >
        Import Student
    </Button>
</Stack>
```

Link import tidak ditambahkan pada `MainLayout.tsx`. `MainLayout` tetap berisi navigasi umum aplikasi, sedangkan navigasi yang khusus untuk pengelolaan `Teacher` dan `Student` berada pada page masing-masing.

Button frontend hanya membantu navigasi. Authorization tetap dilakukan oleh middleware pada route.

---

## 8.13 Account Dibuat Setelah Import

Setelah import selesai, profile dapat dilihat pada halaman daftar `Teacher` atau `Student`.

```text
Import CSV
    ↓
Profile Teacher atau Student dibuat
    ↓
Profile belum memiliki account
    ↓
Admin membuka daftar profile
    ↓
Admin memilih Create account
    ↓
Admin mengisi email
    ↓
Sistem membuat User
    ↓
Sistem membuat temporary password
    ↓
Sistem mengirim email credential
```

Dengan alur ini, import profile dan pembuatan account tetap menjadi dua proses yang berbeda.

---

## 8.14 Keamanan dan Validasi

Perhatikan hal-hal berikut:

- hanya `admin` yang boleh meng-upload file import;
- validasi file harus dilakukan pada server;
- jangan mempercayai nama file dari browser;
- batasi ukuran file;
- validasi header CSV;
- validasi setiap baris secara terpisah;
- jangan menyimpan temporary password ke log;
- jangan membuat account dari file CSV;
- gunakan transaction jika seluruh import harus berhasil atau gagal bersama-sama;
- gunakan proses per baris jika ingin tetap menyimpan baris valid dan melaporkan baris gagal.

Pada bab ini digunakan strategi per baris: baris valid disimpan, sedangkan baris invalid atau duplikat dicatat pada hasil import.

---

## 8.15 Latihan Mandiri

1. Buat page upload `Teachers.tsx`.
2. Buat page upload `Students.tsx`.
3. Buat route GET dan POST untuk kedua jenis import.
4. Validasi file agar hanya menerima CSV dengan ukuran maksimal 2 MB.
5. Tolak file dengan header yang tidak sesuai.
6. Implementasikan import `teacher.csv`.
7. Implementasikan import `student.csv`.
8. Lewati `Teacher` dengan `mobile_phone` yang sudah ada.
9. Lewati `Student` dengan `nis` yang sudah ada.
10. Tandai baris dengan `ClassRoom` yang tidak ditemukan sebagai `failed`.
11. Tampilkan jumlah `imported`, `skipped`, dan `failed`.
12. Pastikan import tidak membuat account `User`.
13. Setelah import selesai, buat account melalui tombol `Create account` pada daftar profile.

---

## 8.16 Ringkasan Bab Ini

Pada bab ini kita telah:

- memahami upload file sebagai proses request dengan `multipart/form-data`;
- membuat form upload React dengan Inertia;
- menggunakan `mui-file-input` sebagai component file picker berbasis MUI;
- menerima dan memvalidasi `UploadedFile` di Laravel;
- membaca file CSV menggunakan `fgetcsv()`;
- memvalidasi header dan isi setiap baris;
- mengolah data `Teacher` dan `Student`;
- menangani data berhasil, skipped, dan failed;
- menyimpan profile tanpa membuat account;
- memahami hubungan import profile dengan proses `Create account`.

Pada bab berikutnya, fitur aplikasi dapat dilanjutkan dengan penyempurnaan account management, `TeachingAssignment`, atau fitur `Attendance` sesuai urutan pembelajaran.
