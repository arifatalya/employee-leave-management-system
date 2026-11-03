# EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS)

**Nama Peserta:** Aisyah Arifatul Alya

---

## 1. Deskripsi Project

Employee Leave Management System (ELMS) merupakan aplikasi berbasis web untuk mengelola data pegawai dan pengajuan cuti karyawan.

Sistem memiliki tiga jenis pengguna:
- **Admin:** Mengelola data pegawai dan melihat informasi sistem.
- **Staff:** Mengajukan cuti dan melihat riwayat pengajuan cuti pribadi.
- **Division Head:** Melihat, menyetujui, dan menolak pengajuan cuti Staff dalam divisinya.

## 2. Teknologi dan Library

### Backend
- Node.js
- Express.js
- MySQL
- mysql2
- JSON Web Token (JWT)
- Argon2
- express-rate-limit
- dotenv

### Frontend
- React
- Vite
- JavaScript
- CSS
- Fetch API

## 3. Struktur Project

### Backend

```text
tes-praktik-backend/
├── config/
│   └── db.js
├── controllers/
├── middleware/
├── routes/
├── services/
├── utils/
│   └── seed.js
├── app.js
├── index.js
├── package.json
└── .env.example
```

### Frontend

```text
tes-praktik-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx
│   │   └── modals/
│   │       ├── CreateLeaveModal.jsx
│   │       ├── LeaveDecisionModal.jsx
│   │       ├── EmployeeFormModal.jsx
│   │       └── Modal.css
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── Employees.jsx
│   │   ├── Employees.css
│   │   ├── Login.jsx
│   │   └── Login.css
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env
├── .env.example
└── package.json
```

## 4. Struktur Database

Database menggunakan MySQL dengan nama:

`employee_leave_ms`

Sistem memiliki empat tabel utama.

### 4.1 divisions

Menyimpan informasi divisi perusahaan.

| Kolom | Keterangan |
|---|---|
| id | Primary Key |
| code | Kode divisi, unique |
| name | Nama divisi, unique |
| status | ACTIVE / INACTIVE |
| created_at | Waktu pembuatan |
| updated_at | Waktu perubahan |

### 4.2 employees

Menyimpan informasi pegawai.

| Kolom | Keterangan |
|---|---|
| id | Primary Key |
| nip | Nomor Induk Pegawai, unique |
| nama | Nama pegawai |
| email | Email pegawai, unique |
| alamat | Alamat pegawai |
| division_id | Foreign Key ke divisions.id |
| status | ACTIVE / INACTIVE |
| created_at | Waktu pembuatan |
| updated_at | Waktu perubahan |

### 4.3 users

Menyimpan informasi akun pengguna dan autentikasi.

| Kolom | Keterangan |
|---|---|
| id | Primary Key |
| employee_id | Foreign Key ke employees.id, unique |
| password_hash | Password yang telah di-hash menggunakan Argon2id |
| role | ADMIN / STAFF / DIVISION_HEAD |
| created_at | Waktu pembuatan |
| updated_at | Waktu perubahan |

### 4.4 leave_requests

Menyimpan informasi pengajuan cuti pegawai.

| Kolom | Keterangan |
|---|---|
| id | Primary Key |
| employee_id | Foreign Key ke employees.id |
| start_date | Tanggal mulai cuti |
| end_date | Tanggal selesai cuti |
| reason | Alasan pengajuan cuti |
| total_days | Total hari kerja cuti |
| status | PENDING / APPROVED / REJECTED |
| approved_by | Foreign Key ke users.id |
| approved_at | Waktu persetujuan |
| created_at | Waktu pengajuan |
| updated_at | Waktu perubahan |

### 4.5 Relasi Antar Tabel

- `divisions` memiliki relasi one-to-many dengan `employees`.
- `employees` memiliki relasi one-to-one dengan `users`.
- `employees` memiliki relasi one-to-many dengan `leave_requests`.
- `users` memiliki relasi one-to-many dengan `leave_requests` melalui kolom `approved_by`.

**Gambaran relasi:**

```text
divisions
    |
    | 1:N
    |
employees
    |
    | 1:1
    |
users

employees
    |
    | 1:N
    |
leave_requests
    |
    | N:1 (approved_by)
    |
users
```

## 5. Instalasi dan Konfigurasi

### 5.1 Prasyarat

Pastikan perangkat telah memiliki:
- Node.js
- npm
- MySQL Server
- Git (opsional)

### 5.2 Persiapan Database

1. Jalankan MySQL Server.
2. Buat database bernama `employee_leave_ms`.
3. Jalankan file SQL schema untuk membuat tabel.
4. Jalankan konfigurasi seed untuk membuat data awal dan akun pengujian.

