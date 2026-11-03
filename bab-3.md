# 📘 BAB 3 — MEMBUAT PROJECT DENGAN REACT DAN INERTIA

Pada bab ini kita mulai membuat aplikasi Laravel bernama **Prezence**.

Frontend aplikasi akan dibuat menggunakan React dan MUI. Laravel tetap digunakan untuk route, controller, authentication, dan database. Inertia digunakan sebagai penghubung antara Laravel dan React.

Pada bab ini, Blade tidak digunakan untuk membuat halaman frontend. Blade akan digunakan pada bab lain jika kita perlu membuat template email Laravel.

---

## 3.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda diharapkan mampu:

- membuat project Laravel baru menggunakan Laravel Herd;
- menyiapkan React dan Inertia pada project Laravel;
- memasang MUI v9 dan Day.js;
- mengenali struktur frontend React;
- membuat `MainLayout` menggunakan MUI;
- membuat halaman `About` dan `Guide`;
- memahami hubungan Laravel route dengan Inertia page;
- menjalankan migration dasar authentication;
- membuat profile `Staff` dan migration-nya;
- membuat account `User` yang terhubung dengan profile melalui polymorphic relation;
- membuat form login menggunakan React dan MUI;
- memvalidasi email dan password melalui Laravel controller;
- menggunakan middleware `auth` untuk melindungi route;
- menampilkan dashboard setelah login.

---

## 3.2 Membuat Project Laravel

Pastikan Laravel Herd sudah terpasang dan perintah `laravel` dapat digunakan pada PowerShell.

Masuk ke folder tempat project Laravel disimpan:

```powershell
cd ~/Herd
```

Buat project baru:

```powershell
laravel new prezence
```

Laravel Installer akan menampilkan beberapa pertanyaan. Gunakan pilihan berikut:

### Pertanyaan 1 — Starter Kit

```text
Do you want to use a starter kit?
```

Pilih:

```text
No
```

Pada tutorial ini, authentication akan dibuat secara bertahap agar siswa memahami proses login, controller, session, dan middleware.

### Pertanyaan 2 — Frontend Stack

```text
Which frontend stack do you want to build on?
```

Pilih:

```text
React
```

Pilihan ini membuat project menggunakan React, Inertia, dan TypeScript. Karena itu, file frontend yang dihasilkan menggunakan ekstensi `.tsx`, bukan `.jsx`.

### Pertanyaan Berikutnya

Gunakan pilihan berikut jika ditampilkan:

- menggunakan database SQLite;
- gunakan pilihan testing default yang tersedia;
- gunakan konfigurasi frontend default lainnya.

Setelah proses instalasi selesai, periksa file yang dibuat:

```text
resources/js/app.tsx
resources/js/pages/welcome.tsx
tsconfig.json
vite.config.ts
```

Jika file-file tersebut tersedia, berarti project menggunakan React + TypeScript.

Masuk ke folder project:

```powershell
cd prezence
```

Jika project berada di dalam folder Herd, buka alamat berikut pada browser:

```text
http://prezence.test
```

Nama folder project menggunakan huruf kecil `prezence`, sedangkan nama aplikasi yang ditampilkan kepada pengguna adalah `Prezence`.

---

## 3.3 Mengenali Struktur Project

Beberapa folder penting pada project Laravel adalah:

| Folder            | Fungsi                                             |
| ----------------- | -------------------------------------------------- |
| `app`             | Menyimpan Model, Controller, dan komponen aplikasi |
| `database`        | Menyimpan migration, seeder, dan factory           |
| `public`          | Titik akses aplikasi dan asset publik              |
| `resources/js`    | Menyimpan kode React                               |
| `resources/views` | Digunakan oleh Blade, misalnya untuk email         |
| `routes`          | Menyimpan definisi route Laravel                   |
| `.env`            | Menyimpan konfigurasi lingkungan lokal             |

Frontend utama pada bab ini berada di:

```text
resources/js
```

---

## 3.4 Memeriksa Inertia React

