// File: menu/modal/entryExistingPNModal.js

export function openEntryModal(config) {
    let htmlForm = `
        <style>
            /* STYLING UNTUK EXCEL-LIKE TABLE */
            .excel-table { width: 100%; border-collapse: collapse; min-width: 3800px; font-size: 0.8rem; background: var(--bg-card); user-select: none; }
            
            .excel-table th { 
                background: var(--bg-main); color: var(--text-muted); padding: 12px 10px; 
                text-align: center; border: 1px solid var(--border-color); white-space: nowrap;
                vertical-align: middle; line-height: 1.4;
            }
            
            .excel-table td { 
                border: 1px solid var(--border-color); padding: 0; position: relative;
            }
            
            .excel-input { 
                width: 100%; height: 40px; border: none; background: transparent; 
                padding: 0 10px; font-size: 0.85rem; color: var(--text-main); 
                outline: none; text-transform: uppercase; font-family: inherit;
            }
            
            /* Efek highlight biru saat cell sedang diketik */
            .excel-input:focus { 
                background: var(--bg-card); 
                box-shadow: inset 0 0 0 2px var(--primary); 
            }

            /* EFEK KETIKA BANYAK CELL DI-BLOCK (MULTI-SELECT) */
            .excel-table td.selected-cell {
                background-color: rgba(59, 130, 246, 0.2) !important;
            }
            .excel-table td.selected-cell input {
                background-color: transparent !important;
                color: transparent; /* Sembunyikan warna teks default agar block terlihat jelas */
                text-shadow: 0 0 0 var(--text-main); /* Tetap tampilkan teks menggunakan shadow */
            }
        </style>

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

        <div style="margin-top: 15px; overflow-x: auto; max-height: 55vh; border: 1px solid var(--border-color); border-radius: 4px;">
            <table class="excel-table">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        <th style="position: sticky; left: 0; z-index: 11; width: 40px;">ACT</th>
                        <th>REQUEST</th>
                        <th>DANGEROUS GOOD</th>
                        <th>SHELF LIFE</th>
                        <th>NO</th>
                        <th>MATERIAL TYPE</th>
                        <th>MATERIAL DESCRIPTION (SHORT TEXT)</th>
                        <th>BASE UNIT OF MEASURE</th>
                        <th>MANUFACTURER PART NUMBER</th>
                        <th>NUMBER OF A MANUFACTURER</th>
                        <th>DOCUMENT NUMBER</th>
                        <th>UNSERVICEABLE PLANT</th>
                        <th>UNSERSABLE STORAGE LOCATION</th>
                        <th>REFURBISHMENT PLANT</th>
                        <th>REFURBISHMENT ISSUE STORAGE LOC</th>
                        <th>REFURBISHMENT RECEIPT STORAGE LOC</th>
                        <th>PARENT SHOP</th>
                        <th>PARENT SHOP PLANT</th>
                        <th>SERVICEABLE STORE LOCATION</th>
                        <th>TYPE OF TECHNICAL OBJECT</th>
                        <th>PURCHASING GROUP</th>
                        <th>AIRCRAFT REGISTRATION</th>
                    </tr>
                </thead>
                <tbody id="modal-tbody">
                    <!-- Baris akan digenerate via JS -->
                </tbody>
            </table>
        </div>
        
        <div style="text-align: left; margin-top: 15px; display: flex; gap: 10px; align-items: center;">
            <button id="btn-add-row" type="button" class="btn-submit" style="background: #10b981; margin-top:0;">
                <i class="ph ph-plus-circle"></i> Add Row
            </button>
            <span style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-main); padding: 5px 10px; border-radius: 4px; border: 1px solid var(--border-color);">
                <i class="ph ph-info"></i> Drag to select cells. Support Bulk: Delete, Copy (Ctrl+C), Cut (Ctrl+X), Paste (Ctrl+V).
            </span>
        </div>
    `;

    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;">${config.title}</span>`,
        html: htmlForm,
        width: '98vw',
        background: 'var(--bg-card)', 
        showCancelButton: true,
        confirmButtonText: '<i class="ph ph-paper-plane-right"></i> Submit Ticket',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: '#64748b',
        focusConfirm: false,
        didOpen: () => {
            const tbody = document.getElementById('modal-tbody');
            
            // FUNGSI ADD ROW: Karena dirender ulang sebagai string, PASTI kosong, tidak duplikasi baris atasnya
            function addRow() {
                const tr = document.createElement('tr');
                tr.className = 'pn-row';
                tr.innerHTML = `
                    <td style="position: sticky; left: 0; background: var(--bg-card); z-index: 2; text-align:center; border-right: 1px solid var(--border-color);">
                        <button class="btn-del-row" style="background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;" tabindex="-1" title="Delete Row"><i class="ph ph-trash"></i></button>
                    </td>
                    <td><input type="text" class="excel-input input-req" placeholder="EXISTING PN"></td>
                    <td><input type="text" class="excel-input input-dg" placeholder="NO"></td>
                    <td><input type="text" class="excel-input input-shelf" placeholder="NO"></td>
                    <td><input type="text" class="excel-input input-no" placeholder="1"></td>
                    <td><input type="text" class="excel-input input-type" placeholder="TOOLS"></td>
                    <td><input type="text" class="excel-input input-desc" placeholder="FREEZER"></td>
                    <td><input type="text" class="excel-input input-uom" placeholder="2 EA"></td>
                    <td><input type="text" class="excel-input input-pn" placeholder="CF1633N"></td>
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
                return tr;
            }

            addRow();
            document.getElementById('btn-add-row').addEventListener('click', addRow);

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

            // ==========================================
            // FITUR EXCEL: MULTI-SELECT, BULK DELETE, CUT, COPY
            // ==========================================
            let isSelecting = false;
            let startCell = null;

            function clearSelection() {
                tbody.querySelectorAll('.selected-cell').forEach(td => td.classList.remove('selected-cell'));
            }

            // MOUSE DRAG SELECTION
            tbody.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('excel-input')) {
                    isSelecting = true;
                    startCell = e.target.closest('td');
                    clearSelection();
                    startCell.classList.add('selected-cell');
                }
            });

            tbody.addEventListener('mouseover', (e) => {
                if (isSelecting && e.target.classList.contains('excel-input')) {
                    clearSelection();
                    const endCell = e.target.closest('td');
                    
                    const rows = Array.from(tbody.querySelectorAll('tr'));
                    const startTr = startCell.closest('tr');
                    const endTr = endCell.closest('tr');
                    
                    const startRowIdx = rows.indexOf(startTr);
                    const endRowIdx = rows.indexOf(endTr);
                    
                    const startColIdx = Array.from(startTr.children).indexOf(startCell);
                    const endColIdx = Array.from(endTr.children).indexOf(endCell);

                    const minRow = Math.min(startRowIdx, endRowIdx);
                    const maxRow = Math.max(startRowIdx, endRowIdx);
                    const minCol = Math.min(startColIdx, endColIdx);
                    const maxCol = Math.max(startColIdx, endColIdx);

                    for (let r = minRow; r <= maxRow; r++) {
                        for (let c = minCol; c <= maxCol; c++) {
                            const cell = rows[r].children[c];
                            if (cell && cell.querySelector('.excel-input')) {
                                cell.classList.add('selected-cell');
                            }
                        }
                    }
                }
            });

            document.addEventListener('mouseup', () => { isSelecting = false; });

            // KEYBOARD SHORTCUTS & NAVIGATION
            tbody.addEventListener('keydown', (e) => {
                const input = e.target;
                if (!input.classList.contains('excel-input')) return;

                const selectedCells = tbody.querySelectorAll('.selected-cell');
                const isMultiSelected = selectedCells.length > 1;

                // 1. BULK DELETE
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (isMultiSelected) {
                        e.preventDefault(); // Mencegah hapus history browser
                        selectedCells.forEach(td => {
                            const inp = td.querySelector('.excel-input');
                            if (inp) inp.value = '';
                        });
                    }
                }

                // 2. BULK COPY (Ctrl+C)
                if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && isMultiSelected) {
                    e.preventDefault();
                    let copyText = '';
                    let currentRow = null;
                    
                    selectedCells.forEach(td => {
                        const tr = td.closest('tr');
                        if (currentRow !== tr) {
                            if (currentRow !== null) copyText += '\n'; // Baris baru
                            currentRow = tr;
                        } else {
                            copyText += '\t'; // Kolom baru (Tab)
                        }
                        const inp = td.querySelector('.excel-input');
                        copyText += inp ? inp.value : '';
                    });
                    navigator.clipboard.writeText(copyText);
                }

                // 3. BULK CUT (Ctrl+X)
                if (e.ctrlKey && (e.key === 'x' || e.key === 'X') && isMultiSelected) {
                    e.preventDefault();
                    let cutText = '';
                    let currentRow = null;
                    
                    selectedCells.forEach(td => {
                        const tr = td.closest('tr');
                        if (currentRow !== tr) {
                            if (currentRow !== null) cutText += '\n';
                            currentRow = tr;
                        } else {
                            cutText += '\t';
                        }
                        const inp = td.querySelector('.excel-input');
                        cutText += inp ? inp.value : '';
                        if (inp) inp.value = ''; // Kosongkan cell karena di-cut
                    });
                    navigator.clipboard.writeText(cutText);
                }

                // 4. ARROW KEY NAVIGATION (Seperti Excel)
                const td = input.closest('td');
                const tr = td.closest('tr');
                const colIdx = Array.from(tr.children).indexOf(td);
                const rowIdx = Array.from(tbody.children).indexOf(tr);

                if (e.key === 'ArrowUp') {
                    if (tbody.children[rowIdx - 1]) {
                        e.preventDefault();
                        tbody.children[rowIdx - 1].children[colIdx].querySelector('.excel-input').focus();
                    }
                } else if (e.key === 'ArrowDown') {
                    if (tbody.children[rowIdx + 1]) {
                        e.preventDefault();
                        tbody.children[rowIdx + 1].children[colIdx].querySelector('.excel-input').focus();
                    }
                }
            });

            // ==========================================
            // LOGIKA SMART PASTE (EXCEL KE WEB / BULK PASTE)
            // ==========================================
            tbody.addEventListener('paste', (e) => {
                const targetInput = e.target.closest('.excel-input');
                if (!targetInput) return;

                e.preventDefault();
                const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                const rowsData = pasteData.split(/\r?\n/).filter(row => row !== ''); // Hapus baris benar-benar kosong

                const startCell = targetInput.closest('td');
                const startRow = startCell.closest('tr');
                const startColIndex = Array.from(startRow.children).indexOf(startCell);
                
                let currentRow = startRow;

                rowsData.forEach((rowData) => {
                    if (!currentRow) currentRow = addRow();
                    
                    const colsData = rowData.split('\t');
                    let currentColIndex = startColIndex;

                    colsData.forEach((colText) => {
                        const cell = currentRow.children[currentColIndex];
                        if (cell) {
                            const input = cell.querySelector('.excel-input');
                            if (input) {
                                input.value = colText.trim().toUpperCase();
                            }
                        }
                        currentColIndex++;
                    });
                    currentRow = currentRow.nextElementSibling;
                });
                
                // Hapus blok seleksi setelah paste
                clearSelection();
            });
        },
        preConfirm: () => {
            const rows = document.querySelectorAll('.pn-row');
            const dataPns = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                
                const pn = row.querySelector('.input-pn').value.trim().toUpperCase();
                const desc = row.querySelector('.input-desc').value.trim().toUpperCase();

                if (!pn || !desc) {
                    Swal.showValidationMessage(`Baris ${i+1}: MANU_MAT (PN) & MATL_DESC wajib diisi!`);
                    return false;
                }

                dataPns.push({
                    request: row.querySelector('.input-req').value.trim().toUpperCase(),
                    dangerous: row.querySelector('.input-dg').value.trim().toUpperCase(),
                    shelf: row.querySelector('.input-shelf').value.trim().toUpperCase(),
                    no: row.querySelector('.input-no').value.trim().toUpperCase(),
                    type: row.querySelector('.input-type').value.trim().toUpperCase(),
                    desc: desc,
                    uom: row.querySelector('.input-uom').value.trim().toUpperCase(),
                    pn: pn,
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
            Swal.fire({ icon: 'success', title: 'Ticket Generated!', text: 'Data PN berhasil diproses ke tabel utama.', background: 'var(--bg-card)', color: 'var(--text-main)', timer: 2000, showConfirmButton: false });
        }
    });
}
