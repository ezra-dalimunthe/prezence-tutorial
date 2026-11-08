# 📘 BAB 9 — TEACHING ASSIGNMENT

Pada bab ini kita membuat CRUD `TeachingAssignment` dan menyiapkan data awal menggunakan seeder yang dijalankan secara manual melalui terminal.

`TeachingAssignment` menghubungkan tiga entitas:

```text
Teacher + Subject + ClassRoom
              ↓
    TeachingAssignment
```

Assignment menjadi dasar untuk menentukan ClassRoom yang boleh digunakan Teacher ketika mencatat Attendance pada Bab 10.

---

## 9.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda diharapkan mampu:

- memahami hubungan `Teacher`, `Subject`, dan `ClassRoom`;
- membuat CRUD resource dengan Laravel;
- membuat form yang menggunakan data dari beberapa tabel;
- memvalidasi foreign key;
- mencegah kombinasi assignment yang sama;
- menggunakan pagination pada daftar assignment;
- membuat seeder terpisah;
- menjalankan seeder menggunakan `php artisan db:seed --class`.

---

## 9.2 Struktur `TeachingAssignment`

Tabel `teaching_assignments` sudah dibuat pada bab sebelumnya.

| Field                  | Aturan                              |
| ---------------------- | ----------------------------------- |
| `teacher_id`           | Required, exists pada `teachers`    |
| `subject_id`           | Required, exists pada `subjects`    |
| `class_id`             | Required, exists pada `class_rooms` |
| kombinasi ketiga field | Unique                              |

Satu Teacher dapat memiliki banyak assignment. Satu Subject dan ClassRoom juga dapat digunakan pada banyak assignment.

---

## 9.3 Membuat Controller dan Form Request

```powershell
php artisan make:controller Admin/TeachingAssignmentController --resource
php artisan make:request StoreTeachingAssignmentRequest
php artisan make:request UpdateTeachingAssignmentRequest
```

Buat route resource di dalam middleware Admin:

```php
Route::resource('teaching-assignments', TeachingAssignmentController::class)
    ->except(['show']);
```

Route yang tersedia:

```text
GET      /admin/teaching-assignments
GET      /admin/teaching-assignments/create
POST     /admin/teaching-assignments
GET      /admin/teaching-assignments/{teaching_assignment}/edit
PUT      /admin/teaching-assignments/{teaching_assignment}
DELETE   /admin/teaching-assignments/{teaching_assignment}
```

---

## 9.4 Validasi `TeachingAssignment`

Validasi pada `StoreTeachingAssignmentRequest` tidak hanya memeriksa setiap
foreign key. Request juga harus memastikan bahwa hanya `admin` yang dapat
menyimpan assignment dan kombinasi `Teacher`, `Subject`, serta `ClassRoom` belum
tersedia.

```php
use Illuminate\Validation\Rule;

public function authorize(): bool
{
    return $this->user()?->role === 'admin';
}
```

Rules yang digunakan:

```php
public function rules(): array
{
    return [
        'teacher_id' => [
            'required',
            'exists:teachers,id',
            Rule::unique('teaching_assignments')->where(function ($query) {
                return $query
                    ->where('subject_id', $this->input('subject_id'))
                    ->where('class_id', $this->input('class_id'));
            }),
        ],
        'subject_id' => ['required', 'exists:subjects,id'],
        'class_id' => ['required', 'exists:class_rooms,id'],
    ];
}
```

`Rule::unique()` pada `teacher_id` digabungkan dengan kondisi `subject_id` dan
`class_id`. Dengan demikian, validasi memeriksa kombinasi ketiga field, bukan
hanya `teacher_id` secara terpisah.

Database juga memiliki unique constraint sebagai perlindungan lapisan kedua:

```php
$table->unique(
    ['teacher_id', 'subject_id', 'class_id'],
    'assignments_t_s_c_unique',
);
```

Constraint tersebut mencegah kombinasi `Teacher`, `Subject`, dan `ClassRoom`
yang sama disimpan dua kali meskipun request tidak berasal dari form frontend.

Pada `UpdateTeachingAssignmentRequest`, gunakan rule yang sama dan abaikan
record yang sedang diubah:

