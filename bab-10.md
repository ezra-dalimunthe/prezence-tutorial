# 📘 BAB 10 — TEACHER DAN PENCATATAN ATTENDANCE

Pada bab ini kita mulai menggunakan Role `teacher` untuk mencatat Attendance Student.

`TeachingAssignment` yang dibuat pada Bab 9 menjadi batas akses Teacher. Teacher hanya dapat melihat Student pada ClassRoom yang terkait dengan assignment miliknya.

```text
Teacher
    ↓
TeachingAssignment
    ↓
ClassRoom
    ↓
Student
    ↓
Attendance
```

---

## 10.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda diharapkan mampu:

- membuat dashboard dinamis untuk Role `teacher`;
- membatasi route dengan middleware `role:teacher`;
- mengambil assignment milik Teacher yang sedang login;
- menampilkan Student dari ClassRoom assignment;
- menggunakan Day.js pada frontend;
- menyimpan status Attendance;
- menyimpan tanggal dan waktu dari server;
- mencegah Teacher mencatat Student dari ClassRoom lain;
- mencegah Attendance ganda pada tanggal kalender yang sama.

---

## 10.2 Alur Pencatatan Attendance

```text
Teacher login
        ↓
Teacher membuka dashboard
        ↓
Teacher memilih TeachingAssignment
        ↓
Sistem mengambil ClassRoom assignment
        ↓
Sistem menampilkan Student pada ClassRoom tersebut
        ↓
Frontend menampilkan tanggal hari ini
        ↓
Teacher mengisi status Attendance
        ↓
Laravel memvalidasi ownership dan data
        ↓
Sistem menyimpan Attendance
```

Status internal:

```text
present  → Hadir
excused  → Izin
sick     → Sakit
absent   → Alpa
```

---

## 10.3 Dashboard Dinamis untuk `teacher`

Dashboard tetap menggunakan satu page utama:

```text
Dashboard.tsx
        ↓
DynamicDashboard.tsx
        ↓
TeacherDashboard.tsx
```

Tambahkan component pada registry dashboard:

```tsx
import TeacherDashboard from '@/pages/Teacher/Dashboard';

export const DashboardType = {
    admin: AdminDashboard,
    teacher: TeacherDashboard,
};
```

Jangan membuat route dashboard baru untuk Teacher. Route `/` tetap menjadi entry point dashboard semua Role.

---

## 10.4 Route Teacher

Tambahkan route di dalam group `auth`:

```php
Route::middleware(['auth', 'role:teacher'])
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function () {
        Route::get('/attendances', [AttendanceController::class, 'index'])
            ->name('attendances.index');
        Route::post('/attendances', [AttendanceController::class, 'store'])
            ->name('attendances.store');
    });
```

Middleware authorization tidak boleh hanya dilakukan pada frontend. Controller tetap harus memeriksa Teacher yang sedang login.

---

## 10.5 Mengambil Profile Teacher

Account `User` terhubung dengan profile melalui polymorphic relation:

```php
$teacher = $request->user()->profile;
```

Ambil assignment milik Teacher tersebut:

```php
$assignments = $teacher->teachingAssignments()
    ->with(['subject', 'classRoom'])
    ->get();
```

Jangan mengambil semua `TeachingAssignment` tanpa filter Teacher. Jika dilakukan, seorang Teacher dapat melihat assignment milik Teacher lain.

---

## 10.6 Menampilkan Student dari Assignment

Setelah Teacher memilih assignment, server harus memastikan assignment tersebut memang milik Teacher yang sedang login.

```php
$assignment = $teacher->teachingAssignments()
    ->with('classRoom.students')
    ->findOrFail($request->integer('teaching_assignment_id'));

$students = $assignment->classRoom->students;
```

Relasi `Student` tidak diambil berdasarkan `class_id` dari input browser secara langsung. ClassRoom harus berasal dari assignment yang sudah diverifikasi.

---

## 10.7 Form Attendance

Buat struktur page:

```text
resources/js/pages/Teacher/
├── Dashboard.tsx
└── Attendances/
    ├── Index.tsx
    └── Form.tsx
```

Frontend dapat menggunakan `useForm()`:

```tsx
const form = useForm({
    teaching_assignment_id: '',
    attendance_date: dayjs().format('YYYY-MM-DD'),
    attendances: {},
});
```

