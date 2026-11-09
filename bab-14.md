# 📘 BAB 14 — PENYELESAIAN DAN PENYEMPURNAAN APLIKASI

Bab ini merupakan proyek mandiri penutup. Siswa membaca kembali PRD, SRS, dan
implementasi project, kemudian menyelesaikan fitur yang masih belum tersedia.
Siswa juga menyempurnakan tampilan agar aplikasi mudah dipahami oleh pengguna.

## 14.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, siswa diharapkan mampu:

- membandingkan requirement dengan implementasi;
- menemukan fitur yang belum dibuat atau belum lengkap;
- merancang solusi sebelum menulis kode;
- menerapkan authorization berdasarkan Role dan ownership data;
- menguji fitur berdasarkan acceptance criteria;
- menyesuaikan istilah dan tampilan aplikasi.

## 14.2 Gap Analysis

Buat tabel perbandingan antara PRD/SRS dan implementasi:

| Requirement                        | Status       | Catatan                 | Rencana                  |
| ---------------------------------- | ------------ | ----------------------- | ------------------------ |
| Student melihat riwayat Attendance | Belum dibuat | Belum ada route Student | Buat controller dan page |
| Teacher mencatat Attendance        | Selesai      | Tersedia pada Bab 10    | Uji kembali              |
| User mengubah password             | Selesai      | Tersedia pada Bab 13    | Uji validasi             |

Gunakan status `Selesai`, `Sebagian`, `Belum dibuat`, atau `Tidak diperlukan`.
Jangan menulis kode sebelum memahami requirement, data yang diperlukan, Role,
dan route yang akan digunakan.

## 14.3 Fitur untuk Diselesaikan

Gunakan daftar berikut sebagai target implementasi.

### Student Dashboard dan Attendance History

Buat dashboard `student` yang menampilkan nama Student, ClassRoom, ringkasan
jumlah `H`, `I`, `S`, `A`, dan tautan menuju riwayat Attendance.

Buat halaman riwayat Attendance milik Student. Identitas Student harus diambil
dari User yang login, bukan dari `student_id` yang dikirim browser:

```php
$student = $request->user()->profile;
abort_unless($student instanceof Student, 403);

$attendances = $student->attendances()
    ->with('teachingAssignment.subject', 'teachingAssignment.classRoom')
    ->latest('attendance_date')
    ->get();
```

### Dashboard dan Report `report_viewer`

Buat dashboard dan report untuk Staff dengan Role `report_viewer`. Fitur
minimalnya adalah melihat laporan seluruh Student, memilih bulan, tahun, dan
`TeachingAssignment`, serta melihat status dan ringkasan `H`, `I`, `S`, dan `A`.

`report_viewer` memiliki hak baca dan tidak boleh mencatat Attendance atau
mengubah data master.

### Account Management

Sebagai latihan mandiri untuk `admin`, buat fitur:

- menampilkan status account dan email pada daftar profile;
- mengubah email dengan validasi unique;
- mengaktifkan atau menonaktifkan account;
- membuat temporary password baru;
- mengirim ulang credential melalui email.

Perhatikan bahwa email disimpan pada `users`, profile tidak menyimpan email,
dan account hanya dibuat setelah profile tersedia.

### Penyempurnaan Attendance

Tambahkan `note` pada form Attendance jika belum tersedia. Validasi dilakukan di
server. Penghapusan Attendance tidak diperlukan dalam versi ini; Teacher hanya
dapat membuat dan mengubah Attendance pada TeachingAssignment miliknya.

## 14.4 Pengujian Authorization

Uji minimal skenario berikut:

| Percobaan                                          | Hasil yang diharapkan |
| -------------------------------------------------- | --------------------- |
| Student membuka halaman Admin                      | Ditolak               |
| Student membuka halaman Attendance Teacher         | Ditolak               |
| Teacher membuka assignment Teacher lain            | Ditolak               |
| Teacher mengubah Attendance assignment lain        | Ditolak               |
| `report_viewer` membuka form pencatatan Attendance | Ditolak               |
| User belum login membuka `/`                       | Dialihkan ke `/login` |
| Account nonaktif melakukan login                   | Login ditolak         |

