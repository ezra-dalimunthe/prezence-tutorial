# 📘 BAB 11 — REVIEW DAN PENYEMPURNAAN TEACHER DASHBOARD

Pada Bab 10, Teacher sudah dapat memilih `TeachingAssignment` dan mencatat
`Attendance`. Setelah melakukan review, kita menemukan bahwa dashboard masih
terlalu sederhana. Dashboard hanya menampilkan daftar assignment, sehingga
Teacher belum memperoleh gambaran tentang kelas dan presensi minggu berjalan.

Pada bab ini kita menambahkan:

1. ringkasan kelas yang diajar dan jumlah Student berdasarkan `gender`;
2. ringkasan `Attendance` pada minggu berjalan;
3. filter `TeachingAssignment`;
4. format tanggal menggunakan Day.js dan locale Indonesia;
5. link menuju detail Attendance pada tanggal tertentu.

---

## 11.1 Review Hasil Bab 10

Alur dashboard pada Bab 10 adalah:

```text
Teacher login
      ↓
DashboardController
      ↓
Dashboard.tsx
      ↓
DynamicDashboard
      ↓
TeacherDashboard
```

Masalah dari tampilan tersebut:

- jumlah Student pada setiap kelas belum terlihat;
- jumlah Student laki-laki dan perempuan belum diringkas;
- Teacher belum dapat melihat gambaran Attendance minggu berjalan;
- Teacher harus membuka halaman pencatatan untuk mengetahui data Attendance;
- tanggal pada frontend belum ditampilkan dalam format lokal Indonesia.

## 11.2 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, siswa diharapkan mampu:

- melakukan review terhadap kebutuhan informasi pada dashboard;
- melakukan agregasi data menggunakan query Eloquent;
- membuat ringkasan jumlah Student berdasarkan `gender`;
- membuat ringkasan Attendance berdasarkan tanggal dan status;
- menggunakan filter `TeachingAssignment`;
- mengirim data ringkasan dari Laravel ke Inertia;
- mengatur locale Day.js ke bahasa Indonesia;
- membuat link dari ringkasan menuju detail Attendance.

## 11.3 Rancangan Dashboard Baru

```text
Teacher Dashboard
├── Daftar TeachingAssignment sebagai button
├── Ringkasan Kelas
│   ├── Kelas
│   ├── Jumlah murid laki-laki
│   └── Jumlah murid perempuan
└── Ringkasan Attendance minggu berjalan
    ├── Subtitle minggu dan tahun
    ├── Filter TeachingAssignment
    ├── Tanggal
    ├── Hadir
    ├── Izin
    ├── Sakit
    ├── Alpa
    └── Detail
```

Ringkasan kelas memiliki bentuk:

| Kelas | Jumlah murid laki-laki | Jumlah murid perempuan |
| --- | ---: | ---: |
| X-A | 15 | 17 |
| XI-B | 13 | 16 |

Ringkasan Attendance memiliki bentuk:

| Tanggal | Hadir | Izin | Sakit | Alpa | Detail |
| --- | ---: | ---: | ---: | ---: | --- |
| 03 Nov 2026 | 27 | 2 | 1 | 2 | Lihat |
| 04 Nov 2026 | 29 | 1 | 1 | 1 | Lihat |

Tabel selalu menampilkan tanggal dari hari Senin sampai Sabtu. Jika belum ada
pencatatan pada suatu tanggal, baris tersebut tetap dibuat dengan kolom jumlah
yang kosong.

Jika satu Teacher mengajar lebih dari satu Subject pada ClassRoom yang sama,
ClassRoom tersebut ditampilkan satu kali pada ringkasan kelas.

## 11.4 Menentukan Minggu Berjalan

Pada tutorial ini, minggu berjalan dimulai pada hari Senin. Ringkasan
Attendance ditampilkan sampai hari Sabtu. Rentang waktu ditentukan pada server:

```php
use Illuminate\Support\Carbon;

$weekStart = now()->startOfWeek(Carbon::MONDAY);
$weekEnd = $weekStart->copy()->addDays(5)->endOfDay();
```

