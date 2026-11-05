# 📘 BAB 7 — ADMIN PAGE DAN PEMBUATAN PROFILE

Pada bab ini kita mulai membuat halaman yang hanya dapat diakses oleh `admin`.

Fokus bab ini:

- middleware authorization untuk `role = admin`;
- menu admin pada Toolbar;
- Admin Dashboard;
- page untuk membuat profile `Teacher`, `Student`, dan `Staff`.

CRUD `Subject` dan `ClassRoom` menjadi latihan mandiri. Gunakan [bab-tambahan-crud-subject.md](bab-tambahan-crud-subject.md) dan [bab-tambahan-crud-classroom.md](bab-tambahan-crud-classroom.md) sebagai contekan.

---

## 7.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda diharapkan mampu:

- membatasi route berdasarkan `Role`;
- membuat middleware authorization;
- menampilkan menu berdasarkan role User;
- membuat page admin dengan React, Inertia, dan MUI;
- memisahkan pembuatan profile dari pembuatan account;
- menggunakan component `Form` yang dapat dipakai oleh page `Create` dan `Edit`;
- membuat account melalui modal dan mengirim credential melalui email;
- menggunakan Form Request untuk validasi.

---

## 7.2 Alur Pembuatan Profile dan Account

Profile dan account dibuat melalui dua proses yang berbeda. Profile dapat disimpan tanpa account. Account hanya dibuat jika Admin memilih tindakan tersebut setelah profile berhasil disimpan.

```text
Admin mengisi data profile
        ↓
Sistem memvalidasi data
        ↓
Sistem membuat profile
        ↓
Sistem menampilkan modal pembuatan account
        ↓
Admin memilih "Nanti" atau "Create account"
        ↓
Jika "Nanti" → proses selesai
        ↓
Jika "Create account" → Admin mengisi email
        ↓
Sistem membuat User dan menghubungkannya dengan profile
        ↓
Sistem membuat temporary password
        ↓
Sistem mengirim credential melalui email
```

Profile disimpan dalam transaction profile. Pembuatan account menggunakan transaction terpisah. Jika pengiriman email gagal, account tetap tersimpan dan Admin dapat menggunakan fitur pengiriman ulang credential.

---

## 7.3 Membuat Middleware `role`

Middleware `auth` hanya memeriksa apakah User sudah login. Middleware `role` memeriksa role User.

```powershell
php artisan make:middleware RoleMiddleware
```

Buka `app/Http/Middleware/RoleMiddleware.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(
        Request $request,
        Closure $next,
        string ...$roles
    ): Response {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            abort(403);
        }

        return $next($request);
    }
}
```

Daftarkan alias pada `bootstrap/app.php`:

```php
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Configuration\Middleware;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'role' => RoleMiddleware::class,
    ]);
})
```

Route admin dapat menggunakan:

```php
Route::middleware(['auth', 'role:admin'])
```

---

## 7.4 Menu Admin pada Toolbar

Buka `resources/js/layouts/MainLayout.tsx`:

```tsx
const user = auth?.user;
const isAdmin = user?.role === 'admin';
```

Tampilkan menu admin secara kondisional:

```tsx
{isAdmin && (
    <>
        <Button onClick={() => router.visit('/admin/teachers')}>
            Teachers
        </Button>
        <Button onClick={() => router.visit('/admin/students')}>
            Students
        </Button>
        <Button onClick={() => router.visit('/admin/staff')}>
            Staff
        </Button>
    </>
)}
```

Menu frontend bukan pengganti authorization server. Route dan Controller tetap harus dilindungi middleware.

Gunakan `size="small"` pada button dan bungkus setiap button dengan `Box` selebar `100px` agar ukuran navigasi tetap konsisten:

```tsx
<Box sx={{ width: '100px' }}>
    <Button size="small" fullWidth onClick={() => router.visit('/admin/teachers')}>
        Teachers
    </Button>
</Box>
```

Import `Box` dari MUI bersama component lainnya.

### Dashboard Berdasarkan `Role`

Route `/` tetap diarahkan ke page:

```text
resources/js/pages/Dashboard.tsx
```

Pemilihan dashboard tidak dilakukan dengan membaca `auth` secara langsung pada React. `DashboardController` menentukan `type` dari role User dan mengirim `type` serta `payload` melalui Inertia:

