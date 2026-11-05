# Contekan — CRUD `Subject`

File ini adalah referensi untuk latihan CRUD `Subject`. Cobalah membuatnya sendiri sebelum membaca contekan ini.

## Prasyarat

Model dan migration `Subject` sudah dibuat pada Bab 4:

```text
subjects
├── id
├── name
├── created_at
└── updated_at
```

`name` harus unik.

## Membuat Controller dan Form Request

```powershell
php artisan make:controller Admin/SubjectController --resource
php artisan make:request StoreSubjectRequest
php artisan make:request UpdateSubjectRequest
```

## Route

Tambahkan pada `routes/web.php`:

```php
use App\Http\Controllers\Admin\SubjectController;

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('subjects', SubjectController::class);
    });
```

Route yang tersedia:

```text
GET      /admin/subjects
GET      /admin/subjects/create
POST     /admin/subjects
GET      /admin/subjects/{subject}/edit
PUT      /admin/subjects/{subject}
DELETE   /admin/subjects/{subject}
```

## Form Request

`StoreSubjectRequest.php`:

```php
public function authorize(): bool
{
    return $this->user()?->role === 'admin';
}

public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255', 'unique:subjects,name'],
    ];
}
```

`UpdateSubjectRequest.php`:

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
            Rule::unique('subjects', 'name')->ignore($this->subject),
        ],
    ];
}
```

## Controller

`app/Http/Controllers/Admin/SubjectController.php`:

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Subject;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SubjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => Subject::query()->orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Subjects/Create');
    }

    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        Subject::create($request->validated());

        return to_route('admin.subjects.index')
            ->with('success', 'Subject berhasil dibuat.');
    }

    public function edit(Subject $subject): Response
    {
        return Inertia::render('Admin/Subjects/Edit', [
            'subject' => $subject,
        ]);
    }

    public function update(
        UpdateSubjectRequest $request,
        Subject $subject
    ): RedirectResponse {
        $subject->update($request->validated());

        return to_route('admin.subjects.index')
            ->with('success', 'Subject berhasil diperbarui.');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->delete();

        return to_route('admin.subjects.index')
            ->with('success', 'Subject berhasil dihapus.');
    }
}
```

## Struktur React Page

Buat folder:

```text
resources/js/pages/Admin/Subjects/
```

Page minimal:

```text
Index.tsx   daftar Subject dan tombol Create, Edit, Delete
Create.tsx  form menambah Subject
Edit.tsx    form mengubah Subject
```

Gunakan `useForm()` dari Inertia:

```tsx
const form = useForm({ name: subject?.name ?? '' });

const submit = (event: React.FormEvent) => {
    event.preventDefault();
    form.post(route('admin.subjects.store'));
};
```

Untuk edit, gunakan:

```tsx
form.put(route('admin.subjects.update', subject.id));
```

Untuk delete:

```tsx
router.delete(route('admin.subjects.destroy', subject.id));
```

Form harus menampilkan `form.errors.name` jika validasi server gagal.

## Checklist Pengujian

- User `admin` dapat membuka `/admin/subjects`;
- User selain `admin` ditolak oleh middleware atau authorization;
- Subject dapat ditambahkan;
- nama kosong ditolak;
- nama duplikat ditolak;
- Subject dapat diedit tanpa dianggap duplikat terhadap dirinya sendiri;
- Subject dapat dihapus jika belum digunakan oleh `TeachingAssignment`;
- pesan sukses ditampilkan setelah operasi berhasil.
