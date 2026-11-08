# Bab Tambahan — Konfigurasi Timezone Laravel

Konfigurasi timezone diperlukan agar waktu yang digunakan Laravel sesuai dengan
lokasi aplikasi. Pada aplikasi Prezence, timezone `Asia/Jakarta` digunakan
sebagai contoh karena aplikasi dikembangkan untuk lingkungan Indonesia.

Timezone memengaruhi beberapa hal, antara lain:

- hasil fungsi `now()`;
- penentuan awal dan akhir minggu;
- tanggal dan waktu penyimpanan `Attendance`;
- tampilan waktu yang dihasilkan oleh aplikasi.

## 1. Mengatur `APP_TIMEZONE` pada `.env`

Buka file `.env` pada folder utama project. Cari key `APP_TIMEZONE`. Jika key
tersebut belum ada, tambahkan pada bagian paling bawah file:

```env
APP_TIMEZONE=Asia/Jakarta
```

Jika key tersebut sudah ada, ubah nilainya menjadi `Asia/Jakarta`.

## 2. Mengatur `config/app.php`

Buka file berikut:

```text
config/app.php
```

Cari konfigurasi `timezone`. Biasanya konfigurasi awalnya adalah:

```php
'timezone' => 'UTC',
```

Ubah menjadi:

```php
'timezone' => env('APP_TIMEZONE', 'UTC'),
```

Dengan konfigurasi tersebut, Laravel menggunakan nilai `APP_TIMEZONE` dari
file `.env`. Jika nilai tersebut tidak tersedia, Laravel menggunakan `UTC`
sebagai nilai cadangan.

## 3. Menghapus Cache Konfigurasi

Setelah konfigurasi selesai, buka terminal pada folder project dan jalankan:

```powershell
php artisan config:clear
```

Perintah tersebut menghapus cache konfigurasi sehingga Laravel membaca nilai
terbaru dari file `.env` dan `config/app.php`.

## 4. Memeriksa Konfigurasi

Gunakan Tinker untuk memeriksa waktu yang digunakan Laravel:

```powershell
php artisan tinker
```

Kemudian jalankan:

```php
config('app.timezone');
now()->format('Y-m-d H:i:s T');
```

Hasil konfigurasi seharusnya menunjukkan:

```text
Asia/Jakarta
```
dan waktu sekarang sesuai dengan waktu di pc.

## Ringkasan

- `APP_TIMEZONE` diletakkan pada file `.env`.
- `config/app.php` membaca nilai tersebut menggunakan `env()`.
- `php artisan config:clear` digunakan setelah konfigurasi diubah.
- `Asia/Jakarta` digunakan sebagai timezone aplikasi Prezence.