```php
/** @var TeachingAssignment $assignment */
$assignment = $this->route('teaching_assignment');

Rule::unique('teaching_assignments')->where(
    fn ($query) => $query
        ->where('subject_id', $this->input('subject_id'))
        ->where('class_id', $this->input('class_id'))
)->ignore($assignment);
```

`ignore($assignment)` diperlukan agar assignment tidak dianggap duplikat dengan
dirinya sendiri ketika hanya field lain yang diubah.

---

## 9.5 Menampilkan Data Pilihan pada Form

Form `Create` dan `Edit` membutuhkan tiga pilihan:

```php
'teachers' => Teacher::orderBy('name')->get(['id', 'name']),
'subjects' => Subject::orderBy('name')->get(['id', 'name']),
'classRooms' => ClassRoom::orderBy('level')
    ->orderBy('name')
    ->get(['id', 'name', 'level']),
```

Frontend menggunakan MUI `Select`:

```tsx
<Select
    size="small"
    value={form.data.teacher_id}
    onChange={(event) => form.setData('teacher_id', event.target.value)}
>
    {teachers.map((teacher) => (
        <MenuItem key={teacher.id} value={teacher.id}>
            {teacher.name}
        </MenuItem>
    ))}
</Select>
```

Gunakan pola yang sama untuk `Subject` dan `ClassRoom`.

---

## 9.6 Reusable Form untuk Create dan Edit

Struktur frontend:

```text
resources/js/pages/Admin/TeachingAssignments/
├── Index.tsx
├── Create.tsx
├── Edit.tsx
└── Form.tsx
```

`Create.tsx` mengirim `POST`:

```tsx
const form = useForm({
    teacher_id: '',
    subject_id: '',
    class_id: '',
});

function submit(event: FormEvent) {
    event.preventDefault();
    form.post('/admin/teaching-assignments');
}
```

`Edit.tsx` menggunakan Form yang sama, tetapi mengirim `PUT`:

```tsx
form.put(`/admin/teaching-assignments/${assignment.id}`);
```

---

## 9.7 Pagination pada Daftar Assignment

Gunakan pagination pada sisi server:

```php
'assignments' => TeachingAssignment::with([
    'teacher',
    'subject',
    'classRoom',
])
    ->orderBy('id')
    ->paginate(10)
    ->withQueryString(),
```

Frontend menggunakan `assignments.data` dan `MUI TablePagination`, seperti yang telah dipelajari pada Bab 7.

---

## 9.8 Membuat Seeder `Subject`

Buat seeder:

```powershell
php artisan make:seeder SubjectSeeder
```

Isi dengan daftar Subject berikut:

```php
$subjects = [
    'Bahasa Indonesia',
    'Sejarah',
    'Pendidikan Pancasila',
    'PJOK',
    'Bahasa Inggris',
    'Matematika',
];

foreach ($subjects as $name) {
    Subject::firstOrCreate(['name' => $name]);
}
```

Seeder ini sengaja tidak dipanggil dari `DatabaseSeeder`.

Jalankan secara manual:

```powershell
php artisan db:seed --class=SubjectSeeder
```

---

## 9.9 Membuat Seeder `ClassRoom`

Buat seeder:

```powershell
php artisan make:seeder ClassRoomSeeder
```

Contoh data:

```php
$classRooms = [
    ['name' => 'X-A', 'level' => 'X'],
    ['name' => 'X-B', 'level' => 'X'],
    ['name' => 'XI-A', 'level' => 'XI'],
    ['name' => 'XI-B', 'level' => 'XI'],
    ['name' => 'XII-A', 'level' => 'XII'],
    ['name' => 'XII-B', 'level' => 'XII'],
];

foreach ($classRooms as $classRoom) {
    ClassRoom::firstOrCreate(
        ['name' => $classRoom['name']],
        $classRoom,
    );
}
```

Jalankan dengan:

```powershell
php artisan db:seed --class=ClassRoomSeeder
```

Jika data `ClassRoom` sudah tersedia, `firstOrCreate()` mencegah data dengan nama yang sama dibuat kembali.

---

## 9.10 Membuat Seeder `TeachingAssignment`