### 5.3 Instalasi Backend

Masuk ke direktori backend:

```bash
cd tes-praktik-backend
```

Install dependency:

```bash
npm install
```

Buat file `.env` berdasarkan `.env.example` dan sesuaikan konfigurasi database serta autentikasi.

Jalankan seed:

```bash
npm run seed
```

Jalankan backend:

```bash
npm start
```

Backend berjalan pada:

```text
http://localhost:5050
```

### 5.4 Instalasi Frontend

Masuk ke direktori frontend:

```bash
cd tes-praktik-frontend
```

Install dependency:

```bash
npm install
```

Buat file `.env`:

```env
VITE_API_URL=http://localhost:5050/api/v1
```

Jalankan frontend:

```bash
npm run dev
```

Frontend dapat diakses melalui:

```text
http://localhost:5173
```

## 6. Konfigurasi Environment

### Backend

Buat file `.env` pada direktori backend.

Contoh konfigurasi:

```env
PORT=5050

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=200205
DB_NAME=employee_leave_ms

JWT_PRIVATE_KEY=./keys/private.pem
JWT_PUBLIC_KEY=./keys/public.pem
JWT_ISSUER=employee-leave-api
JWT_AUDIENCE=employee-leave-services
JWT_EXPIRES_IN=1h

SEED_PASSWORD=heardtheirname
```

Sesuaikan nama variabel JWT dan database dengan implementasi konfigurasi backend yang digunakan.

Kunci RSA digunakan untuk proses signing dan verification JWT menggunakan algoritma RS256.

### Frontend

Buat file `.env` pada direktori frontend:

```env
VITE_API_URL=http://localhost:5050/api/v1
```

**Catatan:** File `.env` tidak disertakan dalam pengumpulan. Gunakan `.env.example` sebagai template konfigurasi.

## 7. Fitur Aplikasi

### 7.1 Login
- Autentikasi menggunakan email dan password.
- Password disimpan menggunakan Argon2id.
- Menggunakan JWT dengan algoritma RS256.
- Pembatasan percobaan login menggunakan rate limiting.

### 7.2 Dashboard
- Menampilkan ringkasan data pegawai sesuai role.
- Menampilkan statistik pengajuan cuti.
- Menampilkan riwayat pengajuan cuti.
- Menyediakan akses cepat sesuai role pengguna.

### 7.3 Data Pegawai (Admin)
- Menampilkan daftar pegawai.
- Pencarian berdasarkan NIP, nama, dan email.
- Filter berdasarkan status dan divisi.
- Menambah, mengubah, dan menghapus data pegawai.

### 7.4 Pengajuan Cuti (Staff)
- Mengajukan cuti melalui form.
- Melihat riwayat pengajuan cuti.
- Melihat status pengajuan: PENDING, APPROVED, dan REJECTED.

### 7.5 Approval Cuti (Division Head)
- Melihat pengajuan cuti Staff dalam divisinya.
- Menyetujui atau menolak pengajuan cuti.
- Melihat status pengajuan yang telah diproses.

## 8. Hak Akses Pengguna

| Fitur | Admin | Staff | Division Head |
|---|:---:|:---:|:---:|
| Login | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ |
| Data Pegawai | ✓ | - | - |
| Tambah/Edit Pegawai | ✓ | - | - |
| Pengajuan Cuti | - | ✓ | - |
| Riwayat Cuti Pribadi | - | ✓ | - |
| Approval Cuti | - | - | ✓ |
| Melihat Pengajuan Divisi | - | - | ✓ |

Setiap endpoint yang memerlukan autentikasi dilindungi melalui middleware autentikasi dan otorisasi pada backend.

Division Head hanya dapat memproses pengajuan Staff dari divisinya sendiri.

## 9. Akun Pengujian

Seluruh akun berikut menggunakan password pengujian yang sama:

```text
Password: heardtheirname
```

| Role | Nama | Email |
|---|---|---|
| ADMIN | Chihiro Mayuzumi | cmayuzumi@company-name.com |
| DIVISION_HEAD | Seijuro Akashi | sakashi@company-name.com |
| STAFF | Tatsuya Himuro | thimuro@company-name.com |
| STAFF | Atsushi Murasakibara | amurasakibara@company-name.com |
| DIVISION_HEAD | Kiyoshi Miyaji | kmiyaji@company-name.com |
| STAFF | Kazunari Takao | ktakao@company-name.com |
| STAFF | Shintaro Midorima | smidorima@company-name.com |
| DIVISION_HEAD | Shoichi Imayoshi | simayoshi@company-name.com |

Password tersebut merupakan kredensial khusus untuk pengujian lokal.

---