Inertia menghubungkan Laravel dengan React. Laravel tetap menentukan route dan controller, sedangkan React menampilkan page pada browser.

Karena pada langkah sebelumnya kita memilih frontend stack `React`, Laravel Installer biasanya sudah memasang adapter Inertia, React, dan TypeScript. Periksa package yang tersedia pada `package.json` dan `composer.json` sebelum memasang package secara manual.

Periksa package Laravel:

```powershell
composer show inertiajs/inertia-laravel
```

Periksa package frontend:

```powershell
npm list @inertiajs/react react react-dom typescript
```

Jika package tersebut sudah tersedia, tidak perlu menjalankan `composer require` atau `npm install` ulang.

Package Inertia Laravel terpasang melalui Composer. Pada beberapa setup Laravel atau starter kit, middleware Inertia mungkin sudah dibuat dan didaftarkan secara otomatis. Karena itu, periksa terlebih dahulu sebelum membuat atau mendaftarkan middleware secara manual.

Periksa apakah command Inertia tersedia:

```powershell
php artisan list | Select-String inertia
```

Periksa apakah file middleware sudah tersedia:

```powershell
Test-Path app/Http/Middleware/HandleInertiaRequests.php
```

Jika hasil pemeriksaan menunjukkan file tersebut belum tersedia, buat middleware dengan perintah:

```powershell
php artisan inertia:middleware
```

### Memeriksa Pendaftaran Middleware Inertia

Periksa apakah `HandleInertiaRequests` sudah terdaftar pada `bootstrap/app.php`:

```powershell
Select-String `
    -Path bootstrap/app.php `
    -Pattern "HandleInertiaRequests"
```

Jika belum terdaftar, buka file `bootstrap/app.php` dan tambahkan middleware tersebut pada middleware web:

```php
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Configuration\Middleware;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        HandleInertiaRequests::class,
    ]);
})
```

Middleware ini membantu Laravel menyediakan data request kepada halaman Inertia.

Jika file dan pendaftaran middleware sudah tersedia, langkah pembuatan dan pendaftaran manual tidak perlu dilakukan lagi. Pastikan hanya ada satu pendaftaran `HandleInertiaRequests` agar middleware tidak tercatat dua kali.

### Root View Inertia

Inertia tetap membutuhkan satu file Blade sebagai root view untuk memasang aplikasi React. File ini hanya berfungsi sebagai shell HTML dan bukan tempat membuat halaman frontend.

Periksa apakah file berikut sudah dibuat oleh installer:

```text
resources/views/app.blade.php
```

Jika file belum tersedia, buat file tersebut. Isi atau sesuaikan dengan:

```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>

```

File Blade ini hanya digunakan sebagai titik pemasangan React. Halaman `About`, `Guide`, `Login`, dan `Dashboard` tetap dibuat sebagai React page.

---

## 3.5 Memasang MUI v9 dan Day.js

MUI menyediakan komponen frontend siap pakai untuk React. MUI menggunakan Emotion sebagai styling engine.

Pasang MUI dan dependency-nya:

```powershell
npm install @mui/material@^9 @emotion/react @emotion/styled
```

Pasang Day.js:

```powershell
npm install dayjs
```

Day.js akan digunakan untuk mengolah tanggal, misalnya menampilkan tanggal hari ini pada form Attendance.

Jika nanti membutuhkan date picker dari MUI, pasang package tambahan:

```powershell
npm install @mui/x-date-pickers
```

> MUI adalah library React. Karena itu, MUI tidak digunakan langsung pada file Blade. Blade hanya digunakan untuk kebutuhan tertentu seperti template email.

---

## 3.6 Memeriksa Konfigurasi Vite dan TypeScript

React, TypeScript, plugin React, dan Vite sudah disiapkan oleh Laravel Installer ketika frontend stack `React` dipilih. Karena itu, kita tidak perlu memasang ulang plugin React atau mengganti konfigurasi Vite secara manual.

Periksa file konfigurasi berikut:

```text
vite.config.ts
tsconfig.json
```

File entry point React pada project ini adalah:

```text
resources/js/app.tsx
```

Laravel Installer sudah membuat konfigurasi entry point Inertia pada file tersebut. Jangan mengganti seluruh isi `app.tsx` secara manual. Pertahankan konfigurasi yang dihasilkan installer agar tetap kompatibel dengan Inertia, Vite Plus, dan plugin Wayfinder.

Pada project ini, page React disimpan pada folder:

```text
resources/js/pages
```

### Menambahkan Alias Import `@`

Project Laravel sudah memiliki konfigurasi alias pada `tsconfig.json`:

```json
{
    "compilerOptions": {
        "paths": {
            "@/*": ["./resources/js/*"]
        }
    }
}
```

Konfigurasi tersebut membuat TypeScript mengenali alias `@`. Agar Vite juga dapat mengenalinya saat proses development dan build, pasang plugin `vite-tsconfig-paths`:

```powershell
npm install -D vite-tsconfig-paths
```

Buka `vite.config.ts`, lalu tambahkan import berikut:

```ts
import tsconfigPaths from 'vite-tsconfig-paths';
```

Tambahkan `tsconfigPaths()` pada daftar plugin. Jangan menghapus plugin lain yang sudah dibuat oleh Laravel Installer:

```ts
export default defineConfig({
    plugins: lazyPlugins(() => [
        tsconfigPaths(),

        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),

        inertia(),
        react(),
        tailwindcss(),
        wayfinder(),
    ]),
});
```

Setelah itu, import dapat menggunakan alias:

```tsx
import MainLayout from '@/layouts/MainLayout';
```

Alias tersebut menunjuk ke:

```text
@/layouts/MainLayout
        ↓
resources/js/layouts/MainLayout.tsx
```

Periksa konfigurasi dengan perintah:

```powershell
npm run types:check
npm run build
```

Jalankan Vite pada terminal:

```powershell
npm run dev
```

Biarkan proses ini berjalan selama mengembangkan frontend.

---

## 3.7 Membagikan Data User ke React

`MainLayout` perlu mengetahui apakah User sedang login agar dapat menampilkan button `Logout` secara kondisional.

Buka file:

```text
app/Http/Middleware/HandleInertiaRequests.php
```

Pastikan method `share()` membagikan data User:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
        ],
    ];
}
```

Jika User belum login, nilai `auth.user` adalah `null`. Jika User sudah login, data User tersedia pada setiap React page melalui Inertia.

### 3.7.1 Membuat Type `User` untuk Data Inertia

Karena project menggunakan TypeScript, struktur data yang dibagikan Laravel melalui Inertia perlu memiliki type. Buat folder dan file berikut jika belum tersedia:

```text
resources/js/types/auth.ts
```

Isi file tersebut dengan:

```ts
export type User = {
    id: number;
    email: string;
    role: 'admin' | 'teacher' | 'student' | 'report_viewer';
    is_active: boolean;
    must_change_password: boolean;
    profile_type: string;
    profile_id: number;
};