Setelah model `Teacher`, `Student`, dan `Staff` tersedia, sesuaikan method `index()` pada `DashboardController` menjadi:

```php
use App\Models\Staff;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

public function index(Request $request)
{
    $type = $request->user()?->role ?? 'guest';

    return Inertia::render('Dashboard', [
        'type' => $type,
        'payload' => match ($type) {
            'admin' => [
                'numberOfStudents' => Student::count(),
                'numberOfTeachers' => Teacher::count(),
                'numberOfStaffs' => Staff::count(),
            ],
            default => [],
        },
    ]);
}
```

Alur rendering-nya adalah:

```text
DashboardController
        ↓
type + payload melalui Inertia
        ↓
pages/Dashboard.tsx
        ↓
layouts/DynamicDashboard.tsx
        ↓
pages/Admin/Dashboard.tsx
```

`Dashboard.tsx` tetap menjadi page Inertia yang memiliki `Head` dan `MainLayout`. `DynamicDashboard` memilih component berdasarkan `type`, sedangkan `Admin/Dashboard.tsx` hanya berisi content dashboard. Karena itu, `Admin/Dashboard.tsx` tidak perlu memiliki `Head` atau `MainLayout` sendiri. Pola ini juga tidak memerlukan `Outlet` dari `react-router-dom`.

---

## 7.5 Admin Dashboard

Admin dashboard dirender sebagai content oleh `DynamicDashboard`. Tidak perlu membuat `Admin/DashboardController` atau route `/admin` khusus untuk menampilkan dashboard. Route `/` tetap ditangani oleh `DashboardController` pada Bab 3.

Buat atau sesuaikan page berikut:

```text
resources/js/pages/Admin/Dashboard.tsx
```

Isi dengan:

```tsx
import { Paper, Stack, Typography } from '@mui/material';

interface AdminPayload {
    numberOfStudents: number;
    numberOfTeachers: number;
    numberOfStaffs: number;
}

export default function AdminDashboard({
    payload,
}: {
    payload: AdminPayload;
}) {
    return (
        <Stack spacing={2}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4">Admin Dashboard</Typography>
                <Typography sx={{ mt: 1 }}>
                    Jumlah Siswa: {payload.numberOfStudents}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Jumlah Guru: {payload.numberOfTeachers}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Jumlah Staf: {payload.numberOfStaffs}
                </Typography>
            </Paper>
        </Stack>
    );
}
```

`Admin/Dashboard.tsx` menerima `payload` dari `Dashboard.tsx` melalui `DynamicDashboard`. Jumlah yang ditampilkan berasal dari query pada `DashboardController`, bukan dari query database di React.

---

## 7.6 Membuat Profile `Teacher`

Buat Controller dan Form Request:

```powershell
php artisan make:controller Admin/TeacherController
php artisan make:request StoreTeacherRequest
php artisan make:request UpdateTeacherRequest
php artisan make:request CreateTeacherAccountRequest
```

Field profile `Teacher` hanya terdiri dari `name` dan `mobile_phone`. Email tidak boleh berada pada form profile.

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'mobile_phone' => ['required', 'string', 'unique:teachers,mobile_phone'],
    ];
}
```

Simpan hanya profile pada method `store()`:

```php
$teacher = Teacher::create($request->validated());

return redirect()
    ->route('admin.teachers.index')
    ->with('created_profile_id', $teacher->id);
