# Bab Tambahan — MUI Styling dan Theme

Bab ini membahas cara mengatur tampilan Material UI (MUI) menggunakan `Theme`.
Contoh yang digunakan adalah mengubah warna header tabel secara terpusat tanpa
mengubah palette default MUI.

Bab ini bersifat tambahan. Ikuti bab utama terlebih dahulu agar project React,
Inertia, TypeScript, MUI, dan Day.js sudah tersedia.

## Tujuan Pembelajaran

Setelah menyelesaikan bab ini, siswa diharapkan mampu:

- memahami fungsi `Theme` pada MUI;
- memisahkan konfigurasi theme dari `app.tsx`;
- membuat custom palette menggunakan TypeScript;
- memberi styling default pada komponen MUI;
- memasang `ThemeProvider` dan `LocalizationProvider` pada aplikasi.

## Mengapa Theme Dipisahkan dari `app.tsx`?

`app.tsx` adalah entry point aplikasi. File tersebut sebaiknya berisi proses
inisialisasi aplikasi dan provider utama, bukan seluruh konfigurasi tampilan.

Dengan memindahkan theme ke file tersendiri:

- konfigurasi warna dan komponen menjadi lebih mudah ditemukan;
- `app.tsx` tetap ringkas;
- perubahan tampilan dapat dilakukan tanpa mencampuradukkan kode inisialisasi;
- theme dapat digunakan kembali oleh berbagai halaman dan komponen.

Struktur file yang digunakan:

```text
resources/js/
├── app.tsx
└── mui-style.ts
```

## Membuat File `mui-style.ts`

Buat file berikut pada project Laravel:

```text
resources/js/mui-style.ts
```

Salin contoh berikut ke dalam file tersebut. Contoh ini tersedia pada file
[mui-style.ts](mui-style.ts) di repository tutorial.

```tsx
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        tableHeader: Palette['primary'];
    }

    interface PaletteOptions {
        tableHeader?: PaletteOptions['primary'];
    }
}

const muiTheme = createTheme({
    palette: {
        tableHeader: {
            main: '#1976d2',
            contrastText: '#ffffff',
        },
    },
    components: {
        MuiTableHead: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.tableHeader.main,
                    '& .MuiTableCell-root': {
                        color: theme.palette.tableHeader.contrastText,
                        fontWeight: 600,
                    },
                }),
            },
        },
    },
});

export default muiTheme;
```

Walaupun isinya hanya konfigurasi object, file tetap menggunakan ekstensi
`.ts` karena berisi TypeScript, bukan komponen JSX.

## Memahami `createTheme`

`createTheme()` membuat object theme yang akan dibaca oleh komponen MUI.
Theme dapat berisi konfigurasi seperti:

- `palette` untuk warna aplikasi;
- `typography` untuk aturan tipografi;
- `spacing` untuk jarak;
- `components` untuk default props dan styling komponen MUI.

Pada contoh ini, palette default MUI tetap tersedia. Kita hanya menambahkan
palette baru bernama `tableHeader`:

```ts
tableHeader: {
    main: '#1976d2',
    contrastText: '#ffffff',
},
```

`main` digunakan sebagai warna utama header tabel, sedangkan `contrastText`
digunakan untuk teks yang diletakkan di atas warna tersebut.

## Mengapa Ada `declare module`?

MUI sudah mengenal palette seperti `primary`, `secondary`, dan `error`.
TypeScript belum mengetahui palette tambahan bernama `tableHeader`. Karena itu,
kita memperluas deklarasi type MUI menggunakan module augmentation:

```ts
declare module '@mui/material/styles' {
    interface Palette {
        tableHeader: Palette['primary'];
    }

    interface PaletteOptions {
        tableHeader?: PaletteOptions['primary'];
    }
}
```

Setelah deklarasi tersebut, kode berikut dapat diperiksa oleh TypeScript:

```ts
theme.palette.tableHeader.main
```

Tanpa module augmentation, editor atau pemeriksa TypeScript dapat melaporkan
bahwa `tableHeader` bukan property yang dikenal pada `Palette`.