Nomor minggu dan tahun dapat dikirim sebagai subtitle dashboard:

```php
$weekLabel = sprintf(
    'Minggu ke %d tahun %d',
    $weekStart->isoWeek(),
    $weekStart->isoWeekYear(),
);
```

Server tidak boleh mempercayai waktu dari browser sebagai waktu final. Pastikan
timezone aplikasi Laravel sudah sesuai dengan kebutuhan project.

Timezone penting karena Laravel menggunakan waktu server ketika menentukan
`now()`, awal minggu, akhir minggu, dan waktu penyimpanan `Attendance`. Jika
timezone masih menggunakan UTC, batas hari atau minggu dapat berbeda dari waktu
lokal yang digunakan sekolah.

Untuk langkah konfigurasi timezone secara lengkap, baca:

[Konfigurasi Timezone Laravel](bab-tambahan-konfigurasi-timezone.md)

Setelah konfigurasi timezone selesai, jalankan `php artisan config:clear` agar
Laravel membaca konfigurasi terbaru.

## 11.5 Menyiapkan Data Dashboard

Ambil profile Teacher dan assignment melalui relasinya:

```php
$teacher = $request->user()->profile;
abort_unless($teacher instanceof Teacher, 403);

$assignments = $teacher->teachingAssignments()
    ->with(['subject', 'classRoom.students'])
    ->get();
```

Jangan mengambil seluruh `TeachingAssignment` dari database tanpa filter
Teacher.

## 11.6 Membuat Ringkasan Kelas

Satu ClassRoom dapat muncul pada lebih dari satu assignment. Karena itu,
gunakan `unique('class_id')` sebelum membuat ringkasan:

```php
$classSummaries = $assignments
    ->unique('class_id')
    ->map(function (TeachingAssignment $assignment): array {
        $students = $assignment->classRoom->students;

        return [
            'id' => $assignment->classRoom->id,
            'name' => $assignment->classRoom->name,
            'level' => $assignment->classRoom->level,
            'male_count' => $students->where('gender', 'male')->count(),
            'female_count' => $students->where('gender', 'female')->count(),
        ];
    })
    ->values();
```

Nilai `male` dan `female` harus mengikuti nilai internal yang digunakan saat
validasi Student. Jika aplikasi menggunakan `L` dan `P`, sesuaikan query:

```php
$students->where('gender', 'L')->count();
$students->where('gender', 'P')->count();
```

## 11.7 Membuat Ringkasan Attendance

Jika Teacher memiliki beberapa assignment, ringkasan Attendance ditampilkan
berdasarkan assignment yang dipilih:

```php
$selectedAssignmentId = $request->integer('assignment_id');

$selectedAssignment = $assignments->firstWhere(
    'id',
    $selectedAssignmentId,
);

$attendanceSummary = collect();

if ($selectedAssignment) {
    $attendanceSummary = Attendance::query()
        ->where('teaching_assignment_id', $selectedAssignment->id)
            ->whereBetween('attendance_date', [
                $weekStart->toDateString(),
                $weekEnd->toDateString(),
            ])
            ->select('attendance_date')
        ->selectRaw("SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count")
        ->selectRaw("SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count")
        ->selectRaw("SUM(CASE WHEN status = 'sick' THEN 1 ELSE 0 END) as sick_count")
        ->selectRaw("SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count")
        ->groupBy('attendance_date')
        ->orderBy('attendance_date')
        ->get();
}
```

Query tersebut menggunakan `CASE WHEN` agar lebih mudah disesuaikan dengan
database selain MySQL. Pastikan nama status sama dengan nilai pada SRS dan
validasi `StoreAttendanceRequest`.

Query tersebut hanya menghasilkan tanggal yang memiliki record. Agar tabel
selalu menampilkan Senin sampai Sabtu, ubah hasil query menjadi collection yang
memiliki enam baris:

