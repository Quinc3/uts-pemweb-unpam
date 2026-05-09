let editId = null;
const daftarBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Set Tanggal Daftar Otomatis dari System
function setTodayDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const yyyy = today.getFullYear();
    const field = document.getElementById('tglDaftar');
    if (field) field.value = `${dd}/${mm}/${yyyy}`;
}

// Auto Hint Lokasi Tes
function updateLocationHint() {
    const kodeInput = document.getElementById('kode');
    const hint = document.getElementById('autoLocation');
    if (!kodeInput || !hint) return;

    const kode = kodeInput.value.toUpperCase();
    const charAwal = kode.charAt(0);
    const config = {
        'A': { text: "GEDUNG A", class: "bg-green-600 text-white" },
        'B': { text: "GEDUNG B", class: "bg-yellow-500 text-white" },
        'V': { text: "VIKTOR", class: "bg-purple-600 text-white" }
    };

    const res = config[charAwal];
    if (res) {
        hint.innerText = res.text;
        hint.className = `text-[10px] font-bold px-3 py-1 ${res.class} rounded-full tracking-wider uppercase shadow-sm`;
    } else {
        hint.innerText = "MENUNGGU KODE...";
        hint.className = "text-[10px] font-bold px-3 py-1 bg-gray-200 text-gray-500 rounded-full tracking-wider uppercase";
    }
}

// Simpan & Update Data (Logika Anti-Duplikat + Kuota)
function simpanData() {
    const limitInput = document.getElementById('jmlData').value;
    const limit = parseInt(limitInput) || 0;
    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];

    const nama = document.getElementById('nama').value;
    const kode = document.getElementById('kode').value.toUpperCase();

    if (!nama || !kode) return alert("Peringatan: Nama dan Kode tidak boleh kosong!");

    // --- LOGIKA ANTI DUPLIKAT ---
    const isDuplicate = data.some(p => p.kode === kode && p.id !== editId);
    if (isDuplicate) return alert(`Error: Kode ${kode} sudah terdaftar di database!`);

    // Validasi Kuota
    if (!editId && limit > 0 && data.length >= limit) return alert(`Gagal: Kuota pendaftaran penuh (${limit}).`);

    // Logika Lokasi & Bulan Tes
    let lokasi = (kode.startsWith('A')) ? "GEDUNG A" : (kode.startsWith('B')) ? "GEDUNG B" : "VIKTOR";
    let bulanTes = daftarBulan[new Date().getMonth()];

    // Perhitungan Nilai
    const mat = parseFloat(document.getElementById('mat').value) || 0;
    const ing = parseFloat(document.getElementById('ing').value) || 0;
    const umum = parseFloat(document.getElementById('umum').value) || 0;
    const rataRaw = (mat + ing + umum) / 3;
    const rata = rataRaw.toFixed(1);

    let status = "Tidak Lulus", color = "text-red-600";
    if (rataRaw >= 70) { status = "Lulus"; color = "text-green-600"; }
    else if (rataRaw >= 60) { status = "Cadangan"; color = "text-yellow-600"; }

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
    alert("Sukses: Data pendaftaran berhasil diproses!");
}

// Render Tabel
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
                <td class="p-3 border-r font-mono text-blue-700 font-bold uppercase">${p.kode}</td>
                <td class="p-3 border-r font-bold">${p.nama}</td>
                <td class="p-3 border-r font-semibold">${p.lokasi}</td>
                <td class="p-3 border-r font-bold text-blue-800">${p.bulanTes}</td>
                <td class="p-3 border-r text-center">${p.ing}</td>
                <td class="p-3 border-r text-center">${p.mat}</td>
                <td class="p-3 border-r text-center">${p.umum}</td>
                <td class="p-3 border-r text-center font-bold bg-gray-50">${p.rata}</td>
                <td class="p-3 text-center font-bold ${p.color}">${p.status.toUpperCase()}</td>
            </tr>`;
    });

    // Update Statistik
    document.getElementById('statTotal').innerText = `: ${data.length}`;
    document.getElementById('statLulus').innerText = `: ${data.filter(x => x.status === 'Lulus').length}`;
    document.getElementById('statGagal').innerText = `: ${data.filter(x => x.status === 'Tidak Lulus').length}`;
}

// Persiapan Edit
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

// Hapus
function hapusSatu(id) {
    if (!confirm("Konfirmasi: Hapus data pendaftar ini?")) return;
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
    if (!confirm(`Hapus ${selected.length} data terpilih?`)) return;

    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    localStorage.setItem('unpam_uts', JSON.stringify(data.filter(p => !selected.includes(p.id))));
    document.getElementById('selectAll').checked = false;
    renderTable();
}

// Reset Form
function resetForm() {
    editId = null;
    document.getElementById('textBtn').innerText = "Simpan Data";
    document.querySelectorAll('input, select').forEach(i => {
        if(i.id !== 'jmlData' && i.id !== 'tglDaftar') i.value = '';
    });
    updateLocationHint();
    setTodayDate();
}

window.onload = function() { renderTable(); setTodayDate(); };