## Memberi Styling pada `TableHead`

Bagian berikut menetapkan styling untuk semua komponen `TableHead` yang berada
di bawah `ThemeProvider`:

```ts
components: {
    MuiTableHead: {
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: theme.palette.tableHeader.main,
                '& .MuiTableCell-root': {
                    color: theme.palette.tableHeader.contrastText,
                    fontWeight: 600,
                },
            }),
        },
    },
},
```

`root` adalah elemen utama `TableHead`. Selector `& .MuiTableCell-root`
digunakan agar warna dan ketebalan teks diterapkan pada cell header di dalam
table tersebut.

Perubahan ini berlaku terpusat untuk tabel MUI. Tampilan halaman Teacher,
Student, dan Staff tidak perlu diberi aturan warna yang sama berulang kali.

## Memasang Theme pada `app.tsx`

Tambahkan import berikut pada `resources/js/app.tsx`:

```tsx
import { ThemeProvider } from '@mui/material/styles';
import muiTheme from './mui-style';
```

Kemudian gunakan `ThemeProvider` pada bagian provider aplikasi. Contoh berikut
mempertahankan `LocalizationProvider` yang digunakan oleh komponen tanggal dari
`@mui/x-date-pickers`:

```tsx
<LocalizationProvider dateAdapter={AdapterDayjs}>
    <ThemeProvider theme={muiTheme}>
        <App {...props} />
    </ThemeProvider>
</LocalizationProvider>
```

Jika aplikasi sudah memiliki provider lain, pertahankan provider tersebut dan
tempatkan `ThemeProvider` sehingga semua halaman yang membutuhkan MUI berada di
dalamnya.

`LocalizationProvider` memiliki tugas yang berbeda dari `ThemeProvider`.
`ThemeProvider` menyediakan konfigurasi tampilan, sedangkan
`LocalizationProvider` menyediakan konteks tanggal, adapter, dan aturan
lokalisasi untuk komponen seperti `DatePicker`.

## Theme, `sx`, dan CSS Class

Ketiganya dapat digunakan untuk styling, tetapi cakupannya berbeda.

### Theme

Gunakan theme untuk aturan tampilan yang menjadi standar banyak halaman atau
komponen. Contohnya, semua `TableHead` memakai warna header yang sama.

### `sx`

Gunakan `sx` untuk kebutuhan lokal pada satu komponen:

```tsx
<Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
    Konten
</Box>
```

### CSS Class

CSS class cocok untuk aturan yang lebih kompleks atau ketika style perlu
digunakan oleh banyak elemen di luar konfigurasi MUI. Untuk kebutuhan umum pada
komponen MUI, `sx` dan theme biasanya sudah memadai.

## Menguji Perubahan

Jalankan development server:

```powershell
npm run dev
```

Buka halaman yang memiliki tabel MUI. Header tabel seharusnya menggunakan warna
biru dari `tableHeader`, sedangkan teksnya berwarna putih.

Jika project memiliki script pemeriksaan TypeScript, jalankan juga:

```powershell
npm run types:check
```

Kemudian buat production build:

```powershell
npm run build
```

Nama script dapat berbeda antar project. Gunakan script yang tersedia pada
bagian `scripts` di `package.json` jika `types:check` belum didefinisikan.

## Ringkasan

- Konfigurasi theme dapat dipisahkan dari `app.tsx` ke `mui-style.ts`.
- `createTheme()` digunakan untuk membuat konfigurasi theme MUI.
- Custom palette memerlukan module augmentation agar dikenali TypeScript.
- `MuiTableHead` dapat diberi styling terpusat melalui `components` dan
  `styleOverrides`.
- `ThemeProvider` memasang theme untuk seluruh komponen di bawahnya.
- `LocalizationProvider` tetap diperlukan untuk komponen tanggal dan memiliki
  fungsi berbeda dari `ThemeProvider`.
- Gunakan theme untuk aturan global, `sx` untuk kebutuhan lokal, dan CSS class
  untuk aturan CSS yang lebih khusus.
