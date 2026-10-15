// File: menu/modal/entryExistingPNModal.js

export function openEntryModal(config) {
    // 1. Header Informasi
    let htmlForm = `
        <style>
            /* STYLING UNTUK EXCEL-LIKE TABLE */
            .excel-table { width: 100%; border-collapse: collapse; min-width: 2500px; font-size: 0.8rem; background: var(--bg-card); }
            .excel-table th { 
                background: var(--bg-main); color: var(--text-muted); padding: 10px; 
                text-align: center; border: 1px solid var(--border-color); white-space: nowrap;
            }
            .excel-table td { 
                border: 1px solid var(--border-color); padding: 0; position: relative;
            }
            /* Styling Input agar menyatu dengan sel (tidak terlihat seperti kotak input) */
            .excel-input { 
                width: 100%; height: 38px; border: none; background: transparent; 
                padding: 0 10px; font-size: 0.85rem; color: var(--text-main); 
                outline: none; text-transform: uppercase; font-family: inherit;
            }
            /* Efek highlight biru seperti excel saat cell di klik */
            .excel-input:focus { background: #eff6ff; box-shadow: inset 0 0 0 2px var(--primary); }
            
            /* Dark mode support untuk sel yang aktif */
            @media (prefers-color-scheme: dark) {
                .excel-input:focus { background: #1e3a8a; }
            }
        </style>

        <div style="display: flex; justify-content: space-between; background: var(--bg-main); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 10px; font-size: 0.85rem; text-align: left;">
            <div><div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Ticket No</div><div style="font-weight: 700; color: var(--primary); font-size: 1.1rem;">${config.headerData.ticketNo}</div></div>
            <div><div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Requester</div><div style="font-weight: 600; color: var(--text-main);">${config.headerData.requester}</div></div>
            <div><div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Department</div><div style="font-weight: 600; color: var(--text-main);">${config.headerData.department}</div></div>
        </div>

        <!-- Tabel Input Dinamis Multi-PN (Excel Style) -->
        <div style="margin-top: 15px; overflow-x: auto; max-height: 50vh; border: 1px solid var(--border-color); border-radius: 4px;">
            <table class="excel-table">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        <th style="position: sticky; left: 0; z-index: 11; width: 40px;">ACT</th>
                        <th>MANUFACTURER PART NUMBER<br><span style="font-size:0.7rem; font-weight:normal;">(MANU_MAT) *</span></th>
                        <th>MATERIAL DESCRIPTION<br><span style="font-size:0.7rem; font-weight:normal;">(MATL_DESC) *</span></th>
                        <th>MATERIAL TYPE<br><span style="font-size:0.7rem; font-weight:normal;">(MATL_TYPE) *</span></th>
                        <th>BASE UNIT OF MEASURE<br><span style="font-size:0.7rem; font-weight:normal;">(BASE_OUM) *</span></th>
                        <th>DANGEROUS GOOD<br><span style="font-size:0.7rem; font-weight:normal;">(Dangerous) *</span></th>
                        <th>SHELF LIFE<br><span style="font-size:0.7rem; font-weight:normal;">(Shelf Life) *</span></th>
                        <th>NUMBER OF A MANUFACTURER<br><span style="font-size:0.7rem; font-weight:normal;">(MFR NO / CAGE CODE)</span></th>
                        <th>DOCUMENT NUMBER<br><span style="font-size:0.7rem; font-weight:normal;">(DOCUMENT)</span></th>
                        <th>UNSERVICEABLE PLANT<br><span style="font-size:0.7rem; font-weight:normal;">(ZZUWERKS)</span></th>
                        <th>UNSERSABLE STORAGE LOCATION<br><span style="font-size:0.7rem; font-weight:normal;">(ZZULGORT)</span></th>
                        <th>REFURBISHMENT PLANT<br><span style="font-size:0.7rem; font-weight:normal;">(ZZRWERKS)</span></th>
                        <th>REFURBISHMENT ISSUE ST LOC<br><span style="font-size:0.7rem; font-weight:normal;">(ZZRILGORT)</span></th>
                        <th>REFURBISHMENT RECEIPT ST LOC<br><span style="font-size:0.7rem; font-weight:normal;">(ZZRRLGORT)</span></th>
                        <th>PARENT SHOP<br><span style="font-size:0.7rem; font-weight:normal;">(ZZRARBPL)</span></th>
                        <th>PARENT SHOP PLANT<br><span style="font-size:0.7rem; font-weight:normal;">(ZZPWERKS)</span></th>
                        <th>SERVICEABLE STORE LOCATION<br><span style="font-size:0.7rem; font-weight:normal;">(ZZSLGORT)</span></th>
                        <th>TYPE OF TECH OBJECT<br><span style="font-size:0.7rem; font-weight:normal;">(ZZEQART)</span></th>
                        <th>PURCHASING GROUP<br><span style="font-size:0.7rem; font-weight:normal;">(EKGRP)</span></th>
                        <th>AIRCRAFT REGISTRATION<br><span style="font-size:0.7rem; font-weight:normal;">(Reg)</span></th>
                    </tr>
                </thead>
                <tbody id="modal-tbody">
                    <!-- Baris akan digenerate via JS -->
                </tbody>
            </table>
        </div>
        
        <div style="text-align: left; margin-top: 15px; display: flex; gap: 10px; align-items: center;">
            <button id="btn-add-row" type="button" class="btn-submit" style="background: #10b981; margin-top:0;">
                <i class="ph ph-plus"></i> Add Row
            </button>
            <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="ph ph-info"></i> Pro Tip: You can copy data from Excel and paste (Ctrl+V) into any cell.</span>
        </div>
    `;

    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;">${config.title}</span>`,
        html: htmlForm,
        width: '98vw', // Sangat lebar agar excel view optimal
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
                    <td style="position: sticky; left: 0; background: var(--bg-card); z-index: 2; text-align:center;">
                        <button class="btn-del-row" style="background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;" tabindex="-1"><i class="ph ph-trash"></i></button>
                    </td>
                    <td><input type="text" class="excel-input input-pn" placeholder="CF1633N"></td>
                    <td><input type="text" class="excel-input input-desc" placeholder="FREEZER"></td>
                    <td><select class="excel-input input-type"><option value="TOOLS">TOOLS</option><option value="SPAREPART">SPAREPART</option><option value="CONSUMABLE">CONSUMABLE</option></select></td>
                    <td><input type="text" class="excel-input input-uom" placeholder="2 EA"></td>
                    <td><select class="excel-input input-dg"><option value="NO">NO</option><option value="YES">YES</option></select></td>
                    <td><select class="excel-input input-shelf"><option value="NO">NO</option><option value="YES">YES</option></select></td>
                    <td><input type="text" class="excel-input input-mfr"></td>
                    <td><input type="text" class="excel-input input-doc"></td>
                    <td><input type="text" class="excel-input input-uplant"></td>
                    <td><input type="text" class="excel-input input-uloc"></td>
                    <td><input type="text" class="excel-input input-rplant"></td>
                    <td><input type="text" class="excel-input input-riss"></td>
                    <td><input type="text" class="excel-input input-rrec"></td>
                    <td><input type="text" class="excel-input input-pshop"></td>
                    <td><input type="text" class="excel-input input-pplant"></td>
                    <td><input type="text" class="excel-input input-sloc"></td>
                    <td><input type="text" class="excel-input input-ac"></td>
                    <td><input type="text" class="excel-input input-pur"></td>
                    <td><input type="text" class="excel-input input-reg"></td>
                `;
                tbody.appendChild(tr);
                return tr; // Kembalikan elemen TR untuk fungsi paste
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

            // LOGIKA EXCEL PASTE (CTRL+V)
            tbody.addEventListener('paste', (e) => {
                const targetInput = e.target.closest('.excel-input');
                if (!targetInput) return;

                e.preventDefault(); // Cegah paste bawaan browser
                
                // Ambil data dari clipboard
                const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                
                // Pisahkan berdasarkan Enter (Baris)
                const rowsData = pasteData.split(/\r?\n/).filter(row => row.trim() !== '');

                // Cari sel mana yang sedang difokuskan (diklik)
                const startCell = targetInput.closest('td');
                const startRow = startCell.closest('tr');
                const startColIndex = Array.from(startRow.children).indexOf(startCell);
                
                let currentRow = startRow;

                // Looping Baris yang dipaste
                rowsData.forEach((rowData) => {
                    // Jika baris DOM habis, tambahkan otomatis
                    if (!currentRow) {
                        currentRow = addRow();
                    }
                    
                    // Pisahkan berdasarkan Tab (Kolom Excel)
                    const colsData = rowData.split('\t');
                    let currentColIndex = startColIndex;

                    // Looping Kolom yang dipaste
                    colsData.forEach((colText) => {
                        const cell = currentRow.children[currentColIndex];
                        if (cell) {
                            const input = cell.querySelector('.excel-input');
                            if (input) {
                                // Paste text ke input dan otomatis ubah jadi huruf besar
                                input.value = colText.trim().toUpperCase();
                            }
                        }
                        currentColIndex++;
                    });
                    
                    // Pindah ke baris di bawahnya
                    currentRow = currentRow.nextElementSibling;
                });
            });
        },
        preConfirm: () => {
            const rows = document.querySelectorAll('.pn-row');
            const dataPns = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const pn = row.querySelector('.input-pn').value.trim().toUpperCase();
                const desc = row.querySelector('.input-desc').value.trim().toUpperCase();
                const type = row.querySelector('.input-type').value;
                const uom = row.querySelector('.input-uom').value.trim().toUpperCase();

                // Validasi
                if (!pn || !desc || !uom) {
                    Swal.showValidationMessage(`Baris ${i+1}: Kolom PN, Description, dan UoM wajib diisi!`);
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
            return dataPns;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            config.onSubmit(result.value, config.headerData);
            Swal.fire({ icon: 'success', title: 'Ticket Created!', text: 'Data PN berhasil ditambahkan.', background: 'var(--bg-card)', color: 'var(--text-main)', timer: 2000, showConfirmButton: false });
        }
    });
}