export type Auth = {
    user: User | null;
};
```

Perhatikan bahwa type `User` tidak memiliki field `name`. Nama disimpan pada profile `Staff`, `Teacher`, atau `Student`, bukan pada tabel `users`.

Buka atau buat file berikut:

```text
resources/js/types/global.d.ts
```

Pastikan file tersebut mengimpor type `Auth` dan menggunakannya pada shared props Inertia:

```ts
import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
```

Field `name` pada `sharedPageProps` di atas adalah nama aplikasi yang dibagikan oleh middleware Inertia, bukan field `name` milik `User`.

Dengan type ini, TypeScript dapat memeriksa penggunaan `auth.user` pada `MainLayout` dan React page lainnya. Jalankan pemeriksaan type setelah melakukan perubahan:

```powershell
npm run types:check
```

---

## 3.8 Membuat MainLayout dengan MUI

Buat folder:

```text
resources/js/layouts
```

Buat file:

```text
resources/js/layouts/MainLayout.tsx
```

Isi dengan layout sederhana:

```tsx
import { AppBar, Button, Container, Toolbar, Typography } from "@mui/material";
import {  usePage, router } from "@inertiajs/react";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Prezence
                    </Typography>
                    {user && (
                        <Button
                            color="inherit"
                            onClick={() => router.visit("/")}
                        >
                            Dashboard
                        </Button>
                    )}

                    <Button
                        color="inherit"
                        onClick={() => router.visit("/about")}
                    >
                        About
                    </Button>
                    <Button
                        color="inherit"
                        onClick={() => router.visit("/guide")}
                    >
                        Guide
                    </Button>
                    {user ? (
                        <Button
                            color="inherit"
                            onClick={() => router.post("/logout")}
                        >
                            Logout
                        </Button>
                    ):(
                        <Button
                            color="inherit"
                            onClick={() => router.visit("/login")}
                        >
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Container sx={{ py: 4 }}>{children}</Container>
        </>
    );
}



```

`MainLayout` digunakan oleh semua page agar navigasi dan struktur tampilan tetap konsisten.

---

## 3.9 Membuat Halaman Statis React

Buat file berikut:

```text
resources/js/pages/About.tsx
resources/js/pages/Guide.tsx
```

Contoh `About.tsx`:

```tsx
import { Paper, Typography } from '@mui/material';
import MainLayout from '../layouts/MainLayout';

export default function About() {
    return (
        <MainLayout>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    About Prezence
                </Typography>
                <Typography>
                    Prezence adalah aplikasi pembelajaran untuk mengelola presensi siswa.
                </Typography>
            </Paper>
        </MainLayout>
    );
}
```

`Guide.tsx` menggunakan pola yang sama, tetapi memiliki isi yang sesuai untuk petunjuk penggunaan aplikasi.


## 3.10 Routing Laravel dan Inertia

Buka file:

```text
routes/web.php
```

Gunakan `Inertia::render()` untuk menghubungkan route Laravel dengan React page:

```php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/guide', function () {
    return Inertia::render('Guide');
})->name('guide');
```

Hubungan route dengan React page:

```text
/about
    ↓
Inertia::render('About')
    ↓
resources/js/pages/About.tsx
```

Untuk melihat route yang tersedia:

```powershell
php artisan route:list
```

Pada aplikasi React + Inertia, Laravel tetap menjadi tempat utama untuk mendefinisikan route. Kita tidak menggunakan React Router untuk route aplikasi Laravel.

---

### Latihan Mandiri — Membuat Halaman Contact

Sekarang buat halaman `Contact` secara mandiri. Halaman ini harus dapat dibuka melalui browser pada alamat:

```text
http://prezence.test/contact
```

Untuk menyelesaikan latihan ini, buat tiga bagian berikut:

1. React page:

   ```text
   resources/js/pages/Contact.tsx
   ```

2. Route Laravel yang mengembalikan page `Contact`.
3. Button `Contact` pada `MainLayout.tsx` yang menggunakan `router.visit('/contact')`.

Gunakan halaman `About` atau `Guide` sebagai referensi. Pastikan Anda memahami hubungan berikut:

```text
Button Contact
        ↓
router.visit('/contact')
        ↓
Route Laravel
        ↓
Inertia::render('Contact')
        ↓
