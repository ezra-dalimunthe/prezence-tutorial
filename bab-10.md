# 📘 BAB 10 — TEACHER DAN PENCATATAN ATTENDANCE

Pada bab ini kita membuat halaman pencatatan `Attendance` untuk Role `teacher`.
Teacher hanya dapat mencatat Student pada `ClassRoom` yang terhubung dengan
`TeachingAssignment` miliknya. Tabel dan model `Attendance` sudah dibuat pada
Bab 6.

```text
Teacher → TeachingAssignment → ClassRoom → Student → Attendance
```

## 10.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, siswa diharapkan mampu:

- membuat dashboard dinamis untuk Role `teacher`;
- membatasi route dengan middleware `role:teacher`;
- mengambil assignment milik Teacher yang sedang login;
- mengambil Student dari ClassRoom assignment;
- memuat status Attendance yang sudah tersimpan;
- menggunakan `DatePicker` dan Day.js;
- menggunakan partial reload Inertia;
- memvalidasi data pada server;
- menggunakan `firstOrNew()` dan `isDirty()`;
- membuat atau memperbarui Attendance berdasarkan `attendance_date`.

## 10.2 Alur Pencatatan Attendance

```text
Teacher login
        ↓
Teacher membuka dashboard
        ↓
Teacher memilih TeachingAssignment
        ↓
Server mengambil ClassRoom dan Student
        ↓
Server mengambil Attendance pada tanggal terpilih
        ↓
Frontend menampilkan status existing atau default present
        ↓
Teacher mengubah status
        ↓
Server memvalidasi ownership dan data
        ↓
firstOrNew() mengambil atau membuat record
        ↓
isDirty() menentukan apakah record perlu disimpan
```

Status internal:

```text
present  → Hadir
excused  → Izin
sick     → Sakit
absent   → Alpa
```

## 10.3 Dashboard Dinamis untuk `teacher`

Semua Role menggunakan route `/` sebagai entry point dashboard:

```text
Dashboard.tsx → DynamicDashboard.tsx → TeacherDashboard.tsx
```

Daftarkan component Teacher:

```tsx
import TeacherDashboard from '@/pages/Teacher/Dashboard';

export const DashboardType = {
    admin: AdminDashboard,
    teacher: TeacherDashboard,
};
```

Dashboard Teacher menampilkan button untuk setiap `TeachingAssignment`:

```tsx
<Button
    variant="contained"
    onClick={() =>
        router.visit(
            `/teacher/attendances?assignment_id=${assignment.id}`,
        )
    }
>
    Buka pencatatan {assignment.subject.name}
</Button>
```

## 10.4 Route Teacher

Tambahkan route di dalam group `auth`:

```php
Route::middleware('role:teacher')
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function () {
        Route::get('/attendances', [AttendanceController::class, 'index'])
            ->name('attendances.index');
        Route::post('/attendances', [AttendanceController::class, 'store'])
            ->name('attendances.store');
    });
```

## 10.5 Mengambil Profile dan Assignment Teacher

```php
$teacher = $request->user()->profile;
abort_unless($teacher instanceof Teacher, 403);

$assignments = $teacher->teachingAssignments()
    ->with(['subject', 'classRoom'])
    ->get();
```

Jangan mengambil semua `TeachingAssignment` tanpa filter Teacher.

## 10.6 Mengambil Student dari Assignment

Assignment harus dicari melalui relasi Teacher yang sedang login:

```php
$assignment = $assignments->firstWhere(
    'id',
    $request->integer('assignment_id'),
);

$students = $assignment?->classRoom
    ->students()
    ->orderBy('name')
    ->get() ?? collect();
```

Jangan mempercayai `class_id` dari browser. ClassRoom harus berasal dari
assignment yang sudah diverifikasi.

## 10.7 Memuat Attendance Existing

Gunakan tanggal dari query string atau tanggal hari ini:

```php
$attendanceDate = request()->date('attendance_date') ?? now();
```

Ambil Attendance untuk assignment, tanggal, dan Student pada ClassRoom:

```php
$existingAttendance = $assignment
    ? Attendance::where('teaching_assignment_id', $assignment->id)
        ->whereDate('attendance_date', $attendanceDate)
        ->whereIn('student_id', $students->pluck('id'))
        ->get()
        ->keyBy('student_id')
    : collect();
```

Buat object status untuk frontend. Status yang belum tersimpan diberi nilai
awal `present`:

```php
$attendances = $students->mapWithKeys(function ($student) use (
    $existingAttendance,
) {
    $attendance = $existingAttendance[$student->id] ?? null;

    return [$student->id => $attendance?->status ?? 'present'];
});
```

Kirim melalui Inertia:

```php
return Inertia::render('Teacher/Attendances/Index', [
    'assignments' => $assignments,
    'selectedAssignmentId' => $assignment?->id,
    'students' => $students,
    'attendanceDate' => $attendanceDate->format('Y-m-d'),
    'attendances' => $attendances,
]);
```

## 10.8 Form Attendance

Buat file:

```text
resources/js/pages/Teacher/Attendances/Index.tsx
```

Data form:

```tsx
const form = useForm({
    teaching_assignment_id: selectedAssignmentId
        ? String(selectedAssignmentId)
        : '',
    attendance_date: attendanceDate || dayjs().format('YYYY-MM-DD'),
    attendances: attendances,
});
```

`attendances` adalah object dengan Student ID sebagai key:

```tsx
{
    '1': 'present',
    '2': 'excused',
    '3': 'sick',
}
```

Gunakan `DatePicker` dari `@mui/x-date-pickers`:

