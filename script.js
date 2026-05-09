/* script.js */

// Variabel global untuk menyimpan ID data yang sedang diedit
let editId = null;

/**
 * 1. OTOMATISASI LOKASI TES
 * Mendeteksi karakter pertama kode (A, B, V) dan memberikan hint warna.
 */
function updateLocationHint() {
    const kodeInput = document.getElementById('kode');
    if (!kodeInput) return;

    const kode = kodeInput.value.toUpperCase();
    const hint = document.getElementById('autoLocation');
    const charAwal = kode.charAt(0);

    const config = {
        'A': { text: "GEDUNG A", class: "bg-green-600 text-white" },
        'B': { text: "GEDUNG B", class: "bg-yellow-500 text-white" },
        'V': { text: "VIKTOR", class: "bg-purple-600 text-white" }
    };

    const res = config[charAwal];

    if (res) {
        hint.innerText = res.text;
        hint.className = `text-[10px] font-bold px-2 py-1 ${res.class} rounded tracking-wide uppercase`;
    } else {
        hint.innerText = "MENUNGGU KODE...";
        hint.className = "text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-400 rounded tracking-wide uppercase";
    }
}

/**
 * 2. SIMPAN / UPDATE DATA
 * Menangani logika tambah data baru atau memperbarui data yang sudah ada.
 */
function simpanData() {
    const limitInput = document.getElementById('jmlData').value;
    const limit = parseInt(limitInput) || 0;
    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];

    // Validasi Kuota (Hanya dicek jika TIDAK dalam mode edit)
    if (!editId && limit > 0 && data.length >= limit) {
        return alert(`Gagal Simpan! Kuota pendaftaran sudah penuh (${limit}).`);
    }

    const nama = document.getElementById('nama').value;
    const kode = document.getElementById('kode').value.toUpperCase();

    if (!nama || !kode) return alert("Mohon lengkapi Nama dan Kode Pendaftaran!");

    // Penentuan Lokasi Tes Otomatis untuk Database
    let lokasi = "VIKTOR";
    const prefix = kode.charAt(0);
    if (prefix === 'A') lokasi = "GEDUNG A";
    else if (prefix === 'B') lokasi = "GEDUNG B";

    // Ambil Nilai & Perhitungan
    const mat = parseFloat(document.getElementById('mat').value) || 0;
    const ing = parseFloat(document.getElementById('ing').value) || 0;
    const umum = parseFloat(document.getElementById('umum').value) || 0;
    const rataRaw = (mat + ing + umum) / 3;
    const rata = rataRaw.toFixed(1);

    // Penentuan Status Kelulusan
    let status = "Tidak Lulus";
    let color = "text-red-600";
    if (rataRaw >= 70) {
        status = "Lulus";
        color = "text-green-600";
    } else if (rataRaw >= 60) {
        status = "Cadangan";
        color = "text-yellow-600";
    }

    const rowData = {
        id: editId ? editId : Date.now(), // Gunakan ID lama jika edit, ID baru jika tambah
        nama, kode, lokasi, status, color, rata,
        tmpLahir: document.getElementById('tmpLahir').value,
        jk: document.getElementById('jk').value,
        tgl: document.getElementById('tglLahir').value,
        ortu: document.getElementById('ortu').value,
        mat, ing, umum
    };

    if (editId) {
        // Mode Update
        data = data.map(p => p.id === editId ? rowData : p);
        editId = null; // Reset mode edit
        document.getElementById('btnSimpan').innerText = "Simpan Data";
    } else {
        // Mode Tambah Baru
        data.push(rowData);
    }

    localStorage.setItem('unpam_uts', JSON.stringify(data));
    renderTable();
    resetForm();
    alert("Data berhasil disimpan!");
}

/**
 * 3. RENDER TABEL & STATISTIK
 */