Contact.tsx
```

---

## 3.11 Migration Dasar Authentication

Laravel menyediakan migration dasar untuk authentication, yaitu tabel:

- `users`;
- `password_reset_tokens`;
- `sessions`.

Laravel Installer biasanya sudah menjalankan migration awal saat project dibuat. Oleh karena itu, periksa status migration terlebih dahulu:

```powershell
php artisan migrate:status
```

Perhatikan kolom **Ran** dan **Migration**. Jika terdapat migration dengan status `Pending`, jalankan:

```powershell
php artisan migrate
```

Jika semua migration sudah berstatus `Ran`, tidak perlu menjalankan `php artisan migrate` kembali.

Pastikan konfigurasi database pada `.env` sesuai dengan database yang digunakan sebelum menjalankan migration.

### 3.11.1 Memeriksa Struktur Migration `users`

Sebelum melanjutkan, periksa file migration yang membuat tabel `users` di folder:

```text
database/migrations/
```

Migration bawaan Laravel biasanya sudah menyediakan beberapa field seperti:

- `id`;
- `name`;
- `email`;
- `email_verified_at`;
- `password`;
- `remember_token`;
- `created_at` dan `updated_at`.

Namun, struktur `User` pada SRS juga membutuhkan field berikut:

| Field                  | Tipe    | Keterangan                                      |
| ---------------------- | ------- | ----------------------------------------------- |
| `role`                 | string  | `admin`, `teacher`, `student`, atau `report_viewer` |
| `is_active`            | boolean | Menentukan apakah akun dapat login              |
| `must_change_password` | boolean | Menandai akun yang wajib mengganti password     |

Field `name` tidak digunakan pada tabel `users`. Field tersebut disimpan pada profile `Teacher`, `Student`, atau `Staff`. Field `email` tetap berada pada tabel `users` karena merupakan atribut account yang digunakan oleh semua `Role`.

Karena migration bawaan mungkin sudah berstatus `Ran`, jangan hanya mengubah file migration lama. Buat migration baru untuk menambahkan field yang belum tersedia:

```powershell
php artisan make:migration add_account_fields_to_users_table --table=users
```

Buka file migration yang baru dibuat, lalu lengkapi method `up()` dan `down()`:

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->string('role')->default('student');
            $table->boolean('is_active')->default(true);
            $table->boolean('must_change_password')->default(true);
            $table->morphs('profile');
            $table->unique(['profile_type', 'profile_id']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['profile_type', 'profile_id']);
            $table->dropColumn([
                'role',
                'is_active',
                'must_change_password',
                'profile_type',
                'profile_id',
            ]);
            $table->string('name');
        });
    }
};
```

Karena `profile_type` dan `profile_id` wajib diisi, migration ini hanya dapat dijalankan jika belum ada record pada tabel `users` yang belum memiliki profile. Pada project pembelajaran yang masih kosong, kondisi ini biasanya terpenuhi. Jangan menghapus data pada database yang penting hanya untuk menjalankan migration.

Jalankan migration tersebut:

```powershell
php artisan migrate
```

Perintah `migrate` hanya menjalankan migration yang masih berstatus `Pending`. Setelah itu, periksa kembali:

```powershell
php artisan migrate:status
```

> Pada aplikasi baru, migration awal dan migration penambahan field dapat saja belum dijalankan. Pada kondisi tersebut, jalankan `php artisan migrate` satu kali setelah semua migration siap.

Struktur migration harus selalu dibandingkan dengan entitas `User` pada SRS. Jangan menambahkan field hanya karena tersedia pada contoh project lain, dan jangan menghapus field bawaan tanpa memahami dampaknya terhadap authentication Laravel.

### 3.11.2 Menyesuaikan Model `User`

Migration hanya mengubah struktur database. Agar field baru dapat diisi melalui `User::create()` atau `User::updateOrCreate()`, periksa juga file:

```text
app/Models/User.php
```

Pastikan field tambahan tercantum pada `$fillable` dan tipe boolean dikonversi dengan benar. Field `name` tidak lagi digunakan pada `User`. Sesuaikan bagian yang sudah tersedia pada model, jangan menghapus konfigurasi bawaan Laravel:

```php
#[Fillable([
    'email',
    'password',
    'role',
    'is_active',
    'must_change_password',
    'profile_type',
    'profile_id',
])]
class User extends Authenticatable
{
    public function profile(): MorphTo
    {
        return $this->morphTo();
    }
}
```

