# 📘 BAB 13 — PROFILE DAN PASSWORD USER

Pada bab ini kita membuat halaman `Profile` yang dapat digunakan oleh semua
Role. Data User dan profile diambil melalui polymorphic relation:

```text
User
  └── profile
        ├── Teacher
        ├── Student
        └── Staff
```

Satu controller dan satu page React dapat menampilkan data berbeda sesuai tipe
profile User yang sedang login.

## 13.1 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, siswa diharapkan mampu:

- membuat route yang dilindungi middleware `auth`;
- mengambil profile melalui relasi `User::profile`;
- membuat controller yang menangani beberapa tipe profile;
- membuat page React dinamis berdasarkan tipe profile;
- memisahkan data account dan data profile;
- membuat form update profile;
- membuat form perubahan password;
- menggunakan validasi `current_password`, `confirmed`, dan `Password::defaults()`;
- memperbarui `must_change_password` setelah password berhasil diubah.

## 13.2 Menambahkan Menu `Profile`

Tambahkan menu `Profile` pada `resources/js/layouts/MainLayout.tsx`. Menu hanya
ditampilkan jika User sudah login:

```tsx
{user && (
    <Box sx={{ width: '100px' }}>
        <Button
            size="small"
            fullWidth
            color="inherit"
            onClick={() => router.visit('/profile')}
        >
            Profile
        </Button>
    </Box>
)}
```

Menu ini berada di luar menu khusus `admin` atau `teacher` karena semua Role
dapat mengakses halaman Profile.

## 13.3 Membuat Route

Buat route di dalam group middleware `auth` pada `routes/web.php`:

```php
use App\Http\Controllers\ProfileController;

Route::get('/profile', [ProfileController::class, 'show'])
    ->name('profile.show');

Route::put('/profile', [ProfileController::class, 'update'])
    ->name('profile.update');

Route::put('/profile/password', [ProfileController::class, 'updatePassword'])
    ->name('profile.password.update');
```

Tidak ada parameter `{user}` atau `{profile}` pada URL. Controller selalu
menggunakan User yang sedang login.

## 13.4 Membuat `ProfileController`

Buat controller dengan perintah:

```bash
php artisan make:controller ProfileController
```

Import model dan class yang diperlukan:

```php
use App\Models\Staff;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
```

## 13.5 Mengambil Profile melalui Relasi Morph

Pada method `show`, ambil User beserta profile-nya:

```php
$user = $request->user()->load('profile');
$profile = $user->profile;

abort_unless(
    $profile instanceof Teacher
        || $profile instanceof Student
        || $profile instanceof Staff,
    404,
);

if ($profile instanceof Student) {
    $profile->load('classRoom');
}
```

`Student` membutuhkan relasi tambahan `classRoom` karena halaman Profile juga
menampilkan kelasnya.

## 13.6 Menyiapkan Data untuk Inertia

Controller mengirim dua kelompok data: `account` dan `profile`.

```php
return Inertia::render('Profile/Index', [
    'account' => [
        'email' => $user->email,
        'role' => $user->role,
        'must_change_password' => $user->must_change_password,
    ],
    'profile' => $this->profileData($profile),
]);
```

`profileData()` mengubah object model menjadi array yang sesuai dengan tipe
profile:

```php
private function profileData(Teacher|Student|Staff $profile): array
{
    $data = [
        'id' => $profile->id,
        'type' => match (true) {
            $profile instanceof Teacher => 'teacher',
            $profile instanceof Student => 'student',
            default => 'staff',
        },
        'name' => $profile->name,
    ];

    if ($profile instanceof Teacher) {
        $data['mobile_phone'] = $profile->mobile_phone;
    }

    if ($profile instanceof Student) {
        $data['nis'] = $profile->nis;
        $data['gender'] = $profile->gender;
        $data['birth_date'] = $profile->birth_date?->format('Y-m-d');
        $data['birth_place'] = $profile->birth_place;
        $data['class_room'] = $profile->classRoom ? [
            'name' => $profile->classRoom->name,
            'level' => $profile->classRoom->level,
        ] : null;
    }

    if ($profile instanceof Staff) {
        $data['position'] = $profile->position;
    }

    return $data;
}
```