```

Setelah profile tersimpan, page dapat menampilkan modal pembuatan account. Endpoint account dibuat terpisah dari endpoint profile. Pembuatan `User` memakai `DB::transaction()`, sedangkan email dikirim setelah account berhasil dibuat.

Page yang diperlukan:

```text
resources/js/pages/Admin/Teachers/Index.tsx
resources/js/pages/Admin/Teachers/Create.tsx
resources/js/pages/Admin/Teachers/Edit.tsx
resources/js/pages/Admin/Teachers/Form.tsx
resources/js/pages/Admin/Teachers/CreateAccountModal.tsx
```

Contoh method pembuatan account Teacher:

```php
public function createAccount(
    CreateTeacherAccountRequest $request,
    Teacher $teacher
) {
    abort_if($teacher->user()->exists(), 422, 'Profile sudah memiliki account.');

    $temporaryPassword = Str::random(12);

    $user = DB::transaction(function () use ($request, $teacher, $temporaryPassword) {
        return User::create([
            'email' => $request->string('email')->toString(),
            'password' => $temporaryPassword,
            'role' => 'teacher',
            'is_active' => true,
            'must_change_password' => true,
            'profile_type' => Teacher::class,
            'profile_id' => $teacher->id,
        ]);
    });

    Mail::to($user->email)->send(
        new AccountCredentialMail($user, $temporaryPassword)
    );

    return back()->with('success', 'Account berhasil dibuat.');
}
```

Password di-hash oleh cast `password` pada model `User`. Jika email gagal dikirim, account tetap tersedia dan dapat dikirimi ulang.

## 7.7 Membuat Profile `Student`

Buat Controller dan Form Request:

```powershell
php artisan make:controller Admin/StudentController
php artisan make:request StoreStudentRequest
php artisan make:request UpdateStudentRequest
php artisan make:request CreateStudentAccountRequest
```

Field form:

```text
name
nis
gender
birth_date
birth_place
class_id
```

`class_id` dipilih dari data `ClassRoom` yang tersedia. Kirim pilihan tersebut ke page:

```php
'classRooms' => ClassRoom::query()
    ->orderBy('level')
    ->orderBy('name')
    ->get(['id', 'name', 'level']),
```

Validasi minimal:

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'nis' => ['required', 'string', 'unique:students,nis'],
        'gender' => ['required', 'string'],
        'birth_date' => ['required', 'date', 'before:today'],
        'birth_place' => ['required', 'string', 'max:100'],
        'class_id' => ['required', 'exists:class_rooms,id'],
    ];
}
```

Simpan profile lebih dahulu. Setelah itu, gunakan modal account dengan endpoint terpisah. Account Student menggunakan role `student` dan `profile_type` `Student`.

Page yang diperlukan:

```text
resources/js/pages/Admin/Students/Index.tsx
resources/js/pages/Admin/Students/Create.tsx
resources/js/pages/Admin/Students/Edit.tsx
resources/js/pages/Admin/Students/Form.tsx
resources/js/pages/Admin/Students/CreateAccountModal.tsx
```

Gunakan MUI `Select` untuk `ClassRoom` dan `gender`.

Untuk field `birth_date`, gunakan `DatePicker` dari `@mui/x-date-pickers`:

```tsx
<DatePicker
    label="Birth Date"
    format="YYYY-MM-DD"
    maxDate={dayjs()}
    value={form.data.birth_date ? dayjs(form.data.birth_date) : null}
    onChange={(date) =>
        form.setData('birth_date', date?.format('YYYY-MM-DD') ?? '')
    }
    slotProps={{
        textField: {
            size: 'small',
            error: Boolean(form.errors.birth_date),
            helperText: form.errors.birth_date,
        },
    }}
/> 
```

---

## 7.8 Membuat Profile `Staff`

Buat Controller dan Form Request:

```powershell
php artisan make:controller Admin/StaffController
php artisan make:request StoreStaffRequest
php artisan make:request UpdateStaffRequest
php artisan make:request CreateStaffAccountRequest
```

Field form:

```text
name
position
```

Validasi minimal:

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'position' => ['required', 'string', 'max:50'],
    ];
}
```

Profile `Staff` dibuat lebih dahulu. Role dan email dipilih pada modal pembuatan account karena keduanya merupakan atribut `User`, bukan profile `Staff`.

Page yang diperlukan:

```text
resources/js/pages/Admin/Staff/Index.tsx
resources/js/pages/Admin/Staff/Create.tsx
resources/js/pages/Admin/Staff/Edit.tsx
resources/js/pages/Admin/Staff/Form.tsx
resources/js/pages/Admin/Staff/CreateAccountModal.tsx
```

---

## 7.9 Pola Form React

Gunakan satu component `Form.tsx` untuk tampilan input yang dipakai oleh page `Create.tsx` dan `Edit.tsx`. Page `Create` dan `Edit` tetap memiliki `useForm()` masing-masing karena endpoint dan HTTP method-nya berbeda.

Contoh struktur `Teacher`:

```text
Teachers/
├── Create.tsx
├── Edit.tsx
├── Form.tsx
└── CreateAccountModal.tsx
```

`Create.tsx` mengirim `POST`, sedangkan `Edit.tsx` mengirim `PUT`:

```tsx
const form = useForm({
    name: '',
    mobile_phone: '',
});

