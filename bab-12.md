# 📘 BAB 12 — REPORT ATTENDANCE UNTUK TEACHER

Pada bab ini kita membuat halaman report `Attendance` untuk Teacher.

Teacher dapat memilih:

- bulan;
- tahun;
- `TeachingAssignment`.

Setelah menekan button **Lihat**, sistem menampilkan Attendance Student dalam
bentuk tabel kalender.

```text
Teacher login
      ↓
Membuka menu Report
      ↓
Memilih bulan, tahun, dan TeachingAssignment
      ↓
Menekan Lihat
      ↓
Server mengambil Attendance
      ↓
Frontend menampilkan matriks Student × tanggal
```

## 12.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, siswa diharapkan mampu:

- membuat route report untuk Role `teacher`;
- membatasi report berdasarkan `TeachingAssignment` milik Teacher;
- memvalidasi filter bulan dan tahun;
- membuat daftar tanggal secara dinamis sesuai bulan yang dipilih;
- mengubah data Attendance menjadi bentuk matriks;
- memetakan status menjadi `H`, `I`, `S`, dan `A`;
- menghitung ringkasan status per Student;
- membuat tabel MUI dengan jumlah kolom dinamis.

## 12.2 Mengapa Report Lebih Kompleks?

CRUD biasanya menampilkan satu record per baris. Report Attendance memiliki
bentuk yang berbeda:

```text
Student × Tanggal
```

Jumlah kolom tanggal juga berubah sesuai bulan:

- Februari dapat memiliki 28 atau 29 hari;
- April, Juni, September, dan November memiliki 30 hari;
- bulan lainnya memiliki 31 hari.

Selain itu, sistem perlu:

- mengambil data berdasarkan hak akses Teacher;
- mengisi cell kosong jika belum ada Attendance;
- menghitung total setiap status;
- menampilkan status dengan label singkat.

Karena itu, pembuatan report sebaiknya dibagi menjadi beberapa tahap:

```text
Route
  ↓
Filter
  ↓
Authorization
  ↓
Query Attendance
  ↓
Transformasi data
  ↓
Dynamic table
```

## 12.3 Menu `Report` pada `MainLayout`

Tambahkan menu Report pada `resources/js/layouts/MainLayout.tsx`. Menu hanya
ditampilkan untuk user dengan Role `teacher`:

```tsx
{user?.role === 'teacher' && (
    <Box sx={{ width: '100px' }}>
        <Button
            size="small"
            fullWidth
            color="inherit"
            onClick={() => router.visit('/teacher/reports')}
        >
            Report
        </Button>
    </Box>
)}
```

Letakkan button ini di dalam `Toolbar`, bersama menu navigasi lainnya.

## 12.4 Membuat Controller dan Route

Buat controller:

```powershell
php artisan make:controller Teacher/ReportController
```

Tambahkan import pada `routes/web.php`:

```php
use App\Http\Controllers\Teacher\ReportController;
```

Tambahkan route di dalam group `auth` dan `role:teacher`:

```php
Route::middleware('role:teacher')
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])
            ->name('reports.index');
    });
```

Teacher tidak boleh mengakses report melalui `TeachingAssignment` milik Teacher
lain. Pemeriksaan tersebut harus dilakukan pada controller.

## 12.5 Menyiapkan Filter

Filter yang dikirim dari frontend:

```text
month                  → 1 sampai 12
year                   → contoh 2026
teaching_assignment_id → assignment milik Teacher
```

Pada implementasi bab ini, nilai filter dibaca dan dinormalisasi pada controller.
Jika nilai berada di luar rentang yang diizinkan, digunakan nilai default bulan
dan tahun saat ini:

```php
$month = request()->integer('month', now()->month);
$year = request()->integer('year', now()->year);

if ($month < 1 || $month > 12) {
    $month = now()->month;
}

if ($year < 2000 || $year > 2100) {
    $year = now()->year;
}
```

Pada aplikasi production, pemeriksaan ini dapat dikembangkan menggunakan Form
Request, misalnya `TeacherReportRequest`, apabila diperlukan pesan validasi yang
lebih spesifik.

## 12.6 Mengambil `TeachingAssignment` Milik Teacher

Ambil profile Teacher melalui user yang sedang login:

```php
$teacher = request()->user()->profile;
abort_unless($teacher instanceof Teacher, 403);

$assignments = $teacher->teachingAssignments()
    ->with(['subject', 'classRoom'])
    ->orderBy('id')
    ->get();
```

Jika terdapat `teaching_assignment_id`, ambil assignment melalui relasi Teacher
yang sedang login:

```php
$selectedAssignment = $teacher->teachingAssignments()
    ->with('classRoom.students')
    ->findOrFail(request()->integer('teaching_assignment_id'));
```

Jangan menggunakan query berikut tanpa filter Teacher:

```php
TeachingAssignment::findOrFail($id);
```

Query tersebut dapat memberikan akses kepada Teacher terhadap assignment milik
Teacher lain.

## 12.7 Membuat Daftar Tanggal Bulan

Gunakan Carbon untuk menentukan jumlah hari dalam bulan:

```php
use Carbon\Carbon;

$startDate = Carbon::create($year, $month, 1)->startOfDay();
$daysInMonth = $startDate->daysInMonth;

$dates = collect(range(1, $daysInMonth))
    ->map(fn (int $day) => $startDate->copy()->day($day)->toDateString());
```

`daysInMonth` otomatis menangani perbedaan jumlah hari setiap bulan dan tahun
kabisat.

Contoh bulan November:

```text
2026-11-01
2026-11-02
...
2026-11-30
```

## 12.8 Mengambil Data Attendance

Jika belum ada assignment yang dipilih, report dapat menampilkan form filter
tanpa data tabel:

```php
$attendanceRows = collect();
```

Jika assignment tersedia, ambil Student dari ClassRoom assignment dan Attendance
pada rentang bulan tersebut:

```php
$students = $selectedAssignment?->classRoom
    ->students()
    ->orderBy('name')
    ->get() ?? collect();

$attendance = $selectedAssignment
    ? Attendance::query()
        ->where('teaching_assignment_id', $selectedAssignment->id)
        ->whereBetween('attendance_date', [
            $startDate->toDateString(),
            $startDate->copy()->endOfMonth()->toDateString(),
        ])
        ->get()
        ->keyBy(fn (Attendance $item) =>
            $item->student_id . ':' . $item->attendance_date->toDateString()
        )
    : collect();
```

Pastikan model `Attendance` memiliki cast:

```php
protected function casts(): array
{
    return [
        'attendance_date' => 'date',
    ];
}
```

## 12.9 Membuat Matriks Report

Status internal perlu dipetakan ke label singkat:

```php
$statusLabels = [
    'present' => 'H',
    'excused' => 'I',
    'sick' => 'S',
    'absent' => 'A',
];
```

Buat satu row untuk setiap Student:

```php
$attendanceRows = $students->map(function (Student $student) use (
    $dates,
    $attendance,
    $statusLabels,
): array {
    $statuses = [];
    $summary = [
        'present' => 0,
        'excused' => 0,
        'sick' => 0,
        'absent' => 0,
    ];

    foreach ($dates as $date) {
        $record = $attendance->get(
            $student->id . ':' . $date,
        );

        $status = $record?->status;
        $statuses[$date] = $status ? $statusLabels[$status] : null;

        if ($status !== null) {
            $summary[$status]++;
        }
    }

    return [
        'student_id' => $student->id,
        'nis' => $student->nis,
        'name' => $student->name,
        'statuses' => $statuses,
        'summary' => [
            'present' => $summary['present'],
            'excused' => $summary['excused'],
            'sick' => $summary['sick'],
            'absent' => $summary['absent'],
        ],
    ];
});
```

Jika belum ada Attendance pada tanggal tertentu, nilai cell adalah `null` dan
frontend dapat menampilkannya sebagai cell kosong.

## 12.10 Mengirim Data ke Inertia

Contoh response controller:

```php
return Inertia::render('Teacher/Reports/Index', [
    'assignments' => $assignments,
    'selectedAssignmentId' => $selectedAssignment?->id,
    'month' => $month,
    'year' => $year,
    'dates' => $dates,
    'rows' => $attendanceRows,
]);
```

Gunakan nama property yang konsisten antara controller dan TypeScript.

## 12.11 Membuat Page Report

Buat file:

```text
resources/js/pages/Teacher/Reports/Index.tsx
```

