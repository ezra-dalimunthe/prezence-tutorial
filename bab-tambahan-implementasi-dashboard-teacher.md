# Contekan — Implementasi Dashboard `Teacher`

File ini merupakan referensi untuk latihan mandiri pada Bab 10, khususnya
bagian dashboard dinamis untuk Role `teacher` dan halaman pencatatan
`Attendance`.

Cobalah mengerjakan latihan pada Bab 10 terlebih dahulu. Gunakan contekan ini
jika masih mengalami kesulitan atau ingin membandingkan struktur implementasi.

## Prasyarat

Pastikan bagian berikut sudah tersedia:

- model `Teacher`, `Subject`, `ClassRoom`, `Student`, `TeachingAssignment`, dan
  `Attendance`;
- relasi polymorphic `User` ke profile;
- kolom `role`, `profile_type`, dan `profile_id` pada tabel `users`;
- middleware `role`;
- route dashboard `/` yang dilindungi middleware `auth`;
- data `Teacher`, `Student`, dan `TeachingAssignment`.

Relasi data yang digunakan:

```text
User (role: teacher)
    └── profile → Teacher
                    └── teachingAssignments
                                      ├── Subject
                                      └── ClassRoom
                                               └── Students
```

## 1. Dashboard Menggunakan Satu Entry Point

Semua Role tetap mengakses route `/`. `DashboardController` menentukan jenis
dashboard berdasarkan `role` user yang sedang login. Karena itu, tidak perlu
membuat route `/teacher/dashboard` khusus untuk menampilkan dashboard utama.

### `routes/web.php`

Pastikan route dashboard berada di dalam middleware `auth`:

```php
Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])
        ->name('dashboard');
});
```

### `resources/js/pages/Dashboard.tsx`

Page ini menjadi entry point Inertia. Ia menerima `type` dan `payload`, lalu
meneruskannya ke `DynamicDashboard` di dalam `MainLayout`:

```tsx
import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import {
    DynamicDashboard,
    type DynamicDashboardProps,
} from '@/layouts/DynamicDashboard';

export default function Dashboard({ type, payload }: DynamicDashboardProps) {
    return (
        <>
            <Head title="Dashboard" />

            <MainLayout>
                <DynamicDashboard type={type} payload={payload} />
            </MainLayout>
        </>
    );
}
```

Dengan struktur ini, `TeacherDashboard` tidak perlu memakai `MainLayout` lagi.
Layout sudah dipasang satu kali oleh page `Dashboard`.

## 2. Menambahkan `TeacherDashboard` ke Registry

Buat file:

```text
resources/js/pages/Teacher/Dashboard.tsx
```

Kemudian daftarkan component tersebut pada:

```text
resources/js/layouts/DynamicDashboard.tsx
```

Contoh registry:

```tsx
import AdminDashboard from '@/pages/Admin/Dashboard';
import TeacherDashboard from '@/pages/Teacher/Dashboard';

export const DashboardType: Record<string, React.ComponentType<any>> = {
    admin: AdminDashboard,
    teacher: TeacherDashboard,
};
```

Component dinamis dapat dibuat seperti berikut:

```tsx
export interface DynamicDashboardProps {
    type: string;
    payload: any;
}

export function DynamicDashboard({
    type,
    payload,
}: DynamicDashboardProps) {
    const SelectedDashboard = DashboardType[type];

    if (!SelectedDashboard) {
        return null;
    }

    return <SelectedDashboard payload={payload} />;
}
```

`type` bernilai `teacher` jika user yang login memiliki Role `teacher`.

## 3. Mengirim Assignment dari `DashboardController`

Controller harus mengirim hanya `TeachingAssignment` milik Teacher yang sedang
login. Jangan mengambil seluruh assignment tanpa filter.

Contoh bagian `DashboardController`:

```php
public function index(Request $request)
{
    $type = $request->user()->role;

    return Inertia::render('Dashboard', [
        'type' => $type,
        'payload' => match ($type) {
            'teacher' => [
                'assignments' => TeachingAssignment::with([
                    'subject',
                    'classRoom',
                ])
                    ->where('teacher_id', $request->user()->profile_id)
                    ->get(),
            ],
            default => [],
        },
    ]);
}
```

Pada aplikasi yang menggunakan relasi profile, `profile_id` menunjuk ke ID
profile `Teacher`. Pastikan `profile_type` juga benar. Cara lain yang setara
adalah mengambil profile terlebih dahulu:

```php
$teacher = $request->user()->profile;

$assignments = $teacher->teachingAssignments()
    ->with(['subject', 'classRoom'])
    ->get();
```

## 4. Membuat Tampilan `TeacherDashboard`

File `resources/js/pages/Teacher/Dashboard.tsx` menerima payload yang berisi
assignment, ringkasan kelas, dan ringkasan Attendance. Bagian atas dashboard
menampilkan setiap assignment sebagai button berukuran besar:

```tsx
<Paper sx={{ p: 3 }}>
    <Typography variant="h4">Dashboard</Typography>

    <Box
        sx={{
            mt: 1,
            display: 'flex',
            direction: 'row',
            columnGap: 2,
        }}
    >
        {payload.assignments.map((assignment) => (
            <Button
                key={assignment.id}
                sx={{
                    width: '300px',
                    height: '150px',
                    textWrap: 'auto',
                    wordWrap: 'auto',
                }}
                variant="contained"
                onClick={() =>
                    router.visit(
                        `/teacher/attendances?assignment_id=${assignment.id}`,
                    )
                }
            >
                Buka pencatatan {assignment.subject.name} <br />
                {assignment.class_room.level} {assignment.class_room.name}
            </Button>
        ))}
    </Box>
</Paper>
```

Button ini digunakan untuk membuka halaman pencatatan Attendance. Dropdown
`TeachingAssignment` yang berada di bagian ringkasan Attendance memiliki fungsi
berbeda: dropdown tersebut hanya memfilter isi tabel ringkasan.

## 5. Membuat Route Attendance

Tambahkan route di dalam group `auth` dan `role:teacher`:

```php
use App\Http\Controllers\Teacher\AttendanceController;

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

Route hanya membatasi Role secara umum. Pemeriksaan bahwa assignment memang
dimiliki Teacher tetap dilakukan di controller.

## 6. Mengambil Assignment dan Student

Pada method `index`, ambil assignment dari relasi Teacher yang sedang login.
Dengan cara ini, Teacher tidak dapat memilih assignment Teacher lain melalui
query string.

```php
public function index(Request $request)
{
    $teacher = $request->user()->profile;
    abort_unless($teacher instanceof Teacher, 403);

    $assignments = $teacher->teachingAssignments()
        ->with(['subject', 'classRoom'])
        ->get();

    $assignment = $assignments->firstWhere(
        'id',
        $request->integer('assignment_id'),
    );

    $students = $assignment?->classRoom
        ->students()
        ->orderBy('name')
        ->get() ?? collect();

    return Inertia::render('Teacher/Attendances/Index', [
        'assignments' => $assignments,
        'selectedAssignmentId' => $assignment?->id,
        'students' => $students,
        'attendanceDate' => $request->date('attendance_date')
            ?->format('Y-m-d') ?? now()->format('Y-m-d'),
    ]);
}
```

Perhatikan bahwa Student diambil dari `classRoom` yang berasal dari assignment
yang sudah ditemukan melalui relasi Teacher. Jangan langsung memakai `class_id`
yang dikirim oleh browser tanpa pemeriksaan.

## 7. Membuat Form Attendance dengan Inertia

Buat file:

```text
resources/js/pages/Teacher/Attendances/Index.tsx
```

Data form dapat dibuat seperti berikut:

```tsx
const form = useForm({
    teaching_assignment_id: selectedAssignmentId
        ? String(selectedAssignmentId)
        : '',
    attendance_date: attendanceDate || dayjs().format('YYYY-MM-DD'),
    attendances: attendances,
});
```

Status setiap Student disimpan dalam object:

```tsx
{
    1: 'present',
    2: 'excused',
    3: 'sick',
}
```

Untuk memilih tanggal, gunakan `DatePicker`:

```tsx
<DatePicker
    label="Tanggal Attendance"
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

Tanggal pada frontend hanya nilai awal dan input pengguna. Server tetap
memvalidasi format tanggal dan memuat status Attendance untuk tanggal tersebut.

Submit form menggunakan `useForm()`:

```tsx
function submit(event: FormEvent) {
    event.preventDefault();
    form.post('/teacher/attendances');
}
```

### Mengganti Assignment Tanpa Full Page Reload

Pada halaman Attendance, gunakan `router.get()` ketika Teacher memilih
assignment. Jangan menggunakan `window.location.href` karena browser akan
melakukan full page reload.

```tsx
import { router } from '@inertiajs/react';

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

`router.get()` tetap mengambil data terbaru dari server, tetapi Inertia hanya
memperbarui props yang diperlukan. Sinkronkan state `useForm()` setelah props
berubah:

```tsx
useEffect(() => {
    form.setData({
        teaching_assignment_id: selectedAssignmentId
            ? String(selectedAssignmentId)
            : '',
        attendance_date: attendanceDate || dayjs().format('YYYY-MM-DD'),
        attendances: attendances,
    });
}, [selectedAssignmentId, attendanceDate, attendances]);
```

Karena `useEffect()` dijalankan setelah render, gunakan fallback ketika mengisi
nilai `Select` status Student:

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
    {/* pilihan present, excused, sick, dan absent */}
</Select>
```

Fallback tersebut mencegah nilai kosong pada render sementara ketika Student
baru diterima dari server.

Untuk setiap Student, gunakan `Select` dengan nilai berikut:

```text
present → Hadir
excused → Izin
sick    → Sakit
absent  → Alpa
```

## 8. Validasi Request

Buat Form Request:

```powershell
php artisan make:request StoreAttendanceRequest
```

