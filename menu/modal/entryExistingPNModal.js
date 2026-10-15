// File: menu/modal/entryExistingPNModal.js

export function openEntryModal(config) {
    // 1. Header Informasi (Tiket, Requester, Dept)
    let htmlForm = `
        <div style="display: flex; justify-content: space-between; background: var(--bg-main); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 10px; font-size: 0.85rem; text-align: left;">
            <div>
                <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Ticket No</div>
                <div style="font-weight: 700; color: var(--primary); font-size: 1.1rem;">${config.headerData.ticketNo}</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Requester</div>
                <div style="font-weight: 600; color: var(--text-main);">${config.headerData.requester}</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Department</div>
                <div style="font-weight: 600; color: var(--text-main);">${config.headerData.department}</div>
            </div>
        </div>

        <!-- Tabel Input Dinamis Multi-PN -->
        <div style="margin-top: 15px; overflow-x: auto; max-height: 50vh; border: 1px solid var(--border-color); border-radius: 8px;">
            <table class="data-table" style="min-width: 2500px; font-size: 0.8rem; background: var(--bg-card);">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        <th style="position: sticky; left: 0; background: var(--bg-main); z-index: 11; width: 50px; text-align:center;">Act</th>
                        <th style="background: var(--bg-main);">MANU_MAT (PN) *</th>
                        <th style="background: var(--bg-main);">MATL_DESC *</th>
                        <th style="background: var(--bg-main);">MATL_TYPE *</th>
                        <th style="background: var(--bg-main);">BASE_OUM *</th>
                        <th style="background: var(--bg-main);">Dangerous *</th>
                        <th style="background: var(--bg-main);">Shelf Life *</th>
                        <th style="background: var(--bg-main);">MFR NO (CAGE)</th>
                        <th style="background: var(--bg-main);">DOCUMENT</th>
                        <th style="background: var(--bg-main);">ZZUWERKS</th>
                        <th style="background: var(--bg-main);">ZZULGORT</th>
                        <th style="background: var(--bg-main);">ZZRWERKS</th>
                        <th style="background: var(--bg-main);">ZZRILGORT</th>
                        <th style="background: var(--bg-main);">ZZRRLGORT</th>
                        <th style="background: var(--bg-main);">ZZRARBPL</th>
                        <th style="background: var(--bg-main);">ZZPWERKS</th>
                        <th style="background: var(--bg-main);">ZZSLGORT</th>
                        <th style="background: var(--bg-main);">ZZEQART (A/C)</th>
                        <th style="background: var(--bg-main);">EKGRP</th>
                        <th style="background: var(--bg-main);">Reg</th>
                    </tr>
                </thead>
                <tbody id="modal-tbody">
                    <!-- Baris akan digenerate via JS -->
                </tbody>
            </table>
        </div>
        
        <div style="text-align: left; margin-top: 15px;">
            <button id="btn-add-row" type="button" class="btn-submit" style="background: #10b981; margin-top:0;">
                <i class="ph ph-plus-circle"></i> Add New Row
            </button>
        </div>
    `;

    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;">${config.title}</span>`,
        html: htmlForm,
        width: '95vw', // Lebar modal hampir full screen
        background: 'var(--bg-card)', 
        showCancelButton: true,
        confirmButtonText: '<i class="ph ph-paper-plane-right"></i> Submit Ticket',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: '#64748b',
        focusConfirm: false,
        didOpen: () => {
            const tbody = document.getElementById('modal-tbody');
            
            // FUNGSI UNTUK MENAMBAH BARIS TABEL DI MODAL
            function addRow() {
                const tr = document.createElement('tr');
                tr.className = 'pn-row';
                tr.innerHTML = `
                    <td style="position: sticky; left: 0; background: var(--bg-card); z-index: 2; text-align:center; border-right: 1px solid var(--border-color);">
                        <button class="btn-del-row" style="background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;"><i class="ph ph-trash"></i></button>
                    </td>
                    <td><input type="text" class="swal2-input input-pn" style="margin:0; height:35px; width: 140px; text-transform:uppercase;" placeholder="e.g CF1633N"></td>
                    <td><input type="text" class="swal2-input input-desc" style="margin:0; height:35px; width: 160px; text-transform:uppercase;" placeholder="e.g FREEZER"></td>
                    <td><select class="swal2-input input-type" style="margin:0; height:35px; width: 120px;"><option value="TOOLS">TOOLS</option><option value="SPAREPART">SPAREPART</option><option value="CONSUMABLE">CONSUMABLE</option></select></td>
                    <td><input type="text" class="swal2-input input-uom" style="margin:0; height:35px; width: 100px; text-transform:uppercase;" placeholder="e.g 2 EA"></td>
                    <td><select class="swal2-input input-dg" style="margin:0; height:35px; width: 80px;"><option value="NO">NO</option><option value="YES">YES</option></select></td>
                    <td><select class="swal2-input input-shelf" style="margin:0; height:35px; width: 80px;"><option value="NO">NO</option><option value="YES">YES</option></select></td>
                    <td><input type="text" class="swal2-input input-mfr" style="margin:0; height:35px; width: 120px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-doc" style="margin:0; height:35px; width: 120px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-uplant" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-uloc" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-rplant" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-riss" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-rrec" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-pshop" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-pplant" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-sloc" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-ac" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-pur" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                    <td><input type="text" class="swal2-input input-reg" style="margin:0; height:35px; width: 100px; text-transform:uppercase;"></td>
                `;
                tbody.appendChild(tr);
            }

            // Tambah baris pertama secara default
            addRow();

            // Event Listner Tambah Baris
            document.getElementById('btn-add-row').addEventListener('click', addRow);

            // Event Listener Hapus Baris
            tbody.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-del-row');
                if (btn) {
                    if (tbody.children.length === 1) {
                        Swal.showValidationMessage('Minimal harus ada 1 material!');
                    } else {
                        btn.closest('tr').remove();
                        Swal.resetValidationMessage();
                    }
                }
            });
        },
        preConfirm: () => {
            const rows = document.querySelectorAll('.pn-row');
            const dataPns = [];

            // Looping mengambil data setiap baris
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const pn = row.querySelector('.input-pn').value.trim().toUpperCase();
                const desc = row.querySelector('.input-desc').value.trim().toUpperCase();
                const type = row.querySelector('.input-type').value;
                const uom = row.querySelector('.input-uom').value.trim().toUpperCase();

                // Validasi kolom wajib
                if (!pn || !desc || !uom) {
                    Swal.showValidationMessage(`Row ${i+1}: Kolom ber-bintang (*) wajib diisi!`);
                    return false;
                }

                dataPns.push({
                    pn: pn, desc: desc, type: type, uom: uom,
                    dangerous: row.querySelector('.input-dg').value,
                    shelf: row.querySelector('.input-shelf').value,
                    mfr: row.querySelector('.input-mfr').value.trim().toUpperCase(),
                    doc: row.querySelector('.input-doc').value.trim().toUpperCase(),
                    uplant: row.querySelector('.input-uplant').value.trim().toUpperCase(),
                    uloc: row.querySelector('.input-uloc').value.trim().toUpperCase(),
                    rplant: row.querySelector('.input-rplant').value.trim().toUpperCase(),
                    riss: row.querySelector('.input-riss').value.trim().toUpperCase(),
                    rrec: row.querySelector('.input-rrec').value.trim().toUpperCase(),
                    pshop: row.querySelector('.input-pshop').value.trim().toUpperCase(),
                    pplant: row.querySelector('.input-pplant').value.trim().toUpperCase(),
                    sloc: row.querySelector('.input-sloc').value.trim().toUpperCase(),
                    ac: row.querySelector('.input-ac').value.trim().toUpperCase(),
                    pur: row.querySelector('.input-pur').value.trim().toUpperCase(),
                    reg: row.querySelector('.input-reg').value.trim().toUpperCase(),
                });
            }
            return dataPns; // Return array berisi kumpulan object PN
        }
    }).then((result) => {
        if (result.isConfirmed) {
            config.onSubmit(result.value, config.headerData);
            Swal.fire({ icon: 'success', title: 'Ticket Created!', text: 'Data berhasil disimpan.', background: 'var(--bg-card)', color: 'var(--text-main)', timer: 2000, showConfirmButton: false });
        }
    });
}