Pastikan import berikut tersedia:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;
```

Jika model menggunakan `$fillable`, tambahkan field yang sama ke dalam array tersebut. Selanjutnya, pada bagian method `casts()`:

```php
protected function casts(): array
{
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'must_change_password' => 'boolean',
    ];
}
```

`$fillable`, `$casts`, dan `casts()` bergantung pada template Laravel yang digunakan. Pertahankan gaya yang sudah digunakan oleh model `User` pada project Anda.

Pada bab ini kita belum membuat migration untuk `Student`, `Teacher`, `Subject`, `ClassRoom`, `TeachingAssignment`, atau `Attendance`. Saat migration domain dibuat pada bab berikutnya, struktur setiap tabel harus kembali dibandingkan dengan SRS. Jangan menambahkan `email` ke tabel `teachers`, `students`, atau `staff` karena field tersebut sudah tersedia pada `users`.

### 3.11.3 Membuat Profile `Staff`

Karena `profile_type` dan `profile_id` pada `users` wajib diisi, profile harus dibuat sebelum account `User`. Pada bab ini kita membuat profile `Staff` terlebih dahulu. Profile ini juga digunakan untuk account awal `admin`.

Buat model dan migration:

```powershell
php artisan make:model Staff -m
```

Pada migration `Staff`, gunakan struktur sesuai SRS:

```php
Schema::create('staff', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('position', 50);
    $table->timestamps();
});
```

Pada model `Staff`, tetapkan nama tabel secara eksplisit dan tambahkan relasi polymorphic:

```php
protected $table = 'staff';

protected $fillable = [
    'name',
    'position',
];

public function user(): MorphOne
{
    return $this->morphOne(User::class, 'profile');
}
```

Pastikan import berikut tersedia:

```php
use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\MorphOne;
```

Jalankan migration dan periksa statusnya:

```powershell
php artisan migrate
php artisan migrate:status
```

---

## 3.12 Membuat User Awal dengan Seeder

Seeder digunakan untuk memasukkan data awal ke database. Buat seeder khusus untuk akun `admin` menggunakan perintah:

```powershell
php artisan make:seeder AdminSeeder
```

Perintah tersebut membuat file:

```text
database/seeders/AdminSeeder.php
```

Buka file `AdminSeeder.php`, lalu isi dengan:

```php
namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $staff = Staff::firstOrCreate([
            'name' => 'Administrator',
            'position' => 'Administrator',
        ]);

        User::updateOrCreate(
            ['email' => 'admin@prezence.test'],
            [
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
                'must_change_password' => false,
                'profile_type' => Staff::class,
                'profile_id' => $staff->id,
            ]
        );
    }
}
```

Buka file:

```text
database/seeders/DatabaseSeeder.php
```

Panggil `AdminSeeder` dari method `run()`:

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AdminSeeder::class);
    }
}
```

Jalankan seluruh seeder melalui `DatabaseSeeder`:

```powershell
php artisan db:seed
```

Seeder tertentu juga dapat dijalankan secara langsung:

```powershell
php artisan db:seed --class=AdminSeeder
```

Akun pengujian:

```text
Email    : admin@prezence.test
Password : password
```

> Password tersebut hanya digunakan untuk pembelajaran lokal. Jangan menggunakan password sederhana seperti ini pada aplikasi produksi.

---

## 3.13 Membuat AuthController

Buat controller:

```powershell
php artisan make:controller AuthController
```

Buka file:

```text
app/Http/Controllers/AuthController.php
```

