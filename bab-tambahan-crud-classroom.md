# Contekan — CRUD `ClassRoom`

File ini adalah referensi untuk latihan CRUD `ClassRoom`. Cobalah membuatnya sendiri sebelum membaca contekan ini.

## Prasyarat

Model dan migration `ClassRoom` sudah dibuat pada Bab 4. Tabel yang digunakan adalah `class_rooms`:

```text
class_rooms
├── id
├── name
├── level
├── created_at
└── updated_at
```

`name` harus unik. Nilai `level` yang diizinkan adalah `X`, `XI`, atau `XII`.

## Membuat Controller dan Form Request

```powershell
php artisan make:controller Admin/ClassRoomController --resource
php artisan make:request StoreClassRoomRequest
php artisan make:request UpdateClassRoomRequest
```

## Route

Tambahkan pada `routes/web.php`:

```php
use App\Http\Controllers\Admin\ClassRoomController;

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('class-rooms', ClassRoomController::class);
    });
```

Route yang tersedia:

```text
GET      /admin/class-rooms
GET      /admin/class-rooms/create
POST     /admin/class-rooms
GET      /admin/class-rooms/{class_room}/edit
PUT      /admin/class-rooms/{class_room}
DELETE   /admin/class-rooms/{class_room}
```

## Form Request

`StoreClassRoomRequest.php`:

```php
public function authorize(): bool
{
    return $this->user()?->role === 'admin';
}

public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255', 'unique:class_rooms,name'],
        'level' => ['required', 'string', 'in:X,XI,XII'],
    ];
}
```

`UpdateClassRoomRequest.php`:

```php
use Illuminate\Validation\Rule;

public function authorize(): bool
{
    return $this->user()?->role === 'admin';
}

public function rules(): array
{
    return [
        'name' => [
            'required',
            'string',
            'max:255',
            Rule::unique('class_rooms', 'name')->ignore($this->route('class_room')),
        ],
        'level' => ['required', 'string', 'in:X,XI,XII'],
    ];
}
```

## Controller

`app/Http/Controllers/Admin/ClassRoomController.php`:

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClassRoomRequest;
use App\Http\Requests\UpdateClassRoomRequest;
use App\Models\ClassRoom;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ClassRoomController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ClassRooms/Index', [
            'classRooms' => ClassRoom::query()->orderBy('level')->orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/ClassRooms/Create');
    }

    public function store(StoreClassRoomRequest $request): RedirectResponse
    {
        ClassRoom::create($request->validated());

        return to_route('admin.class-rooms.index')
            ->with('success', 'ClassRoom berhasil dibuat.');
    }

    public function edit(ClassRoom $classRoom): Response
    {
        return Inertia::render('Admin/ClassRooms/Edit', [
            'classRoom' => $classRoom,
        ]);
    }

    public function update(
        UpdateClassRoomRequest $request,
        ClassRoom $classRoom
    ): RedirectResponse {
        $classRoom->update($request->validated());

        return to_route('admin.class-rooms.index')
            ->with('success', 'ClassRoom berhasil diperbarui.');
    }

    public function destroy(ClassRoom $classRoom): RedirectResponse
    {
        $classRoom->delete();

        return to_route('admin.class-rooms.index')
            ->with('success', 'ClassRoom berhasil dihapus.');
    }
}
```

## Struktur React Page

Buat folder:

```text
resources/js/pages/Admin/ClassRooms/
```

Page minimal:

```text
Index.tsx   daftar ClassRoom dan tombol Create, Edit, Delete
Create.tsx  form menambah ClassRoom
Edit.tsx    form mengubah ClassRoom
```

Gunakan pilihan `Select` atau `TextField` dengan nilai `X`, `XI`, dan `XII`:

```tsx
const form = useForm({
    name: classRoom?.name ?? '',
    level: classRoom?.level ?? 'X',
});

const submit = (event: React.FormEvent) => {
    event.preventDefault();
    form.post(route('admin.class-rooms.store'));
};
```

Untuk edit:

```tsx
form.put(route('admin.class-rooms.update', classRoom.id));
```

Untuk delete:

```tsx
router.delete(route('admin.class-rooms.destroy', classRoom.id));
```

Form harus menampilkan `form.errors.name` dan `form.errors.level` jika validasi server gagal.

## Catatan Penghapusan

`ClassRoom` dapat digunakan oleh `Student` dan `TeachingAssignment`. Karena itu, penghapusan dapat gagal jika database menggunakan foreign key dengan `restrictOnDelete()`.

Pada implementasi production, sebaiknya tampilkan pesan yang jelas kepada Admin jika ClassRoom masih digunakan.

## Checklist Pengujian

- User `admin` dapat membuka `/admin/class-rooms`;
- User selain `admin` ditolak;
- ClassRoom dapat ditambahkan;
- `name` kosong ditolak;
- `name` duplikat ditolak;
- `level` selain `X`, `XI`, dan `XII` ditolak;
- ClassRoom dapat diedit tanpa dianggap duplikat terhadap dirinya sendiri;
- ClassRoom yang masih digunakan tidak dapat dihapus sembarangan;
- pesan sukses dan error ditampilkan dengan jelas.