Contoh rules:

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
        'attendance_date' => [
            'required',
            'date_format:Y-m-d',
        ],
        'attendances' => ['required', 'array'],
        'attendances.*' => [
            'required',
            'in:present,excused,sick,absent',
        ],
    ];
}
```

Form Request memeriksa bentuk dan nilai data. Ia belum cukup untuk memastikan
bahwa assignment dan Student berada dalam cakupan Teacher yang sedang login.
Pemeriksaan tersebut harus dilakukan di controller.

## 9. Menyimpan Attendance pada Controller

Method `store` mengambil assignment melalui relasi Teacher:

```php
public function store(StoreAttendanceRequest $request): RedirectResponse
{
    $teacher = $request->user()->profile;
    abort_unless($teacher instanceof Teacher, 403);

    $assignment = $teacher->teachingAssignments()
        ->with('classRoom')
        ->findOrFail($request->integer('teaching_assignment_id'));

    // Lanjutkan dengan pemeriksaan Student dan penyimpanan.
}
```

Ambil ID Student yang valid dari ClassRoom assignment:

```php
$date = $request->string('attendance_date')->toString();
$studentIds = $assignment->classRoom
    ->students()
    ->pluck('id')
    ->all();

foreach (array_keys($request->input('attendances')) as $studentId) {
    abort_unless(
        in_array((int) $studentId, $studentIds, true),
        422,
        'Student tidak berasal dari ClassRoom assignment.',
    );
}
```

Simpan semua record dalam transaction:

```php
DB::transaction(function () use ($request, $assignment, $date): void {
    foreach ($request->input('attendances') as $studentId => $status) {
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
    }
});

return to_route('teacher.attendances.index')
    ->with('success', 'Attendance berhasil disimpan.');
```

`DB::transaction()` membantu menjaga agar proses penyimpanan dilakukan sebagai
satu kesatuan. Jika terjadi exception, perubahan dalam transaction dibatalkan.

## 10. Membuat atau Memperbarui Attendance

Gunakan `firstOrNew()` dengan kombinasi Student, assignment, dan
`attendance_date` sebagai key pencarian. Gunakan `isDirty()` agar `updated_at`
hanya berubah ketika status benar-benar berubah:

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

Jika record belum ada, Laravel membuat record baru. Jika sudah ada, Laravel
memperbarui record tersebut.

Pemeriksaan yang tetap wajib dilakukan adalah:

- assignment dimiliki Teacher yang sedang login;
- Student berasal dari ClassRoom assignment;
- status dan tanggal lolos validasi.

`attendance_date` digunakan sebagai key pencarian. `created_at` dan
`updated_at` mencatat waktu pembuatan dan perubahan record.

## 11. Urutan Pengujian

1. Jalankan migration dan seeder yang diperlukan.
2. Pastikan account Teacher memiliki `role` `teacher`.
3. Pastikan `profile_type` dan `profile_id` mengarah ke profile `Teacher`.
4. Pastikan Teacher memiliki minimal satu `TeachingAssignment`.
5. Login sebagai Teacher.
6. Buka `/` dan pastikan `TeacherDashboard` ditampilkan.
7. Klik salah satu assignment.
8. Pastikan Student yang muncul hanya Student dari ClassRoom assignment.
9. Simpan status Attendance.
10. Simpan lagi Student dan tanggal yang sama dengan status berbeda.
11. Pastikan record lama diperbarui.
12. Uji juga URL dengan `assignment_id` milik Teacher lain.

Contoh pemeriksaan menggunakan Tinker:

```powershell
php artisan tinker
```

```php
Attendance::with(['student', 'teachingAssignment'])->latest()->get();
```

## Kesalahan yang Perlu Dihindari

- membuat route dashboard berbeda untuk setiap Role padahal dashboard memakai
  satu entry point;
- mengambil seluruh `TeachingAssignment` tanpa filter Teacher;
- mempercayai `class_id` atau `student_id` dari browser tanpa pemeriksaan;
- hanya melakukan authorization di frontend;
- menggunakan waktu dari browser sebagai waktu final penyimpanan;
- tidak memakai transaction ketika menyimpan banyak Attendance;
- menggunakan `create()` tanpa mempertimbangkan record Attendance pada tanggal yang sama;
- memasang `MainLayout` kembali di `TeacherDashboard`, padahal layout sudah
  dipasang oleh `Dashboard.tsx`.

## Ringkasan Contekan

Alur implementasinya adalah:

```text
DashboardController
        ↓ type = teacher + assignments
Dashboard.tsx
        ↓
DynamicDashboard
        ↓
TeacherDashboard
        ↓ assignment_id
AttendanceController@index
        ↓ verifikasi ownership
Attendances/Index.tsx
        ↓ useForm + DatePicker
AttendanceController@store
        ↓ validasi Teacher, ClassRoom, Student, dan tanggal
Attendance records
```

Gunakan struktur ini sebagai referensi. Detail tampilan seperti layout, ukuran
component MUI, dan susunan tabel dapat dikembangkan sesuai kebutuhan aplikasi.