Gunakan `DatePicker` dari `@mui/x-date-pickers` untuk memilih tanggal:

```tsx
<DatePicker
    label="Tanggal Attendance"
    format="YYYY-MM-DD"
    value={form.data.attendance_date ? dayjs(form.data.attendance_date) : dayjs()}
    onChange={(date) =>
        form.setData('attendance_date', date?.format('YYYY-MM-DD') ?? '')
    }
    slotProps={{ textField: { size: 'small' } }}
/> 
```

Tanggal default ditampilkan menggunakan Day.js. Namun, tanggal dan waktu final tetap ditentukan dan divalidasi oleh server.

Status untuk setiap Student dapat dikirim sebagai object:

```tsx
attendances: {
    '1': 'present',
    '2': 'excused',
    '3': 'sick',
}
```

---

## 10.8 Validasi Server

Buat Form Request:

```powershell
php artisan make:request StoreAttendanceRequest
```

Validasi dasar:

```php
public function rules(): array
{
    return [
        'teaching_assignment_id' => ['required', 'exists:teaching_assignments,id'],
        'attendance_date' => ['required', 'date_format:Y-m-d'],
        'attendances' => ['required', 'array'],
        'attendances.*' => [
            'required',
            'in:present,excused,sick,absent',
        ],
    ];
}
```

Form Request memeriksa bentuk data. Controller tetap harus memeriksa bahwa:

- assignment dimiliki Teacher yang login;
- Student berada pada ClassRoom assignment;
- Attendance pada tanggal tersebut belum tersedia.

---

## 10.9 Menyimpan Attendance

Untuk setiap Student yang dikirim, simpan record Attendance:

```php
$attendanceDateTime = Carbon::parse(
    $request->string('attendance_date')->toString()
)->setTimeFromTimeString(now()->format('H:i:s'));

foreach ($request->input('attendances') as $studentId => $status) {
    abort_unless(
        $assignment->classRoom->students()->whereKey($studentId)->exists(),
        422,
        'Student tidak berasal dari ClassRoom assignment.',
    );

    Attendance::create([
        'student_id' => $studentId,
        'teaching_assignment_id' => $assignment->id,
        'attendance_datetime' => $attendanceDateTime,
        'status' => $status,
    ]);
}
```

Pada implementasi lengkap, sebaiknya gunakan `DB::transaction()` agar seluruh proses tersimpan secara konsisten.

---

## 10.10 Mencegah Attendance Duplikat

Sebelum menyimpan Attendance, periksa tanggal kalender:

```php
$alreadyExists = Attendance::where('student_id', $studentId)
    ->where('teaching_assignment_id', $assignment->id)
    ->whereDate('attendance_datetime', $request->input('attendance_date'))
    ->exists();
```

Jika `$alreadyExists` bernilai `true`, sistem harus menolak data tersebut atau mengubah record yang sudah ada sesuai desain fitur.

Validasi ini harus dilakukan di server. Validasi frontend hanya membantu pengalaman pengguna dan tidak cukup untuk menjaga keamanan data.

---

## 10.11 Latihan Mandiri

1. Tambahkan `TeacherDashboard` ke registry `DynamicDashboard`.
2. Tampilkan daftar `TeachingAssignment` milik Teacher.
3. Tampilkan Student dari ClassRoom assignment.
4. Gunakan Day.js untuk menampilkan tanggal hari ini.
5. Buat form status `present`, `excused`, `sick`, dan `absent`.
6. Tolak request jika assignment bukan milik Teacher yang login.
7. Tolak Student yang bukan bagian dari ClassRoom assignment.
8. Coba menyimpan Attendance kedua untuk Student dan tanggal yang sama.
9. Periksa record Attendance menggunakan Tinker.

---

## 10.12 Ringkasan Bab Ini

Pada bab ini kita telah:

- menggunakan dashboard dinamis untuk Role `teacher`;
- membatasi akses dengan middleware `role:teacher`;
- mengambil assignment sesuai Teacher yang login;
- mengambil Student dari ClassRoom assignment;
- membuat form Attendance;
- memvalidasi data pada server;
- menyimpan status Attendance;
- mencegah akses Student di luar assignment;
- mencegah pencatatan Attendance ganda.