const submit = (event: React.FormEvent) => {
    event.preventDefault();
    form.post(route('admin.teachers.store'));
};

return <TeacherForm form={form} onSubmit={submit} mode="create" />;
```

Contoh `Edit.tsx`:

```tsx
const form = useForm({
    name: teacher.name,
    mobile_phone: teacher.mobile_phone,
});

const submit = (event: React.FormEvent) => {
    event.preventDefault();
    form.put(route('admin.teachers.update', teacher.id));
};

return <TeacherForm form={form} onSubmit={submit} mode="edit" />;
```

`Form.tsx` hanya bertanggung jawab atas UI field:

Pada file tersebut, import `Box` dari MUI bersama component lainnya.

```tsx
type TeacherFormProps = {
    form: any;
    onSubmit: (event: React.FormEvent) => void;
    mode: 'create' | 'edit';
};

export default function TeacherForm({ form, onSubmit, mode }: TeacherFormProps) {
    return (
        <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
                size="small"
                label="Name"
                value={form.data.name}
                onChange={(event) => form.setData('name', event.target.value)}
                error={Boolean(form.errors.name)}
                helperText={form.errors.name}
            />
            <TextField
                size="small"
                label="Mobile Phone"
                value={form.data.mobile_phone}
                onChange={(event) => form.setData('mobile_phone', event.target.value)}
                error={Boolean(form.errors.mobile_phone)}
                helperText={form.errors.mobile_phone}
            />
            <Box sx={{ width: '100px' }}>
                <Button size="small" fullWidth type="submit" variant="contained" disabled={form.processing}>
                    {mode === 'create' ? 'Simpan' : 'Update'}
                </Button>
            </Box>
        </Stack>
    );
}
```

`Student/Form.tsx` dan `Staff/Form.tsx` menggunakan pola yang sama dengan field profile masing-masing. Email tidak dimasukkan ke dalam `Form.tsx` profile.

Modal account memiliki form terpisah:

```tsx
const accountForm = useForm({ email: '' });

function createAccount(event: React.FormEvent) {
    event.preventDefault();
    accountForm.post(`/admin/teachers/${teacher.id}/account`);
}
```

Untuk `Staff`, modal juga menampilkan input `role`. Modal tidak ditampilkan jika profile sudah memiliki account. Status ini dapat dikirim dari Controller melalui relasi `user`.

Tampilkan error validasi dari server:

```tsx
{form.errors.name && (
    <FormHelperText error>{form.errors.name}</FormHelperText>
)}
```

Frontend hanya mengirim data. Validasi utama tetap dilakukan pada Form Request di server.

---

## 7.10 Server-side Pagination

Halaman daftar `Teacher`, `Student`, dan `Staff` tidak sebaiknya mengambil seluruh data sekaligus. Jika jumlah data bertambah, penggunaan `get()` dapat menyebabkan:

- query mengambil terlalu banyak record;
- payload dari server ke browser menjadi besar;
- waktu response meningkat;
- browser membutuhkan lebih banyak memory untuk menampilkan table.

Karena itu, gunakan pagination pada sisi server. Server hanya mengambil data untuk halaman yang sedang diminta dan mengirimkan data tersebut kepada frontend.

```text
Browser meminta page 2
        ↓
Laravel menjalankan query untuk page 2
        ↓
Database mengembalikan data sesuai limit dan offset
        ↓
Laravel mengirim data page 2 saja
        ↓
Frontend memperbarui isi table
```

### 7.10.1 Menggunakan `paginate()` pada Controller

Ubah method `index()` pada `TeacherController`:

```php
public function index()
{
    return Inertia::render('Admin/Teachers/Index', [
        'teachers' => Teacher::with('user')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString(),
    ]);
}
```

Gunakan pola yang sama pada `StudentController` dan `StaffController`:

```php
'students' => Student::with(['classRoom', 'user'])
    ->orderBy('name')
    ->paginate(10)
    ->withQueryString(),
```

```php
'staff' => Staff::with('user')
    ->orderBy('name')
    ->paginate(10)
    ->withQueryString(),