Menyembunyikan menu pada frontend saja tidak cukup. Authorization harus tetap
diperiksa pada server.

## 14.5 Penyesuaian Istilah Antarmuka

Istilah teknis pada source code dapat berbeda dari label yang dilihat user:

| Istilah teknis       | Label tampilan  |
| -------------------- | --------------- |
| `Teacher`            | Guru            |
| `Student`            | Murid           |
| `Staff`              | Staf            |
| `TeachingAssignment` | Mapel dan Kelas |
| `Attendance`         | Presensi        |
| `ClassRoom`          | Kelas           |
| `Subject`            | Mata Pelajaran  |
| `Report`             | Laporan         |
| `Profile`            | Profil          |
| `Account`            | Akun            |

Contoh:

```tsx
<Typography variant="h4">Daftar Guru</Typography>
<Button>Tambah Murid</Button>
<FormLabel>Mapel dan Kelas</FormLabel>
```

Nama model, tabel, route, field request, Role database, folder, dan file source
code tetap dapat menggunakan istilah teknis berbahasa Inggris.

## 14.6 Menyempurnakan User Interface

Periksa seluruh halaman dan lakukan penyesuaian berikut jika diperlukan:

- gunakan label dan kapitalisasi yang konsisten;
- gunakan `size="small"` pada input yang sesuai;
- batasi lebar button menggunakan wrapper `Box`;
- tampilkan error dekat field terkait;
- tampilkan `Alert` untuk proses berhasil atau gagal;
- gunakan `TablePagination` untuk data yang banyak;
- gunakan `DatePicker` untuk input tanggal;
- gunakan `Select` untuk pilihan yang sudah ditentukan;
- tampilkan loading state saat form diproses;
- gunakan horizontal scrolling untuk tabel yang lebar;
- periksa tampilan pada layar yang lebih kecil.

## 14.7 Error Handling

Pastikan aplikasi menangani kondisi berikut:

- data tidak ditemukan;
- input tidak valid;
- email sudah digunakan;
- account profile sudah tersedia;
- file CSV tidak valid;
- data CSV duplikat;
- User tidak memiliki akses;
- proses penyimpanan gagal;
- email credential gagal dikirim.

Pesan error harus mudah dipahami user. Detail query atau struktur database tidak
perlu ditampilkan pada antarmuka.

## 14.8 Acceptance Criteria

Gunakan acceptance criteria pada SRS sebagai checklist. Pastikan:

- semua Role login menggunakan email dan password;
- account nonaktif tidak dapat login;
- User yang belum login diarahkan ke `/login`;
- User melihat profile miliknya sendiri;
- password lama harus benar dan konfirmasi password harus sama;
- `must_change_password` berubah menjadi `false` setelah password diubah;
- Teacher hanya melihat Student dari assignment miliknya;
- Attendance tidak diduplikasi;
- Teacher hanya melihat report assignment miliknya;
- `report_viewer` dapat melihat report seluruh Student;
- ringkasan `H`, `I`, `S`, dan `A` dihitung dengan benar.

## 14.9 Dokumentasi Perubahan

Catat setiap fitur yang ditambahkan:

- tujuan fitur;
- Role yang dapat menggunakannya;
- route;
- controller dan page React;
- validasi;
- cara pengujian;
- perubahan istilah atau tampilan.

## 14.10 Ringkasan Bab Ini

Bab ini melatih siswa menyelesaikan aplikasi berdasarkan requirement, bukan
sekadar mengikuti contoh kode. Siswa melakukan gap analysis, mengambil
keputusan teknis, mengimplementasikan fitur, menguji authorization, dan
meningkatkan usability aplikasi.
