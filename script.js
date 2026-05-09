/* script.js - VERSI FINAL & BERSIH */

// 1. Variabel global untuk mode Edit
let editId = null;

// 2. OTOMATISASI LOKASI TES (GEDUNG A, B, VIKTOR)
function updateLocationHint() {
    const inputElemen = document.getElementById('kode');
    const hint = document.getElementById('autoLocation');
    if (!inputElemen || !hint) return;

    const kode = inputElemen.value.toUpperCase();
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

// 3. FUNGSI SIMPAN / UPDATE DATA
function simpanData() {
    const limit = parseInt(document.getElementById('jmlData').value) || 0;
    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    
    // Cek kuota hanya jika nambah data baru
    if (!editId && limit > 0 && data.length >= limit) return alert("Kuota pendaftaran penuh!");

    const nama = document.getElementById('nama').value;
    const kode = document.getElementById('kode').value.toUpperCase();
    if (!nama || !kode) return alert("Nama dan Kode wajib diisi!");

    // Penentuan Lokasi & Bulan Tes Otomatis
    let lokasi = (kode.startsWith('A')) ? "GEDUNG A" : (kode.startsWith('B')) ? "GEDUNG B" : "VIKTOR";
    const daftarBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const tglInput = document.getElementById('tglLahir').value;
    let bulanTes = (tglInput) ? daftarBulan[new Date(tglInput).getMonth()] : "-";

    // Hitung Nilai
    const mat = parseFloat(document.getElementById('mat').value) || 0;
    const ing = parseFloat(document.getElementById('ing').value) || 0;
    const umum = parseFloat(document.getElementById('umum').value) || 0;
    const rata = ((mat + ing + umum) / 3).toFixed(1);

    let status = "Tidak Lulus", color = "text-red-600";
    if (rata >= 70) { status = "Lulus"; color = "text-green-600"; }
    else if (rata >= 60) { status = "Cadangan"; color = "text-yellow-600"; }

    const row = {
        id: editId || Date.now(), nama, kode, lokasi, bulanTes, status, color, rata, mat, ing, umum,
        jk: document.getElementById('jk').value,
        tmpLahir: document.getElementById('tmpLahir').value,
        tgl: tglInput,
        ortu: document.getElementById('ortu').value,
        asal: document.getElementById('asal').value
    };

    if (editId) {
        data = data.map(p => p.id === editId ? row : p);
        editId = null;
        document.getElementById('btnSimpan').innerText = "Simpan Data";
    } else {
        data.push(row);
    }

    localStorage.setItem('unpam_uts', JSON.stringify(data));
    renderTable();
    resetForm();
    alert("Berhasil diproses!");
}

// 4. TAMPILKAN DATA KE TABEL
function renderTable() {
    const data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const tbody = document.querySelector('#tabelPendaftar tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(p => {
        tbody.innerHTML += `
            <tr class="hover:bg-blue-50 border-b">
                <td class="p-3 text-center border-r"><input type="checkbox" class="rowCheckbox" value="${p.id}"></td>
                <td class="p-3 text-center border-r flex gap-2 justify-center">
                    <button onclick="hapusSatu(${p.id})" class="text-red-500 font-bold">X</button>
                    <button onclick="editData(${p.id})" class="text-blue-600 font-bold">Edit</button>
                </td>
                <td class="p-3 border-r font-mono font-bold">${p.kode}</td>
                <td class="p-3 border-r font-bold">${p.nama}</td>
                <td class="p-3 border-r font-semibold">${p.lokasi}</td>
                <td class="p-3 border-r font-bold text-blue-700">${p.bulanTes}</td>
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

// 5. FITUR EDIT, HAPUS, RESET
function editData(id) {
    const data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const p = data.find(x => x.id === id);
    if (p) {
        editId = p.id;
        document.getElementById('nama').value = p.nama;
        document.getElementById('kode').value = p.kode;
        document.getElementById('jk').value = p.jk;
        document.getElementById('tmpLahir').value = p.tmpLahir;
        document.getElementById('tglLahir').value = p.tgl;
        document.getElementById('ortu').value = p.ortu;
        document.getElementById('asal').value = p.asal || '';
        document.getElementById('mat').value = p.mat;
        document.getElementById('ing').value = p.ing;
        document.getElementById('umum').value = p.umum;
        document.getElementById('btnSimpan').innerText = "Update Data";
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateLocationHint();
    }
}

function hapusSatu(id) {
    if (confirm("Hapus data ini?")) {
        let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
        localStorage.setItem('unpam_uts', JSON.stringify(data.filter(x => x.id !== id)));
        renderTable();
    }
}

function toggleSelectAll() {
    const isChecked = document.getElementById('selectAll').checked;
    document.querySelectorAll('.rowCheckbox').forEach(cb => cb.checked = isChecked);
}

function hapusTerpilih() {
    const selected = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb => parseInt(cb.value));
    if (selected.length === 0) return alert("Pilih data dulu!");
    if (confirm(`Hapus ${selected.length} data terpilih?`)) {
        let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
        localStorage.setItem('unpam_uts', JSON.stringify(data.filter(p => !selected.includes(p.id))));
        document.getElementById('selectAll').checked = false;
        renderTable();
    }
}

function resetForm() {
    document.querySelectorAll('input, select').forEach(i => { if(i.id !== 'jmlData') i.value = ''; });
    document.getElementById('btnSimpan').innerText = "Simpan Data";
    editId = null;
    updateLocationHint();
}

window.onload = renderTable;