Tambahkan method untuk menampilkan form login dan memproses login:

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'Email atau password tidak sesuai.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
```

Pada bab ini, login menggunakan email dan password sebagai fondasi authentication. Login dengan `mobile_phone` untuk `teacher` dan kombinasi `nis` serta `birth_date` untuk `student` akan dibahas setelah model domain dibuat.

---

## 3.14 Membuat Form Login dengan MUI

Buat folder dan file berikut:

```text
resources/js/pages/Auth/Login.tsx
```

Isi dengan:

```tsx
import { useForm } from '@inertiajs/react';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import MainLayout from '../../layouts/MainLayout';
import type { FormEvent } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/login');
    }

    return (
        <MainLayout>
            <Paper sx={{ maxWidth: 480, mx: 'auto', p: 4 }}>
                <Stack component="form" spacing={2} onSubmit={submit} noValidate>
                    <Typography variant="h4">Login</Typography>

                    {errors.email && <Alert severity="error">{errors.email}</Alert>}

                    <TextField
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        required
                    />

                    <TextField
                        label="Password"
                        type="password"
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        required
                    />

                    <Button type="submit" variant="contained" disabled={processing}>
                        {processing ? 'Memproses...' : 'Login'}
                    </Button>
                </Stack>
            </Paper>
        </MainLayout>
    );
}
```

`useForm` dari Inertia membantu mengirim form ke Laravel dan menerima kembali error validasi dari server.

---

## 3.15 Membuat DashboardController

Buat controller:

```powershell
php artisan make:controller DashboardController
```

Buka file:

```text
app/Http/Controllers/DashboardController.php
```

Isi dengan:

```php
namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard');
    }
}
```

Buat file:

```text
resources/js/pages/Dashboard.tsx
```

Isi dengan dashboard sederhana:

```tsx
import { Head } from "@inertiajs/react";
import { Paper, Stack, Typography } from "@mui/material";
import MainLayout from "../layouts/MainLayout";

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            <MainLayout>
                <Stack spacing={3}>
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h4">Dashboard</Typography>
                        <Typography>
                            Selamat datang di aplikasi Prezence.
                        </Typography>
                    </Paper>
                </Stack>
            </MainLayout>
        </>
    );
}

```

Pada tahap berikutnya, data `auth` akan dibagikan dari Laravel melalui Inertia. Untuk sementara, dashboard cukup menampilkan halaman sederhana.

---

## 3.16 Mengenal Middleware `auth`

Middleware adalah lapisan pemeriksaan yang dijalankan sebelum request diteruskan ke controller.

Middleware `auth` memeriksa apakah User sudah login.

```text
Browser mengakses /
        ↓
Middleware auth memeriksa session
        ↓
Belum login → redirect ke /login
Sudah login → request diteruskan
        ↓
DashboardController
        ↓
Dashboard React ditampilkan
```

Tambahkan route berikut pada `routes/web.php`:

```php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/about', fn () => Inertia::render('About'))
    ->name('about');

Route::get('/guide', fn () => Inertia::render('Guide'))
    ->name('guide');

Route::get('/login', [AuthController::class, 'showLogin'])
    ->middleware('guest')
    ->name('login');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('guest');

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('logout');
});
```

Route `/` adalah entry point dashboard aplikasi. Jika User belum login, middleware `auth` mengarahkan User ke `/login`. Setelah login berhasil, User diarahkan kembali ke `/`.

---

## 3.17 Menggunakan Day.js

Day.js digunakan untuk mengolah data tanggal pada frontend React.

Contoh menampilkan tanggal hari ini:

```tsx
import dayjs from 'dayjs';

const today = dayjs().format('YYYY-MM-DD');
```

Contoh penggunaan pada React state:

```tsx
import { useState } from 'react';
import dayjs from 'dayjs';

const [date, setDate] = useState(dayjs());
```

Pada bab Attendance, Day.js akan digunakan untuk memberikan nilai awal tanggal presensi.

---

## 3.18 Menjalankan dan Menguji Aplikasi

Jalankan Vite:

```powershell
npm run dev
```

Kemudian buka:

```text
http://prezence.test/about
http://prezence.test/guide
```

Setelah menyelesaikan latihan mandiri, uji halaman Contact:

```text
http://prezence.test/contact
```

### Menguji Login

1. Buka `http://prezence.test/login`.
2. Masukkan:

   ```text
   Email    : admin@prezence.test
   Password : password
   ```

3. Klik **Login**.
4. Pastikan browser diarahkan ke `/`.
5. Pastikan dashboard tampil.

### Menguji Middleware

1. Logout dari aplikasi.
2. Buka `http://prezence.test/` secara langsung.
3. Pastikan browser diarahkan ke `/login`.
4. Login kembali.
5. Pastikan browser diarahkan ke `/`.

