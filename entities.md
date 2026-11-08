# Entity Relationship Diagram — Prezence

ERD berikut menggambarkan entitas dan relasi utama aplikasi Prezence berdasarkan PRD dan SRS.

```mermaid
erDiagram
    USER {
        bigint id PK
        string email UK
        string password
        string role
        boolean is_active
        boolean must_change_password
        string profile_type
        bigint profile_id
        timestamp email_verified_at
        timestamp created_at
        timestamp updated_at
    }

    TEACHER {
        bigint id PK
        string name
        string mobile_phone UK
        timestamp created_at
        timestamp updated_at
    }

    STUDENT {
        bigint id PK
        bigint class_id FK
        string nis UK
        string name
        string gender
        date birth_date
        string birth_place
        timestamp created_at
        timestamp updated_at
    }

    STAFF {
        bigint id PK
        string name
        string position
        timestamp created_at
        timestamp updated_at
    }

    SUBJECT {
        bigint id PK
        string name UK
        timestamp created_at
        timestamp updated_at
    }

    CLASS_ROOM {
        bigint id PK
        string name UK
        string level
        timestamp created_at
        timestamp updated_at
    }

    TEACHING_ASSIGNMENT {
        bigint id PK
        bigint teacher_id FK
        bigint subject_id FK
        bigint class_id FK
        timestamp created_at
        timestamp updated_at
    }

    ATTENDANCE {
        bigint id PK
        bigint student_id FK
        bigint teaching_assignment_id FK
        date attendance_date
        string status
        text note
        timestamp created_at
        timestamp updated_at
    }

    USER ||--o| TEACHER : "profile (polymorphic)"
    USER ||--o| STUDENT : "profile (polymorphic)"
    USER ||--o| STAFF : "profile (polymorphic)"

    TEACHER ||--o{ TEACHING_ASSIGNMENT : has
    SUBJECT ||--o{ TEACHING_ASSIGNMENT : has
    CLASS_ROOM ||--o{ TEACHING_ASSIGNMENT : has

    CLASS_ROOM ||--o{ STUDENT : contains
    STUDENT ||--o{ ATTENDANCE : has
    TEACHING_ASSIGNMENT ||--o{ ATTENDANCE : records
```

## Catatan

- Satu `User` memiliki satu profile polymorphic: `Teacher`, `Student`, atau `Staff`.
- `profile_type` dan `profile_id` berada pada tabel `users` dan wajib diisi.
- `User` tidak memiliki field `name`. Nama disimpan pada tabel profile.
- `Staff` dapat memiliki role `admin` atau `report_viewer`.
- `report_viewer` dapat melihat laporan `Attendance` seluruh `Student`.
- Kombinasi `teacher_id`, `subject_id`, dan `class_id` pada `TeachingAssignment` harus unik.
- `class_id` pada `Student` dan `TeachingAssignment` merujuk ke tabel `class_rooms`.
- Pada versi awal, `TeachingAssignment` belum memiliki field jadwal.
- Satu `Student` dapat memiliki banyak `Attendance`.
- Satu `TeachingAssignment` dapat memiliki banyak `Attendance`.

## Status Attendance

Nilai internal `status` yang digunakan:

```text
present  → Hadir
excused  → Izin
sick     → Sakit
absent   → Alpa
```

## Aturan Attendance

Kombinasi berikut menjadi key pencarian Attendance:

```text
student_id + teaching_assignment_id + attendance_date
```

`Student` pada `Attendance` harus berasal dari `ClassRoom` yang sama dengan
`TeachingAssignment`. Jika kombinasi belum tersedia, record dibuat. Jika sudah
tersedia dan nilainya berubah, record diperbarui menggunakan `firstOrNew()` dan
`isDirty()`. Kombinasi tersebut
memiliki unique constraint pada database.