```

Angka `10` berarti jumlah record maksimal pada setiap page. Nilai ini dapat disesuaikan dengan kebutuhan aplikasi.

`withQueryString()` mempertahankan parameter query lain ketika pengguna berpindah page, misalnya parameter pencarian atau filter yang akan ditambahkan pada pengembangan berikutnya.

### 7.10.2 Struktur Data Pagination

Laravel mengirimkan object paginator melalui Inertia. Beberapa property pentingnya adalah:

```text
data          data pada page saat ini
current_page  nomor page saat ini, dimulai dari 1
last_page     nomor page terakhir
per_page      jumlah data per page
total         jumlah seluruh data
from          nomor record awal
to            nomor record akhir
```

Frontend tidak menerima array biasa lagi. Prop `teachers`, `students`, dan `staff` harus diperlakukan sebagai object pagination yang memiliki property `data`.

### 7.10.3 Menambahkan `MUI TablePagination`

Pada `resources/js/pages/Admin/Teachers/Index.tsx`, gunakan type berikut:

```tsx
type Pagination<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
```

Import component MUI:

```tsx
import TablePagination from '@mui/material/TablePagination';
import { router } from '@inertiajs/react';
```

Gunakan `teachers.data` ketika melakukan render table:

```tsx
{teachers.data.map((teacher) => (
    <TableRow key={teacher.id}>
        <TableCell>{teacher.name}</TableCell>
        <TableCell>{teacher.mobile_phone}</TableCell>
        <TableCell>{teacher.user?.email ?? '-'}</TableCell>
    </TableRow>
))}
```

Tambahkan `TablePagination` setelah `Table`:

```tsx
<TablePagination
    component="div"
    count={teachers.total}
    page={teachers.current_page - 1}
    rowsPerPage={teachers.per_page}
    rowsPerPageOptions={[teachers.per_page]}
    onPageChange={(_, page) => {
        router.get('/admin/teachers', {
            page: page + 1,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }}
    labelRowsPerPage="Data per halaman"
/>
```

`MUI TablePagination` menggunakan nomor page yang dimulai dari `0`, sedangkan Laravel menggunakan nomor page yang dimulai dari `1`. Karena itu diperlukan konversi:

```tsx
page={teachers.current_page - 1}
```

dan ketika mengirim request kembali ke Laravel:

```tsx
page: page + 1
```

Terapkan pola yang sama pada:

```text
resources/js/pages/Admin/Students/Index.tsx
resources/js/pages/Admin/Staff/Index.tsx
```

Pastikan mapping data juga diubah:

```tsx
students.data.map(...)
staff.data.map(...)
```

Pagination ini adalah server-side pagination. Browser tidak menerima seluruh data untuk kemudian membaginya sendiri; browser hanya menerima data pada page yang sedang ditampilkan.

---

## 7.11 Latihan Mandiri

1. Buat CRUD `Subject` menggunakan [bab-tambahan-crud-subject.md](bab-tambahan-crud-subject.md).
2. Buat CRUD `ClassRoom` menggunakan [bab-tambahan-crud-classroom.md](bab-tambahan-crud-classroom.md).
3. Tambahkan link `Subjects` dan `ClassRooms` ke menu admin pada Toolbar.
4. Pastikan route tersebut hanya dapat diakses oleh `admin`.
5. Uji validasi field pada setiap form.
6. Uji pembuatan profile tanpa account.
7. Uji pembuatan account melalui modal dan pastikan credential diterima melalui `smtp4dev`.
8. Uji kembali penggunaan component `Form.tsx` pada page `Create` dan `Edit`.

---

## 7.12 Ringkasan Bab Ini

Pada bab ini kita telah:

- membuat middleware `role`;
- melindungi route dengan `auth` dan `role:admin`;
- menambahkan menu admin pada Toolbar;
- membuat Admin Dashboard;
- membuat page untuk profile `Teacher`, `Student`, dan `Staff`;
- memisahkan penyimpanan profile dan pembuatan account;
- membuat reusable `Form.tsx` untuk page `Create` dan `Edit`;
- membuat modal pembuatan account;
- mengirim temporary password melalui email;
- memperkenalkan validasi Form Request;
- menggunakan server-side pagination untuk data profile;
- menampilkan paging UI dengan MUI `TablePagination`;
- menyiapkan latihan CRUD `Subject` dan `ClassRoom`.

Pada bab berikutnya, proses upload file dan import profile melalui CSV akan dibahas lebih lanjut.

---

---