```tsx
<DatePicker
    format="YYYY-MM-DD"
    value={
        form.data.attendance_date
            ? dayjs(form.data.attendance_date)
            : dayjs()
    }
    onChange={(date) => {
        const value = date?.format('YYYY-MM-DD') ?? '';
        form.setData('attendance_date', value);
        selectDate(value);
    }}
    slotProps={{ textField: { size: 'small' } }}
/>
```

## 10.9 Partial Reload ketika Assignment atau Tanggal Berubah

Gunakan `router.get()`, bukan `window.location.href`:

```tsx
function loadAttendance(assignmentId: string, attendanceDate: string) {
    setSuccessMessage(undefined);
    form.clearErrors();

    router.get(
        '/teacher/attendances',
        {
            assignment_id: assignmentId,
            attendance_date: attendanceDate,
        },
        {
            only: [
                'assignments',
                'selectedAssignmentId',
                'students',
                'attendanceDate',
                'attendances',
                'flash',
            ],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        },
    );
}

function selectAssignment(value: string) {
    loadAttendance(value, form.data.attendance_date);
}

function selectDate(value: string) {
    loadAttendance(form.data.teaching_assignment_id, value);
}
```

`router.get()` mengambil props baru tanpa full page reload. Prop `flash` juga
disertakan agar pesan success lama tidak dipertahankan oleh partial reload.

## 10.10 Menyinkronkan Form setelah Response Server

```tsx
useEffect(() => {
    form.clearErrors();
    form.setData({
        teaching_assignment_id: selectedAssignmentId
            ? String(selectedAssignmentId)
            : '',
        attendance_date: attendanceDate || dayjs().format('YYYY-MM-DD'),
        attendances: attendances,
    });
}, [selectedAssignmentId, attendanceDate, attendances]);
```

`useEffect()` berjalan setelah render. Gunakan fallback agar `Select` status
tidak pernah menerima nilai kosong:

```tsx
<Select
    value={form.data.attendances[student.id] ?? 'present'}
    onChange={(event) =>
        form.setData('attendances', {
            ...form.data.attendances,
            [student.id]: event.target.value,
        })
    }
>
    <MenuItem value="present">Hadir</MenuItem>
    <MenuItem value="excused">Izin</MenuItem>
    <MenuItem value="sick">Sakit</MenuItem>
    <MenuItem value="absent">Alpa</MenuItem>
</Select>
```

## 10.11 Validasi Server

Buat Form Request:

```powershell
php artisan make:request StoreAttendanceRequest
```

```php
public function authorize(): bool
{
    return $this->user()?->role === 'teacher';
}

public function rules(): array
{
    return [
        'teaching_assignment_id' => [
            'required',
            'exists:teaching_assignments,id',
        ],
        'attendance_date' => ['required', 'date_format:Y-m-d'],
        'attendances' => ['required', 'array'],
        'attendances.*' => [
            'required',
            'in:present,excused,sick,absent',
        ],
    ];
}
```

Form Request memeriksa bentuk data. Controller tetap harus memeriksa ownership
assignment dan memastikan Student berasal dari ClassRoom assignment.

## 10.12 Menyimpan atau Memperbarui Attendance

Gunakan `firstOrNew()` berdasarkan Student, assignment, dan tanggal:

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

Perilakunya:

- record belum ada: dibuat dan disimpan;
- record sudah ada dan status berubah: diperbarui;
- record sudah ada dan status sama: tidak disimpan ulang;
- `updated_at` tidak berubah jika data tidak berubah.

Gunakan `DB::transaction()` ketika menyimpan status banyak Student.

## 10.13 Menampilkan Success dan Error

Setelah berhasil, controller mengarahkan kembali ke index:

```php
return to_route('teacher.attendances.index', [
    'assignment_id' => $assignment->id,
    'attendance_date' => $date,
])->with('success', 'Attendance berhasil disimpan.');
```

Frontend dapat menampilkan flash success dan seluruh error Inertia:

```tsx
{successMessage && (
    <Alert severity="success">{successMessage}</Alert>
)}

{Object.entries(form.errors).map(([field, message]) => (
    <Alert key={field} severity="error">
        {message}
    </Alert>
))}
```

Jika pemeriksaan Student gagal di controller, gunakan:

```php
throw ValidationException::withMessages([
    'attendances' => 'Student tidak berasal dari ClassRoom assignment.',
]);
```

Dengan cara ini, error dikembalikan sebagai error form Inertia.

## 10.14 Latihan Mandiri

1. Tambahkan `TeacherDashboard` ke registry `DynamicDashboard`.
2. Tampilkan button untuk setiap `TeachingAssignment` milik Teacher.
3. Tampilkan Student dari ClassRoom assignment.
4. Muat status Attendance existing untuk tanggal yang dipilih.
5. Gunakan Day.js dan `DatePicker` untuk memilih tanggal.
6. Gunakan partial reload ketika assignment atau tanggal berubah.
7. Buat form status `present`, `excused`, `sick`, dan `absent`.
8. Tolak assignment yang bukan milik Teacher yang login.
9. Tolak Student yang bukan bagian dari ClassRoom assignment.
10. Simpan status yang sama dan pastikan `updated_at` tidak berubah.
11. Ubah status dan pastikan `updated_at` berubah.
12. Periksa record Attendance menggunakan Tinker.

## 10.15 Ringkasan Bab Ini

Pada bab ini kita telah:

- menggunakan dashboard dinamis untuk Role `teacher`;
- membatasi akses dengan middleware `role:teacher`;
- mengambil assignment sesuai Teacher yang login;
- mengambil Student dari ClassRoom assignment;
- memuat status Attendance existing;
- menggunakan `DatePicker` dan Day.js;
- menggunakan partial reload Inertia;
- memvalidasi data pada server;
- menggunakan `firstOrNew()` dan `isDirty()`;
- membuat atau memperbarui Attendance berdasarkan `attendance_date`.
