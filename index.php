<?php
session_start();

// Inisialisasi array data jika belum ada di session
if (!isset($_SESSION['list_pendaftar'])) {
    $_SESSION['list_pendaftar'] = [];
}

// Proses Simpan Data
if (isset($_POST['simpan'])) {
    $nama = $_POST['nama'];
    $kode = $_POST['kode'];
    $jk = $_POST['jk'];
    $pekerjaan = $_POST['pekerjaan'];
    $mat = (float)$_POST['mat'];
    $ingg = (float)$_POST['ingg'];
    $umum = (float)$_POST['umum'];

    // LOGIKA 1: Penentuan Tempat Tes berdasarkan Karakter Pertama Kode
    $charAwal = strtoupper(substr($kode, 0, 1));
    $lokasi = "Gedung A"; // Default
    if ($charAwal === 'B') $lokasi = "Gedung B";
    if ($charAwal === 'V') $lokasi = "Viktor";

    // LOGIKA 2: Perhitungan Rata-rata
    $rata = ($mat + $ingg + $umum) / 3;

    // LOGIKA 3: Status Kelulusan (Min 70 Lulus, 60-70 Cadangan, <60 Gagal)
    $status = "Tidak Lulus";
    if ($rata >= 70) $status = "Lulus";
    else if ($rata >= 60) $status = "Cadangan";

    // Masukkan ke array session
    $_SESSION['list_pendaftar'][] = [
        'nama' => $nama,
        'kode' => $kode,
        'jk' => $jk,
        'pekerjaan' => $pekerjaan,
        'lokasi' => $lokasi,
        'rata' => number_format($rata, 1),
        'status' => $status
    ];
}

// Reset Data (Optional buat testing)
if (isset($_GET['reset'])) {
    session_destroy();
    header("Location: index.php");
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UTS Pemrograman Web II - Native PHP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f9f9fc; }
    </style>
</head>
<body class="flex min-h-screen">

    <aside class="w-64 bg-white border-r border-[#c3c6d1] hidden lg:flex flex-col fixed h-full">
        <div class="p-6 flex items-center gap-3">
            <div class="bg-[#003366] p-2 rounded text-white text-2xl font-bold">UNPAM</div>
            <div>
                <h1 class="font-bold text-[#001e40] text-sm">Portal PMB</h1>
                <p class="text-[9px] text-gray-500 uppercase">Teknik Informatika</p>
            </div>
        </div>
        <nav class="flex-1 px-4 space-y-2 mt-4">
            <div class="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">
                <span class="material-symbols-outlined">dashboard</span> <span class="text-sm font-semibold">Dashboard</span>
            </div>
            <div class="flex items-center gap-3 px-4 py-3 bg-[#fed65b] text-[#745c00] rounded-lg shadow-sm">
                <span class="material-symbols-outlined">assignment_ind</span> <span class="text-sm font-semibold">Pendaftaran</span>
            </div>
        </nav>
        <div class="p-6 border-t border-[#c3c6d1]">
            <a href="?reset=1" class="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold">
                <span class="material-symbols-outlined">delete</span> Reset Data
            </a>
        </div>
    </aside>

    <main class="flex-1 lg:ml-64 p-8">
        <div class="max-w-5xl mx-auto">
            <header class="mb-10">
                <h2 class="text-2xl font-bold text-[#001e40]">Formulir Pendaftaran Mahasiswa Baru</h2>
                [cite_start]<p class="text-gray-500 text-sm">Gunakan Kode A, B, atau V untuk menentukan lokasi tes otomatis[cite: 5].</p>
            </header>

            <div class="grid lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1 bg-white border border-[#c3c6d1] rounded-xl p-6 shadow-sm h-fit">
                    <form method="POST" class="space-y-4">
                        <div>
                            <label class="text-[10px] font-bold text-gray-400 uppercase">Nama Pendaftar</label>
                            <input type="text" name="nama" required class="w-full border border-[#c3c6d1] p-2 rounded-lg text-sm outline-[#003366]">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-gray-400 uppercase">Kode Pendaftaran</label>
                            <input type="text" name="kode" required placeholder="Contoh: V101" class="w-full border border-[#c3c6d1] p-2 rounded-lg text-sm outline-[#003366]">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[10px] font-bold text-gray-400 uppercase">Jenis Kelamin</label>
                                <select name="jk" class="w-full border border-[#c3c6d1] p-2 rounded-lg text-sm">
                                    <option>Laki-laki</option>
                                    <option>Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-gray-400 uppercase">Pekerjaan Ortu</label>
                                <select name="pekerjaan" class="w-full border border-[#c3c6d1] p-2 rounded-lg text-sm">
                                    <option>Wiraswasta</option>
                                    <option>PNS</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-2 pt-2">
                            <input type="number" name="mat" placeholder="MAT" required class="border border-[#c3c6d1] p-2 rounded-lg text-center text-sm">
                            <input type="number" name="ingg" placeholder="ING" required class="border border-[#c3c6d1] p-2 rounded-lg text-center text-sm">
                            <input type="number" name="umum" placeholder="UMUM" required class="border border-[#c3c6d1] p-2 rounded-lg text-center text-sm">
                        </div>
                        <button type="submit" name="simpan" class="w-full bg-[#001e40] text-white font-bold py-3 rounded-lg mt-4 hover:bg-[#003366] transition-all shadow-md">
                            SIMPAN DATA
                        </button>
                    </form>
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-white border border-[#c3c6d1] rounded-xl shadow-sm overflow-hidden">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-[#f3f3f6] border-b text-[#001e40] font-bold">
                                <tr>
                                    <th class="p-4">KODE</th>
                                    <th class="p-4">NAMA</th>
                                    <th class="p-4">LOKASI TES</th>
                                    <th class="p-4 text-center">AVG</th>
                                    <th class="p-4 text-center">STATUS</th>
                                </tr>
                            </thead>
                            <tbody class="text-gray-700">
                                <?php if (empty($_SESSION['list_pendaftar'])): ?>
                                    <tr><td colspan="5" class="p-8 text-center text-gray-400">Belum ada pendaftar.</td></tr>
                                <?php else: ?>
                                    <?php foreach (array_reverse($_SESSION['list_pendaftar']) as $p): ?>
                                        <tr class="border-b hover:bg-gray-50">
                                            <td class="p-4 font-mono"><?= $p['kode'] ?></td>
                                            <td class="p-4 font-bold"><?= $p['nama'] ?></td>
                                            <td class="p-4 text-xs"><?= $p['lokasi'] ?></td>
                                            <td class="p-4 text-center font-bold"><?= $p['rata'] ?></td>
                                            <td class="p-4 text-center">
                                                <?php 
                                                $color = $p['status'] == 'Lulus' ? 'bg-green-100 text-green-700 border-green-200' : ($p['status'] == 'Cadangan' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200');
                                                ?>
                                                <span class="px-3 py-1 rounded-full text-[10px] font-bold border <?= $color ?>"><?= $p['status'] ?></span>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                        
                        <div class="p-4 bg-[#f3f3f6] flex justify-between text-[11px] font-bold text-gray-500 uppercase">
                            <span>Pendaftar: <?= count($_SESSION['list_pendaftar']) ?></span>
                            <span class="text-green-600">Lulus: <?= count(array_filter($_SESSION['list_pendaftar'], fn($x) => $x['status'] == 'Lulus')) ?></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>