| Profile | Field tambahan |
|---|---|
| `Teacher` | `mobile_phone` |
| `Student` | `nis`, `gender`, `birth_date`, `birth_place`, `class_room` |
| `Staff` | `position` |

Email dan Role dikirim sebagai bagian `account`, bukan sebagai field profile.

## 13.7 Membuat Page React

Buat file:

```text
resources/js/pages/Profile/Index.tsx
```

Definisikan tipe data:

```tsx
type Profile = {
    id: number;
    type: 'teacher' | 'student' | 'staff';
    name: string;
    mobile_phone?: string;
    nis?: string;
    gender?: string;
    birth_date?: string | null;
    birth_place?: string;
    position?: string;
    class_room?: { name: string; level: string } | null;
};

type Props = {
    account: {
        email: string;
        role: string;
        must_change_password: boolean;
    };
    profile: Profile;
};
```

Gunakan dua `useForm()` yang terpisah:

```tsx
const profileForm = useForm({
    name: profile.name,
    mobile_phone: profile.mobile_phone ?? '',
    gender: profile.gender ?? '',
    birth_date: profile.birth_date ?? '',
    birth_place: profile.birth_place ?? '',
    position: profile.position ?? '',
});

const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
});
```

Form dipisahkan karena endpoint profile dan endpoint password memiliki tujuan
dan validasi yang berbeda.

## 13.8 Menampilkan Account Information

Email dan Role ditampilkan pada panel tersendiri:

```tsx
<Paper sx={{ p: 3 }}>
    <Typography variant="h6">Account Information</Typography>
    <Typography>Email: {account.email}</Typography>
    <Typography>Role: {account.role}</Typography>
</Paper>
```

Email dan Role tidak diedit pada halaman ini. Perubahan email merupakan bagian
dari account management dan dapat dijadikan latihan mandiri.

## 13.9 Menampilkan Field Berdasarkan Tipe Profile

Gunakan conditional rendering berdasarkan `profile.type`.

Untuk `Teacher`, tampilkan `name` dan `mobile_phone`. Untuk `Staff`, tampilkan
`name` dan `position`.

Untuk `Student`, tampilkan data berikut:

- `name`;
- `NIS` sebagai field disabled;
- `gender` menggunakan MUI `Select`;
- `birth_date` menggunakan `DatePicker`;
- `birth_place`;
- `ClassRoom` sebagai field disabled.

Contoh field Student yang tidak dapat diedit:

```tsx
<TextField
    label="NIS"
    value={profile.nis ?? ''}
    size="small"
    disabled
/>

<TextField
    label="ClassRoom"
    value={profile.class_room
        ? `${profile.class_room.level} ${profile.class_room.name}`
        : '-'}
    size="small"
    disabled
/>
```

Tanggal lahir menggunakan `DatePicker` dari `@mui/x-date-pickers`:

```tsx
<DatePicker
    label="Birth Date"
    format="YYYY-MM-DD"
    value={profileForm.data.birth_date
        ? dayjs(profileForm.data.birth_date)
        : null}
    onChange={(date) =>
        profileForm.setData(
            'birth_date',
            date?.format('YYYY-MM-DD') ?? '',
        )
    }
    slotProps={{ textField: { size: 'small' } }}
/>
```

## 13.10 Menyimpan Perubahan Profile

Submit form profile menggunakan method `PUT`:

```tsx
function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    profileForm.put('/profile');
}
```

Controller memvalidasi field berdasarkan tipe profile:

```php
if ($profile instanceof Teacher) {
    $profile->update($request->validate([
        'name' => ['required', 'string', 'max:255'],
        'mobile_phone' => [
            'required',
            'string',
            'unique:teachers,mobile_phone,'.$profile->id,
        ],
    ]));
} elseif ($profile instanceof Student) {
    $profile->update($request->validate([
        'name' => ['required', 'string', 'max:255'],
        'gender' => ['required', 'string'],
        'birth_date' => ['required', 'date', 'before:today'],
        'birth_place' => ['required', 'string', 'max:100'],
    ]));
} elseif ($profile instanceof Staff) {
    $profile->update($request->validate([
        'name' => ['required', 'string', 'max:255'],
        'position' => ['required', 'string', 'max:50'],
    ]));
}
```

`NIS` dan `class_id` Student tidak dikirim dalam data update. Student tidak
dapat mengubah identitas NIS atau kelas melalui halaman Profile.

Setelah berhasil, controller mengarahkan kembali ke halaman Profile:

```php
return to_route('profile.show')
    ->with('success', 'Profile berhasil diperbarui.');
```

## 13.11 Mengubah Password

Form password memiliki tiga field:

- `current_password`;
- `password`;
- `password_confirmation`.

```tsx
function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    passwordForm.put('/profile/password');
}
```

Validasi dilakukan di server:

```php
$data = $request->validate([
    'current_password' => ['required', 'current_password'],
    'password' => ['required', 'confirmed', Password::defaults()],
]);

$request->user()->update([
    'password' => $data['password'],
    'must_change_password' => false,
]);
```

`current_password` memeriksa password lama. Rule `confirmed` membutuhkan field
`password_confirmation` yang sama dengan password baru. Setelah berhasil,
`must_change_password` diubah menjadi `false`.

## 13.12 Pesan Validasi dan Flash Message

Error validasi dapat ditampilkan pada MUI `TextField`:

```tsx
<TextField
    error={Boolean(profileForm.errors.name)}
    helperText={profileForm.errors.name}
/>
```

Flash message dibaca dari props Inertia:

```tsx
const { flash } = usePage<PageProps>().props;

{flash?.success && (
    <Alert severity="success">{flash.success}</Alert>
)}
```

Pola yang sama digunakan oleh `passwordForm.errors` untuk menampilkan error
perubahan password.

## 13.13 Pengujian

Uji halaman Profile dengan account yang memiliki profile berbeda:

1. Login sebagai `Teacher`, buka menu `Profile`, lalu ubah nama dan
   `mobile_phone`.
2. Login sebagai `Student`, periksa field `NIS` dan `ClassRoom` yang disabled,
   lalu ubah data profile yang diizinkan.
3. Login sebagai `Staff`, lalu ubah nama dan `position`.
4. Masukkan current password yang salah dan periksa pesan validasinya.
5. Masukkan password baru dengan konfirmasi yang berbeda.
6. Ubah password dengan data yang valid, lalu login kembali menggunakan password
   baru.
7. Pastikan `must_change_password` menjadi `false`.
8. Pastikan route `/profile` selalu menampilkan profile User yang sedang login.

## 13.14 Latihan Mandiri

Fitur berikut dapat dikembangkan sebagai latihan:

- mengubah email account dengan validasi unique;
- menampilkan status account aktif atau nonaktif;
- membuat reset temporary password oleh Admin;
- mengirim ulang credential melalui email;
- membuat redirect khusus jika `must_change_password` masih `true`;
- membuat dashboard khusus `Student`;
- membuat dashboard dan report untuk Role `report_viewer`.

## 13.15 Ringkasan Bab Ini

Pada bab ini kita telah:

- menambahkan menu `Profile` untuk User yang login;
- membuat route profile dan password;
- menggunakan polymorphic relation untuk membaca profile;
- menampilkan `Teacher`, `Student`, dan `Staff` melalui page yang sama;
- memisahkan Account Information dari Profile Information;
- membuat update profile berdasarkan tipe profile;
- membuat perubahan password dengan validasi password lama dan konfirmasi;
- memperbarui `must_change_password` setelah password berhasil diubah.
