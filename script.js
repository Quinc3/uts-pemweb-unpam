/* script.js - VERSI FINAL KOMPLIT */

let editId = null;
const daftarBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// 1. SET TANGGAL DAFTAR OTOMATIS (SISTEM)
function setTodayDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const yyyy = today.getFullYear();
    const field = document.getElementById('tglDaftar');
    if (field) field.value = `${dd}/${mm}/${yyyy}`;
}

// 2. AUTO HINT LOKASI (A, B, V)
function updateLocationHint() {
    const input = document.getElementById('kodeGedung'); // Sesuaikan ID di HTML
    const hint = document.getElementById('autoLocation');
    if (!input || !hint) return;

    const charAwal = input.value.toUpperCase().charAt(0);
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

// 3. VALIDASI NILAI REAL-TIME (CEGAH > 100)
function validasiNilai(el) {
    if (el.value > 100) el.value = 100;
    if (el.value < 0) el.value = 0;
}

// 4. SIMPAN & UPDATE DATA
function simpanData() {
    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const limit = parseInt(document.getElementById('jmlData').value) || 0;
    
    const nama = document.getElementById('nama').value;
    const gedungInput = document.getElementById('kodeGedung').value.toUpperCase();
    const mat = parseFloat(document.getElementById('mat').value) || 0;
    const ing = parseFloat(document.getElementById('ing').value) || 0;
    const umum = parseFloat(document.getElementById('umum').value) || 0;

    // Validasi Input
    if (!nama || !gedungInput) return alert("Nama dan Gedung (A/B/V) wajib diisi!");
    if (mat > 100 || ing > 100 || umum > 100) return alert("Nilai tidak boleh lebih dari 100!");

    // Logika Kode Otomatis: [Gedung][Bulan]-[Digit Tahun]-[Urutan]
    // Contoh: A5-6-1
    let kodeFinal = "";
    if (editId) {
        kodeFinal = data.find(x => x.id === editId).kode;
    } else {
        const now = new Date();
        const bulan = now.getMonth() + 1;
        const tahun = String(now.getFullYear()).slice(-1);
        const urutan = data.length + 1;
        kodeFinal = `${gedungInput.charAt(0)}${bulan}-${tahun}-${urutan}`;
    }

    // Validasi Kuota
    if (!editId && limit > 0 && data.length >= limit) return alert("Kuota pendaftaran penuh!");

    // Perhitungan
    const rata = ((mat + ing + umum) / 3).toFixed(1);
    let status = "Tidak Lulus", color = "text-red-600";
    if (rata >= 70) { status = "Lulus"; color = "text-green-600"; }
    else if (rata >= 60) { status = "Cadangan"; color = "text-yellow-600"; }

    const rowData = {
        id: editId || Date.now(),
        nama,
        kode: kodeFinal,
        tmpLahir: document.getElementById('tmpLahir').value,
        jk: document.getElementById('jk').value,
        ortu: document.getElementById('ortu').value,
        lokasi: (kodeFinal.startsWith('A')) ? "GEDUNG A" : (kodeFinal.startsWith('B')) ? "GEDUNG B" : "VIKTOR",
        bulanTes: daftarBulan[new Date().getMonth()],
        mat, ing, umum, rata, status, color,
        tglDaftar: document.getElementById('tglDaftar').value,
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
    alert(`Berhasil! Kode Anda: ${kodeFinal}`);
}

// 5. RENDER TABEL (12 KOLOM)
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
                    <button onclick="persiapkanEdit(${p.id})" class="text-blue-600 hover:scale-125 transition-transform">
                        <span class="material-symbols-outlined text-[18px]">edit_square</span>
                    </button>
                    <button onclick="hapusSatu(${p.id})" class="text-red-500 hover:scale-125 transition-transform">
                        <span class="material-symbols-outlined text-[18px]">delete_forever</span>
                    </button>
                </td>
                <td class="p-3 border-r font-mono font-bold text-blue-700 uppercase">${p.kode}</td>
                <td class="p-3 border-r font-bold text-gray-700">${p.nama}</td>
                <td class="p-3 border-r">${p.tmpLahir}</td>
                <td class="p-3 border-r">${p.jk}</td>
                <td class="p-3 border-r">${p.ortu}</td>
                <td class="p-3 border-r font-semibold text-gray-500">${p.lokasi}</td>
                <td class="p-3 border-r font-bold text-gray-500">${p.bulanTes}</td>
                <td class="p-3 border-r text-center">${p.mat}</td>
                <td class="p-3 border-r text-center">${p.ing}</td>
                <td class="p-3 border-r text-center">${p.umum}</td>
                <td class="p-3 border-r text-center font-black bg-gray-50 text-[#003366]">${p.rata}</td>
                <td class="p-3 text-center font-bold ${p.color}">${p.status.toUpperCase()}</td>
            </tr>`;
    });

    document.getElementById('statTotal').innerText = `: ${data.length}`;
    document.getElementById('statLulus').innerText = `: ${data.filter(x => x.status === 'Lulus').length}`;
    document.getElementById('statGagal').innerText = `: ${data.filter(x => x.status === 'Tidak Lulus').length}`;
}

// 6. EDIT & DELETE FUNGSI
function persiapkanEdit(id) {
    const data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    const p = data.find(x => x.id === id);
    if (p) {
        editId = p.id;
        document.getElementById('nama').value = p.nama;
        document.getElementById('kodeGedung').value = p.kode.charAt(0);
        document.getElementById('tmpLahir').value = p.tmpLahir;
        document.getElementById('jk').value = p.jk;
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

function hapusSatu(id) {
    if (!confirm("Hapus data ini?")) return;
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
    if (selected.length === 0) return alert("Pilih data!");
    if (!confirm(`Hapus ${selected.length} data?`)) return;

    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];
    localStorage.setItem('unpam_uts', JSON.stringify(data.filter(p => !selected.includes(p.id))));
    document.getElementById('selectAll').checked = false;
    renderTable();
}

function resetForm() {
    editId = null;
    document.getElementById('textBtn').innerText = "Simpan Data";
    document.querySelectorAll('input, select').forEach(i => {
        if (i.id !== 'jmlData' && i.id !== 'tglDaftar') i.value = '';
    });
    updateLocationHint();
    setTodayDate();
}

window.onload = function () { renderTable(); setTodayDate(); };