Buat seeder:

```powershell
php artisan make:seeder TeachingAssignmentSeeder
```

Seeder ini membutuhkan data `Subject` dan `ClassRoom`. Jalankan seeder dengan urutan:

```powershell
php artisan db:seed --class=SubjectSeeder
php artisan db:seed --class=ClassRoomSeeder
php artisan db:seed --class=TeachingAssignmentSeeder
```

Contoh assignment:

```php
TeachingAssignment::firstOrCreate([
    'teacher_id' => $teacher->id,
    'subject_id' => $subject->id,
    'class_id' => $classRoom->id,
]);
```

Seeder implementasi juga membuat beberapa profile `Teacher` jika belum tersedia. Seeder ini tidak membuat account `User` secara otomatis.

Dengan demikian, pembuatan profile dan pembuatan account tetap merupakan dua proses yang berbeda.

---

## 9.11 Latihan Mandiri

1. Tambahkan Subject baru.
2. Tambahkan ClassRoom baru.
3. Buat assignment untuk Teacher yang berbeda.
4. Coba menyimpan kombinasi Teacher, Subject, dan ClassRoom yang sama.
5. Ubah assignment dan pastikan kombinasi unik tetap divalidasi.
6. Hapus assignment yang belum digunakan oleh Attendance.
7. Jalankan setiap seeder secara terpisah dari terminal.

---

## 9.12 Custom Validation Error Message

Ketika kombinasi `Teacher`, `Subject`, dan `ClassRoom` yang sama disimpan,
Laravel dapat menghasilkan pesan default seperti:

```text
The teacher id has already been taken.
```

Pesan tersebut menggunakan nama field dan bahasa teknis, sehingga kurang
sesuai untuk ditampilkan kepada user. Kita dapat menggantinya dengan pesan yang
lebih mudah dipahami.

Pada file `app/Http/Requests/StoreTeachingAssignmentRequest.php`, tambahkan
method `messages()`:

```php
public function messages(): array
{
    return [
        'teacher_id.unique' =>
            'Teacher sudah memiliki assignment untuk Subject dan ClassRoom tersebut.',
    ];
}
```

Key `teacher_id.unique` berarti pesan tersebut digunakan ketika rule `unique`
pada field `teacher_id` gagal. Karena rule `unique` menggunakan kondisi
`subject_id` dan `class_id`, pesan tersebut mewakili kegagalan kombinasi ketiga
field.

Validasi `required` dan `exists` tetap menggunakan pesan default Laravel pada
contoh ini. Jika ingin seluruh pesan lebih ramah user, tambahkan pesan lain,
misalnya:

```php
public function messages(): array
{
    return [
        'teacher_id.required' => 'Teacher wajib dipilih.',
        'teacher_id.exists' => 'Teacher yang dipilih tidak tersedia.',
        'teacher_id.unique' =>
            'Teacher sudah memiliki assignment untuk Subject dan ClassRoom tersebut.',
        'subject_id.required' => 'Subject wajib dipilih.',
        'subject_id.exists' => 'Subject yang dipilih tidak tersedia.',
        'class_id.required' => 'ClassRoom wajib dipilih.',
        'class_id.exists' => 'ClassRoom yang dipilih tidak tersedia.',
    ];
}
```

Karena `UpdateTeachingAssignmentRequest` juga menggunakan validasi kombinasi
yang sama, method `messages()` sebaiknya ditambahkan di request tersebut agar
pesannya konsisten ketika proses edit gagal.

---

## 9.13 Ringkasan Bab Ini

Pada bab ini kita telah:

- membuat CRUD `TeachingAssignment`;
- menghubungkan `Teacher`, `Subject`, dan `ClassRoom`;
- menggunakan reusable Form untuk Create dan Edit;
- menggunakan foreign key validation;
- mencegah assignment duplikat;
- menerapkan server-side pagination;
- membuat dan menjalankan seeder secara manual;
- menyiapkan data yang diperlukan untuk pencatatan Attendance.
- membuat `custom validation message` untuk validasi yang gagal.

Pada Bab 10, `Teacher` akan menggunakan `TeachingAssignment` untuk mencatat Attendance Student.