function renderTable() {
    const data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const tbody = document.querySelector('#tabelPendaftar tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    data.forEach(p => {
        tbody.innerHTML += `
            <tr class="hover:bg-blue-50 transition-colors border-b">
                <td class="p-3 border-r text-center"><input type="checkbox" class="rowCheckbox" value="${p.id}"></td>
                <td class="p-3 border-r text-center flex justify-center gap-2">
                    <button onclick="hapusSatu(${p.id})" class="text-red-500 font-bold hover:scale-125 transition-transform" title="Hapus">X</button>
                    <button onclick="persiapkanEdit(${p.id})" class="text-blue-600 font-bold hover:scale-125 transition-transform" title="Edit">Edit</button>
                </td>
                <td class="p-3 border-r font-mono text-blue-700 font-bold">${p.kode}</td>
                <td class="p-3 border-r font-bold">${p.nama}</td>
                <td class="p-3 border-r">${p.tmpLahir}</td>
                <td class="p-3 border-r">${p.jk}</td>
                <td class="p-3 border-r">${p.tgl}</td>
                <td class="p-3 border-r">${p.ortu}</td>
                <td class="p-3 border-r font-semibold">${p.lokasi}</td>
                <td class="p-3 border-r text-center">${p.ing}</td>
                <td class="p-3 border-r text-center">${p.mat}</td>
                <td class="p-3 border-r text-center">${p.umum}</td>
                <td class="p-3 border-r text-center font-bold bg-gray-50">${p.rata}</td>
                <td class="p-3 text-center font-bold ${p.color}">${p.status.toUpperCase()}</td>
            </tr>
        `;
    });

    // Update Statistik Footer
    document.getElementById('statTotal').innerText = `: ${data.length}`;
    document.getElementById('statLulus').innerText = `: ${data.filter(x => x.status === 'Lulus').length}`;
    document.getElementById('statGagal').innerText = `: ${data.filter(x => x.status === 'Tidak Lulus').length}`;
}

/**
 * 4. FUNGSI EDIT
 * Mengambil data dari tabel dan memasukkannya kembali ke form.
 */
function persiapkanEdit(id) {
    const data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const p = data.find(x => x.id === id);

    if (p) {
        editId = p.id;
        
        // Isi Form
        document.getElementById('nama').value = p.nama;
        document.getElementById('kode').value = p.kode;
        document.getElementById('jk').value = p.jk;
        document.getElementById('tmpLahir').value = p.tmpLahir;
        document.getElementById('tglLahir').value = p.tgl;
        document.getElementById('ortu').value = p.ortu;
        document.getElementById('mat').value = p.mat;
        document.getElementById('ing').value = p.ing;
        document.getElementById('umum').value = p.umum;

        // Ganti Teks Tombol
        document.getElementById('btnSimpan').innerText = "Update Data";
        
        // Scroll ke atas otomatis
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateLocationHint();
    }
}

/**
 * 5. FITUR HAPUS SATU & MASSAL
 */
function hapusSatu(id) {
    if (!confirm("Hapus data pendaftar ini?")) return;
    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    localStorage.setItem('unpam_uts', JSON.stringify(data.filter(p => p.id !== id)));
    renderTable();
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.rowCheckbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

function hapusTerpilih() {
    const selected = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb => parseInt(cb.value));
    if (selected.length === 0) return alert("Pilih minimal satu data!");
    if (!confirm(`Hapus ${selected.length} data pendaftaran?`)) return;

    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    localStorage.setItem('unpam_uts', JSON.stringify(data.filter(p => !selected.includes(p.id))));
    
    document.getElementById('selectAll').checked = false;
    renderTable();
}

/**
 * 6. RESET FORM
 */
function resetForm() {
    editId = null;
    document.getElementById('btnSimpan').innerText = "Simpan Data";
    document.querySelectorAll('input').forEach(i => {
        if(i.id !== 'jmlData') i.value = '';
    });
    updateLocationHint();
}

