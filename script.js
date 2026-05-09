/* script.js */

/**
 * OTOMATISASI LOKASI TES
 */
function updateLocationHint() {
    const kode = document.getElementById('kode').value.toUpperCase();
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
 * SIMPAN DATA & VALIDASI KUOTA
 */
function simpanData() {
    const limitInput = document.getElementById('jmlData').value;
    const limit = parseInt(limitInput) || 0;
    let data = JSON.parse(localStorage.getItem('unpam_uts')) || [];

    // Validasi Kuota
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