Gunakan state lokal untuk menyimpan nilai filter yang sedang diedit. Nilai
tersebut belum menjadi report sampai button **Lihat** ditekan:

```tsx
const [selectedMonth, setSelectedMonth] = useState(String(month));
const [selectedYear, setSelectedYear] = useState(String(year));
const [selectedAssignment, setSelectedAssignment] = useState(
    selectedAssignmentId ? String(selectedAssignmentId) : '',
);
```

Filter dapat menggunakan MUI `Select` dan `TextField`:

```tsx
<Select
    size="small"
    value={selectedAssignment}
    onChange={(event) => setSelectedAssignment(event.target.value)}
>
    <MenuItem value="">Pilih TeachingAssignment</MenuItem>
    {assignments.map((assignment) => (
        <MenuItem key={assignment.id} value={String(assignment.id)}>
            {assignment.subject.name} — {assignment.class_room.level}{' '}
            {assignment.class_room.name}
        </MenuItem>
    ))}
</Select>
```

Button **Lihat** mengirim filter ke server:

```tsx
function submit(event: FormEvent) {
    event.preventDefault();

    router.get('/teacher/reports', {
        month: selectedMonth,
        year: selectedYear,
        teaching_assignment_id: selectedAssignment,
    }, {
        preserveState: false,
        preserveScroll: true,
        replace: true,
    });
}
```

`preserveState: false` digunakan agar page menerima props report yang baru dari
server. Dengan demikian judul dan isi tabel selalu menunjukkan filter yang telah
benar-benar diproses server.

## 12.12 Menampilkan Judul Report

Judul report sebaiknya dibuat dari props hasil response server, bukan dari nilai
filter yang masih sedang diedit. Dengan begitu, user dapat membedakan filter
yang baru dipilih dari report yang sedang ditampilkan:

```tsx
const assignmentInfo = assignments.find(
    (assignment) => assignment.id === selectedAssignmentId,
);
```

Contoh tampilan judul:

```tsx
<Stack sx={{ alignItems: 'center', mt: 4 }}>
    <Typography component="h1">Laporan Kehadiran</Typography>
    <Typography component="label">
        Bulan {monthNames[month - 1]} Tahun {year}
    </Typography>
    <Typography component="h2">
        {assignmentInfo?.class_room.name}
    </Typography>
    <Typography component="h2">
        {assignmentInfo?.subject.name}
    </Typography>
</Stack>
```

Judul tersebut tetap menunjukkan report yang aktif walaupun user mengubah nilai
filter tetapi belum menekan button **Lihat**.

## 12.13 Membuat Header Tabel Dinamis

Import komponen MUI:

```tsx
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
```

Pada implementasi ini, header tabel terdiri atas dua baris. Baris pertama
mengelompokkan kolom menjadi `Tanggal` dan `Summary`, sedangkan baris kedua
menampilkan nomor hari dan kode ringkasan:

```tsx
<TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
    <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
            <TableRow>
                <TableCell rowSpan={2}>NIS</TableCell>
                <TableCell rowSpan={2}>Nama Siswa</TableCell>
                <TableCell colSpan={dates.length}>Tanggal</TableCell>
                <TableCell colSpan={4}>Summary</TableCell>
            </TableRow>
            <TableRow>
                {dates.map((date) => (
                    <TableCell key={date} align="center">
                        {date.slice(-2)}
                    </TableCell>
                ))}
                <TableCell align="center">H</TableCell>
                <TableCell align="center">I</TableCell>
                <TableCell align="center">S</TableCell>
                <TableCell align="center">A</TableCell>
            </TableRow>
        </TableHead>
    </Table>
</TableContainer>
```

Kolom tanggal hanya perlu menampilkan nomor hari karena bulan dan tahun sudah
ditampilkan pada filter atau judul report.

## 12.14 Membuat Frozen Column

Karena report dapat memiliki lebih dari 30 kolom, tabel menggunakan horizontal
scrolling. Agar user tetap dapat melihat identitas Student ketika menggeser
tabel, kolom `NIS` dan `Nama Siswa` dibuat sticky seperti frozen column pada
Excel:

```tsx
const FIRST_COL_WIDTH = 150;
const SECOND_COL_WIDTH = 200;

const stickyFirstColumn = {
    position: 'sticky',
    left: 0,
    width: FIRST_COL_WIDTH,
    minWidth: FIRST_COL_WIDTH,
    maxWidth: FIRST_COL_WIDTH,
    backgroundColor: 'white',
};

const stickySecondColumn = {
    position: 'sticky',
    left: FIRST_COL_WIDTH,
    width: SECOND_COL_WIDTH,
    minWidth: SECOND_COL_WIDTH,
    maxWidth: SECOND_COL_WIDTH,
    backgroundColor: 'white',
};
```

Terapkan style tersebut pada header dan body. Gunakan `zIndex` yang lebih tinggi
untuk kolom sticky agar berada di atas kolom yang bergerak:

```tsx
<TableCell
    rowSpan={2}
    sx={{
        ...stickyFirstColumn,
        zIndex: 3,
        backgroundColor: '#f5f5f5',
    }}
>
    NIS
</TableCell>
```

Pada body, gunakan `zIndex: 2` dan tetap berikan background agar isi kolom lain
tidak terlihat di belakang kolom frozen.

## 12.15 Menampilkan Body dan Ringkasan

Gunakan `row.statuses[date]` untuk cell tanggal dan `row.summary` untuk empat
kolom ringkasan:

```tsx
<TableBody>
    {rows.map((row) => (
        <TableRow key={row.student_id}>
            <TableCell sx={{ ...stickyFirstColumn, zIndex: 2 }}>
                {row.nis}
            </TableCell>
            <TableCell
                sx={{
                    ...stickySecondColumn,
                    zIndex: 2,
                    whiteSpace: 'nowrap',
                }}
            >
                {row.name}
            </TableCell>

            {dates.map((date) => (
                <TableCell key={date} align="center">
                    {row.statuses[date] ?? ''}
                </TableCell>
            ))}

            <TableCell align="center">{row.summary.present}</TableCell>
            <TableCell align="center">{row.summary.excused}</TableCell>
            <TableCell align="center">{row.summary.sick}</TableCell>
            <TableCell align="center">{row.summary.absent}</TableCell>
        </TableRow>
    ))}
</TableBody>
```

Hasilnya, setiap Student memiliki status per tanggal dan jumlah total setiap
status selama bulan yang dipilih.

## 12.16 Authorization dan Keamanan

Filter `teaching_assignment_id` dari browser tidak boleh dipercaya secara
langsung. Controller harus mengambil assignment melalui relasi Teacher yang
sedang login:

```php
$selectedAssignment = $teacher->teachingAssignments()
    ->with('classRoom.students')
    ->findOrFail($request->integer('teaching_assignment_id'));
```

Dengan cara ini, request untuk assignment Teacher lain menghasilkan `404` atau
ditolak sesuai desain authorization.

## 12.17 Latihan Mandiri

1. Tambahkan menu `Report` untuk Role `teacher` pada `MainLayout`.
2. Buat route dan `ReportController`.
3. Tampilkan filter bulan, tahun, dan `TeachingAssignment`.
4. Tampilkan report hanya setelah button **Lihat** ditekan.
5. Buat daftar tanggal dinamis sesuai bulan yang dipilih.
6. Tampilkan status `H`, `I`, `S`, dan `A` pada cell tanggal.
7. Tambahkan ringkasan jumlah setiap status per Student.
8. Uji bulan Februari pada tahun biasa dan tahun kabisat.
9. Uji bahwa Teacher tidak dapat melihat assignment Teacher lain.
10. Gunakan horizontal scrolling untuk tabel dengan banyak kolom.
11. Buat judul report berdasarkan props hasil response server.
12. Buat kolom `NIS` dan `Nama Siswa` tetap terlihat ketika tabel digeser.

## 12.18 Ringkasan Bab Ini

Pada bab ini kita telah:

- menambahkan menu Report untuk Teacher;
- membuat filter bulan, tahun, dan `TeachingAssignment`;
- membuat daftar tanggal dinamis;
- mengambil Attendance berdasarkan hak akses Teacher;
- mengubah data Attendance menjadi matriks Student × tanggal;
- memetakan status ke `H`, `I`, `S`, dan `A`;
- menghitung ringkasan status per Student;
- membuat tabel MUI dengan kolom dinamis;
- menampilkan judul report berdasarkan data hasil filter;
- membuat frozen column untuk identitas Student.