### Menguji Validasi

Coba beberapa kondisi berikut:

- email dikosongkan;
- password dikosongkan;
- email menggunakan format yang salah;
- password salah;
- email belum terdaftar.

Perhatikan pesan validasi yang dikirim kembali oleh Laravel dan ditampilkan oleh React.

---

## 3.19 Mengenal Hot Reload dan Live Reload

Saat mengembangkan frontend, Vite menyediakan proses pengembangan yang membantu perubahan kode terlihat pada browser dengan cepat.

Jalankan Vite menggunakan perintah berikut dan biarkan prosesnya tetap berjalan:

```powershell
npm run dev
```

### Hot Reload

Hot Reload, yang sering disebut juga **Hot Module Replacement (HMR)**, memperbarui module frontend yang berubah tanpa memuat ulang seluruh halaman.

Contohnya, ketika Anda mengubah teks pada `About.tsx`, Vite dapat memperbarui tampilan tersebut tanpa memuat ulang seluruh aplikasi.

Keuntungan Hot Reload:

- perubahan frontend terlihat lebih cepat;
- posisi halaman dan sebagian state dapat dipertahankan;
- tidak perlu memuat ulang seluruh asset aplikasi.

### Live Reload

Live Reload memuat ulang halaman browser ketika file yang dipantau berubah. Berbeda dengan Hot Reload, Live Reload melakukan refresh terhadap halaman secara keseluruhan.

Live Reload berguna ketika perubahan tidak dapat diterapkan sebagai module update, misalnya perubahan pada:

- route Laravel;
- controller;
- middleware;
- konfigurasi tertentu;
- file backend lainnya.

Laravel Vite Plugin dapat membantu memantau perubahan file tertentu dan meminta browser melakukan refresh.

### Perbedaan Hot Reload dan Live Reload

| Fitur | Hot Reload | Live Reload |
|---|---|---|
| Cara kerja | Mengganti module yang berubah | Memuat ulang seluruh halaman |
| Umumnya digunakan untuk | File React, TypeScript, dan CSS | Route, controller, middleware, dan perubahan backend |
| Kecepatan | Biasanya lebih cepat | Memerlukan proses loading ulang |
| State halaman | Sebagian state dapat dipertahankan | State halaman biasanya dimulai kembali |

### Hal yang Perlu Diperhatikan

1. Terminal yang menjalankan `npm run dev` harus tetap terbuka.
2. Browser harus terhubung ke server development Vite.
3. Jika perubahan belum terlihat, lakukan refresh manual pada browser.
4. Jika terjadi error setelah mengubah konfigurasi, hentikan Vite dengan `Ctrl + C`, lalu jalankan kembali `npm run dev`.
5. Hot Reload dan Live Reload hanya membantu proses development; keduanya tidak digunakan sebagai bagian dari build production.

---

## Ringkasan Bab Ini

Pada bab ini kita telah:

- membuat project Laravel `Prezence`;
- memasang React dan Inertia;
- memasang MUI v9 dan Day.js;
- mengatur Vite untuk React;
- membuat `MainLayout` dengan MUI;
- membuat page `About` dan `Guide`;
- membuat halaman `Contact` sebagai latihan mandiri;
- memahami hubungan Laravel route dengan Inertia page;
- menjalankan migration dasar authentication;
- membuat profile `Staff`;
- membuat User melalui database seeder dan menghubungkannya dengan profile `Staff`;
- membuat form login React;
- memvalidasi email dan password melalui Laravel;
- membuat `DashboardController`;
- menggunakan middleware `auth` untuk melindungi route `/`.

Pada bab berikutnya, kita dapat mulai membuat migration dan model domain aplikasi, seperti `Teacher`, `Student`, `Subject`, `ClassRoom`, `TeachingAssignment`, dan `Attendance`. Model `Staff` sudah dibuat pada bab ini karena diperlukan oleh account awal `admin`.