```php
$attendanceByDate = $attendanceSummary->keyBy('attendance_date');

$attendanceSummary = collect(range(0, 5))->map(function (int $day) use (
    $weekStart,
    $attendanceByDate,
): array {
    $date = $weekStart->copy()->addDays($day)->toDateString();
    $summary = $attendanceByDate->get($date);

    return [
        'attendance_date' => $date,
        'present_count' => $summary ? (int) $summary->present_count : null,
        'excused_count' => $summary ? (int) $summary->excused_count : null,
        'sick_count' => $summary ? (int) $summary->sick_count : null,
        'absent_count' => $summary ? (int) $summary->absent_count : null,
    ];
});
```

Dengan cara ini, tanggal tanpa pencatatan tetap dikirim ke frontend dengan
kolom jumlah bernilai `null`, sehingga tampil kosong pada tabel.

## 11.8 Mengirim Payload ke Inertia

Kirim hanya field yang diperlukan frontend:

```php
return Inertia::render('Dashboard', [
    'type' => 'teacher',
    'payload' => [
        'assignments' => $assignments->map(
            fn (TeachingAssignment $assignment) => [
                'id' => $assignment->id,
                'subject' => ['name' => $assignment->subject->name],
                'class_room' => [
                    'name' => $assignment->classRoom->name,
                    'level' => $assignment->classRoom->level,
                ],
            ],
        )->values(),
        'selectedAssignmentId' => $selectedAssignment?->id,
        'classSummaries' => $classSummaries,
        'attendanceSummary' => $attendanceSummary,
        'weekLabel' => $weekLabel,
    ],
]);
```

Penting: `$selectedAssignment` berasal dari `$assignments`, yaitu assignment
yang sudah dibatasi pada Teacher yang sedang login. Jangan mencari assignment
langsung berdasarkan ID dari browser tanpa pemeriksaan ownership.

## 11.9 Menampilkan Daftar `TeachingAssignment`

Pada bagian atas dashboard, setiap `TeachingAssignment` ditampilkan sebagai
button. Button tersebut membuka halaman pencatatan Attendance untuk assignment
yang dipilih:

```tsx
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
```

Button ini berbeda dari dropdown pada bagian berikutnya. Button digunakan untuk
membuka form pencatatan, sedangkan dropdown digunakan untuk mengganti isi tabel
ringkasan Attendance.

## 11.10 Menambahkan Filter `TeachingAssignment`

Gunakan MUI `Select` pada `TeacherDashboard`. Letakkan selector ini setelah
judul `Ringkasan Attendance Minggu Berjalan` dan subtitle nomor minggu. Dengan
demikian, jelas bahwa selector digunakan untuk mengubah isi tabel Attendance,
bukan untuk mengubah ringkasan kelas:

```tsx
<Select
    size="small"
    value={selectedAssignmentId ?? ''}
    displayEmpty
    onChange={(event) => {
        router.visit(`/?assignment_id=${event.target.value}`);
    }}
>
    <MenuItem value="">Pilih TeachingAssignment</MenuItem>

    {payload.assignments.map((assignment) => (
        <MenuItem key={assignment.id} value={assignment.id}>
            {assignment.subject.name} — {assignment.class_room.level}{' '}
            {assignment.class_room.name}
        </MenuItem>
    ))}
</Select>
```

Filter dikirim sebagai query string dan diproses kembali oleh server. Jika
belum ada assignment yang dipilih, tampilkan pesan bahwa Teacher perlu memilih
assignment untuk melihat ringkasan Attendance.

## 11.11 Menampilkan Ringkasan Kelas

Gunakan komponen tabel MUI:

```tsx
<Table>
    <TableHead>
        <TableRow>
            <TableCell>Kelas</TableCell>
            <TableCell>Jumlah murid laki-laki</TableCell>
            <TableCell>Jumlah murid perempuan</TableCell>
        </TableRow>
    </TableHead>

    <TableBody>
        {payload.classSummaries.map((classRoom) => (
            <TableRow key={classRoom.id}>
                <TableCell>
                    {classRoom.level} {classRoom.name}
                </TableCell>
                <TableCell>{classRoom.male_count}</TableCell>
                <TableCell>{classRoom.female_count}</TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
```

Jika tidak ada data, tampilkan pesan yang sesuai:

```tsx
{payload.classSummaries.length === 0 && (
    <Typography>Tidak ada data kelas.</Typography>
)}
```

## 11.12 Mengatur Locale Day.js

Import locale Indonesia pada page Teacher Dashboard:

```tsx
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');
```

Format tanggal pada tabel Attendance:

```tsx
dayjs(row.attendance_date)
    .locale('id')
    .format('DD MMM YYYY')
```

Server tetap mengirim tanggal dalam format machine-readable seperti
`YYYY-MM-DD`. Formatting untuk kebutuhan tampilan dilakukan pada frontend.

## 11.13 Menampilkan Ringkasan Attendance

Header tabel:

```tsx
<TableHead>
    <TableRow>
        <TableCell>Tanggal</TableCell>
        <TableCell>Hadir</TableCell>
        <TableCell>Izin</TableCell>
        <TableCell>Sakit</TableCell>
        <TableCell>Alpa</TableCell>
        <TableCell>Detail</TableCell>
    </TableRow>
</TableHead>
```

Body tabel dan link detail:

```tsx
<TableBody>
    {payload.attendanceSummary.map((row) => (
        <TableRow key={row.attendance_date}>
            <TableCell>
                {dayjs(row.attendance_date)
                    .locale('id')
                    .format('DD MMM YYYY')}
            </TableCell>
            <TableCell>{row.present_count}</TableCell>
            <TableCell>{row.excused_count}</TableCell>
            <TableCell>{row.sick_count}</TableCell>
            <TableCell>{row.absent_count}</TableCell>
            <TableCell>
                <Button
                    size="small"
                    onClick={() =>
                        router.visit(
                            `/teacher/attendances?assignment_id=${selectedAssignmentId}&attendance_date=${row.attendance_date}`,
                        )
                    }
                >
                    Detail
                </Button>
            </TableCell>
        </TableRow>
    ))}
</TableBody>
```

Link tersebut dapat memakai route Attendance yang sudah dibuat pada Bab 10.
Jika nanti dibutuhkan halaman detail terpisah, buat route baru dengan parameter
assignment dan tanggal. Controller tetap harus memeriksa ownership Teacher.

## 11.14 TypeScript Props

Definisikan type agar struktur payload tidak menggunakan `any`:

```tsx
type ClassSummary = {
    id: number;
    name: string;
    level: string;
    male_count: number;
    female_count: number;
};

type AttendanceSummary = {
    attendance_date: string;
    present_count: number | null;
    excused_count: number | null;
    sick_count: number | null;
    absent_count: number | null;
};

type TeacherDashboardPayload = {
    assignments: Assignment[];
    selectedAssignmentId?: number;
    classSummaries: ClassSummary[];
    attendanceSummary: AttendanceSummary[];
    weekLabel: string;
};
```

## 11.15 Latihan Mandiri

1. Tambahkan `classSummaries` pada payload dashboard Teacher.
2. Tampilkan tabel jumlah Student laki-laki dan perempuan.
3. Tambahkan filter `TeachingAssignment` menggunakan MUI `Select`.
4. Buat query summary Attendance untuk minggu berjalan.
5. Tampilkan kolom Hadir, Izin, Sakit, dan Alpa.
6. Atur locale Day.js ke `id`.
7. Format tanggal menjadi `DD MMM YYYY`.
8. Tambahkan tombol atau link menuju detail Attendance pada tanggal tersebut.
9. Uji dashboard dengan Teacher yang memiliki satu dan beberapa assignment.
10. Uji bahwa Teacher tidak dapat melihat data milik Teacher lain dengan
    mengubah `assignment_id` pada URL.

## 11.16 Ringkasan Bab Ini

Pada bab ini kita telah:

- melakukan review terhadap dashboard Teacher;
- menambahkan ringkasan kelas dan gender Student;
- menambahkan ringkasan Attendance minggu berjalan;
- menambahkan filter `TeachingAssignment`;
- menggunakan agregasi query pada sisi server;
- menggunakan Day.js dengan locale Indonesia;
- menampilkan tanggal dengan format `DD MMM YYYY`;
- menyediakan link ke detail Attendance.
    
