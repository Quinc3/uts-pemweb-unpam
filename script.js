// Inisialisasi Data
let editId = null;
const daftarBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// 1. Set Tanggal Hari Ini Otomatis
function setTodayDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const yyyy = today.getFullYear();
    const field = document.getElementById('tglDaftar');
    if (field) field.value = `${dd}/${mm}/${yyyy}`;
}

// 2. Logika Auto Lokasi (Update Badge di Header)
function updateLocationHint() {
    const kodeInput = document.getElementById('kode');
    const hint = document.getElementById('autoLocation');
    if (!kodeInput || !hint) return;

    const kode = kodeInput.value.toUpperCase();
    const charAwal = kode.charAt(0);
    
    // Konfigurasi Warna & Teks sesuai UNPAM
    const config = {
        'A': { text: "GEDUNG A", class: "bg-green-600 text-white" },
        'B': { text: "GEDUNG B", class: "bg-yellow-500 text-white" },
        'V': { text: "VIKTOR", class: "bg-purple-600 text-white" }
    };

    const res = config[charAwal];
    if (res) {
        hint.innerText = res.text;
        hint.className = `text-[10px] font-bold px-3 py-1 ${res.class} rounded-full tracking-wider uppercase shadow-md transition-all duration-300`;
    } else {
        hint.innerText = "MENUNGGU KODE...";
        hint.className = "text-[10px] font-bold px-3 py-1 bg-gray-200 text-gray-500 rounded-full tracking-wider uppercase transition-all duration-300";
    }
}

// 3. Simpan Data (Create & Update)
function simpanData() {
    const limitInput = document.getElementById('jmlData').value;
    const limit = parseInt(limitInput) || 0;
    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];

    // Cek Kuota (Hanya jika input baru, bukan edit)
    if (!editId && limit > 0 && data.length >= limit) {
        return alert(`Maaf, kuota pendaftaran sudah penuh (${limit} data).`);
    }

    const nama = document.getElementById('nama').value;
    const kode = document.getElementById('kode').value.toUpperCase();

    if (!nama || !kode) {
        return alert("Nama dan Kode Pendaftaran wajib diisi!");
    }

    // Penentuan Lokasi & Bulan
    let lokasi = (kode.startsWith('A')) ? "GEDUNG A" : (kode.startsWith('B')) ? "GEDUNG B" : "VIKTOR";
    let bulanTes = daftarBulan[new Date().getMonth()];

    // Hitung Nilai
    const mat = parseFloat(document.getElementById('mat').value) || 0;
    const ing = parseFloat(document.getElementById('ing').value) || 0;
    const umum = parseFloat(document.getElementById('umum').value) || 0;
    const rataRaw = (mat + ing + umum) / 3;
    const rata = rataRaw.toFixed(1);

    // Penentuan Status
    let status = "Tidak Lulus", color = "text-red-600";
    if (rataRaw >= 70) { 
        status = "Lulus"; 
        color = "text-green-600"; 
    } else if (rataRaw >= 60) { 
        status = "Cadangan"; 
        color = "text-yellow-600"; 
    }

    const rowData = {
        id: editId || Date.now(),
        nama, kode, lokasi, bulanTes, status, color, rata, mat, ing, umum,
        tglDaftar: document.getElementById('tglDaftar').value,
        tglLahir: document.getElementById('tglLahir').value,
        jk: document.getElementById('jk').value,
        ortu: document.getElementById('ortu').value,
        asal: document.getElementById('asal').value
    };

    if (editId) {
        data = data.map(p => p.id === editId ? rowData : p);
        editId = null;
        document.getElementById('textBtn').innerText = "Simpan Data";
    } else {
        data.push(rowData);
    }

    localStorage.setItem('unpam_uts', JSON.stringify(data));
    renderTable();
    resetForm();
    alert("Data berhasil diproses!");
}

// 4. Render Tabel dari LocalStorage
function renderTable() {
    const data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const tbody = document.querySelector('#tabelPendaftar tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    data.forEach(p => {
        tbody.innerHTML += `
            <tr class="hover:bg-blue-50/50 transition-colors border-b">
                <td class="p-3 border-r text-center"><input type="checkbox" class="rowCheckbox" value="${p.id}"></td>
                <td class="p-3 border-r text-center flex justify-center gap-3">
                    <button onclick="persiapkanEdit(${p.id})" class="text-blue-600 hover:scale-125 transition-transform" title="Edit">
                        <span class="material-symbols-outlined text-[18px]">edit_square</span>
                    </button>
                    <button onclick="hapusSatu(${p.id})" class="text-red-500 hover:scale-125 transition-transform" title="Hapus">
                        <span class="material-symbols-outlined text-[18px]">delete_forever</span>
                    </button>
                </td>
                <td class="p-3 border-r font-mono text-blue-700 font-bold uppercase tracking-tighter">${p.kode}</td>
                <td class="p-3 border-r font-bold text-gray-700">${p.nama}</td>
                <td class="p-3 border-r font-semibold text-gray-500">${p.lokasi}</td>
                <td class="p-3 border-r font-bold text-blue-800">${p.bulanTes}</td>
                <td class="p-3 border-r text-center text-gray-600">${p.ing}</td>
                <td class="p-3 border-r text-center text-gray-600">${p.mat}</td>
                <td class="p-3 border-r text-center text-gray-600">${p.umum}</td>
                <td class="p-3 border-r text-center font-bold bg-gray-50 text-[#003366]">${p.rata}</td>
                <td class="p-3 text-center font-black uppercase text-[10px] ${p.color}">${p.status}</td>
            </tr>`;
    });

    // Update Statistik
    document.getElementById('statTotal').innerText = `: ${data.length}`;
    document.getElementById('statLulus').innerText = `: ${data.filter(x => x.status === 'Lulus').length}`;
    document.getElementById('statGagal').innerText = `: ${data.filter(x => x.status === 'Tidak Lulus').length}`;
}

// 5. Persiapkan Edit (Tarik data ke form)
function persiapkanEdit(id) {
    const data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const p = data.find(x => x.id === id);
    if (p) {
        editId = p.id;
        document.getElementById('nama').value = p.nama;
        document.getElementById('kode').value = p.kode;
        document.getElementById('jk').value = p.jk;
        document.getElementById('tglLahir').value = p.tglLahir;
        document.getElementById('ortu').value = p.ortu;
        document.getElementById('asal').value = p.asal || '';
        document.getElementById('mat').value = p.mat;
        document.getElementById('ing').value = p.ing;
        document.getElementById('umum').value = p.umum;
        document.getElementById('textBtn').innerText = "Update Data";
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateLocationHint();
    }
}

// 6. Fungsi Hapus
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
    const checkboxes = document.querySelectorAll('.rowCheckbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) return alert("Pilih data yang ingin dihapus!");
    if (!confirm(`Hapus ${selectedIds.length} data terpilih?`)) return;

    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    localStorage.setItem('unpam_uts', JSON.stringify(data.filter(p => !selectedIds.includes(p.id))));
    document.getElementById('selectAll').checked = false;
    renderTable();
}

// 7. Reset Form
function resetForm() {
    editId = null;
    document.getElementById('textBtn').innerText = "Simpan Data";
    document.querySelectorAll('input, select').forEach(i => {
        if(i.id !== 'jmlData' && i.id !== 'tglDaftar') i.value = '';
    });
    updateLocationHint();
    setTodayDate();
}

// Jalankan saat halaman dibuka
window.onload = function() {
    renderTable();
    setTodayDate();
};