// Inisialisasi saat halaman dimuat
window.onload = renderTable;
    if (limit > 0 && data.length >= limit) {
        return alert(`Gagal Simpan! Kuota sudah penuh (${limit}).`);
    }

    const nama = document.getElementById('nama').value;
    const kode = document.getElementById('kode').value.toUpperCase();

    if (!nama || !kode) return alert("Mohon lengkapi Nama dan Kode Pendaftaran!");

    // Logika Lokasi Tes Otomatis
    let lokasi = "VIKTOR";
    const prefix = kode.charAt(0);
    if (prefix === 'A') lokasi = "GEDUNG A";
    else if (prefix === 'B') lokasi = "GEDUNG B";

    // Nilai & Perhitungan
    const mat = parseFloat(document.getElementById('mat').value) || 0;
    const ing = parseFloat(document.getElementById('ing').value) || 0;
    const umum = parseFloat(document.getElementById('umum').value) || 0;
    const rataRaw = (mat + ing + umum) / 3;
    const rata = rataRaw.toFixed(1);

    // Penentuan Status
    let status = "Tidak Lulus";
    let color = "text-red-600";
    if (rataRaw >= 70) {
        status = "Lulus";
        color = "text-green-600";
    } else if (rataRaw >= 60) {
        status = "Cadangan";
        color = "text-yellow-600";
    }

    const rowData = {
        id: Date.now(),
        nama, kode, lokasi, status, color, rata,
        tmpLahir: document.getElementById('tmpLahir').value,
        jk: document.getElementById('jk').value,
        tgl: document.getElementById('tglLahir').value,
        ortu: document.getElementById('ortu').value,
        mat, ing, umum
    };

    data.push(rowData);
    localStorage.setItem('unpam_uts', JSON.stringify(data));

    renderTable();
    resetForm();
}

/**
 * RENDER TABEL & STATISTIK
 */
function renderTable() {
    const data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const tbody = document.querySelector('#tabelPendaftar tbody');
    tbody.innerHTML = '';

    data.forEach(p => {
        tbody.innerHTML += `
            <tr class="hover:bg-blue-50 transition-colors border-b">
                <td class="p-3 border-r text-center"><input type="checkbox" class="rowCheckbox" value="${p.id}"></td>
                <td class="p-3 border-r text-center">
                    <button onclick="hapusSatu(${p.id})" class="text-red-500 font-bold hover:scale-125 transition-transform">X</button>
                </td>
                <td class="p-3 border-r font-mono text-blue-700 font-bold">${p.kode}</td>
                <td class="p-3 border-r font-bold">${p.nama}</td>
                <td class="p-3 border-r">${p.tmpLahir}</td>
                <td class="p-3 border-r">${p.jk}</td>
                <td class="p-3 border-r">${p.tgl}</td>
                <td class="p-3 border-r">${p.ortu}</td>
                <td class="p-3 border-r font-semibold">${p.lokasi}</td>
                <td class="p-3 border-r text-center">${p.ing}</td>
                <td class="p-3 border-r text-center">${p.mat}</td>
                <td class="p-3 border-r text-center">${p.umum}</td>
                <td class="p-3 border-r text-center font-bold bg-gray-50">${p.rata}</td>
                <td class="p-3 text-center font-bold ${p.color}">${p.status.toUpperCase()}</td>
            </tr>
        `;
    });

    // Update Statistik
    document.getElementById('statTotal').innerText = `: ${data.length}`;
    document.getElementById('statLulus').innerText = `: ${data.filter(x => x.status === 'Lulus').length}`;
    document.getElementById('statGagal').innerText = `: ${data.filter(x => x.status === 'Tidak Lulus').length}`;
}

/**
 * FITUR HAPUS SATU & MASSAL
 */
function hapusSatu(id) {
    if (!confirm("Hapus data pendaftar ini?")) return;
    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    localStorage.setItem('unpam_uts', JSON.stringify(data.filter(p => p.id !== id)));
    renderTable();
}

function toggleSelectAll() {
    const isChecked = document.getElementById('selectAll').checked;
    document.querySelectorAll('.rowCheckbox').forEach(cb => cb.checked = isChecked);
}

function hapusTerpilih() {
    const selected = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb => parseInt(cb.value));
    if (selected.length === 0) return alert("Pilih minimal satu data!");
    if (!confirm(`Hapus ${selected.length} data?`)) return;

    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    localStorage.setItem('unpam_uts', JSON.stringify(data.filter(p => !selected.includes(p.id))));
    document.getElementById('selectAll').checked = false;
    renderTable();
}

/**
 * RESET FORM
 */
function resetForm() {
    document.querySelectorAll('input').forEach(i => {
        if(i.id !== 'jmlData') i.value = '';
    });
    updateLocationHint();
}

window.onload = renderTable;
