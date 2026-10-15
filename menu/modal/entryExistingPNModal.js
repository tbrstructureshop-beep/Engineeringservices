// File: menu/modal/entryExistingPNModal.js

export function openEntryModal(config) {
    let htmlForm = `
        <style>
            /* STYLING UNTUK EXCEL-LIKE TABLE */
            .excel-table { width: 100%; border-collapse: collapse; min-width: 4200px; font-size: 0.8rem; background: var(--bg-card); user-select: none; }
            
            .excel-table th { 
                background: var(--bg-main); color: var(--text-muted); padding: 10px 12px; 
                text-align: center; border: 1px solid var(--border-color); white-space: nowrap;
                vertical-align: middle; line-height: 1.3;
            }

            .th-sub {
                display: block; font-size: 0.72rem; font-weight: normal; opacity: 0.85; margin-top: 3px; color: var(--primary);
            }
            
            .excel-table td { 
                border: 1px solid var(--border-color); padding: 0; position: relative;
            }
            
            .excel-input { 
                width: 100%; height: 40px; border: none; background: transparent; 
                padding: 0 10px; font-size: 0.85rem; color: var(--text-main); 
                outline: none; text-transform: uppercase; font-family: inherit;
            }
            
            .excel-input:focus { 
                background: var(--bg-card); 
                box-shadow: inset 0 0 0 2px var(--primary); 
            }

            .excel-table td.selected-cell {
                background-color: rgba(59, 130, 246, 0.2) !important;
            }
            .excel-table td.selected-cell input {
                background-color: transparent !important;
                color: transparent;
                text-shadow: 0 0 0 var(--text-main);
            }

            /* Tombol Upload Dokumen */
            .btn-doc-upload {
                position: absolute; right: 5px; background: none; border: none; 
                color: var(--primary); font-size: 1.15rem; cursor: pointer; 
                display: flex; align-items: center; justify-content: center;
                padding: 4px; border-radius: 4px; transition: background 0.2s, color 0.2s;
            }
            .btn-doc-upload:hover {
                background: var(--bg-main);
                color: #2563eb;
            }
        </style>

        <!-- Header Info Tiket -->
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

        <!-- Tabel Multi-PN (Excel Style) -->
        <div style="margin-top: 15px; overflow-x: auto; max-height: 55vh; border: 1px solid var(--border-color); border-radius: 4px;">
            <table class="excel-table">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        <th style="position: sticky; left: 0; z-index: 11; width: 45px;">ACT</th>
                        <th>Request</th>
                        <th>Dangerous Good</th>
                        <th>Shelf Life</th>
                        <th>NO</th>
                        <th>MATERIAL TYPE<span class="th-sub">(MATL_TYPE)</span></th>
                        <th>MATERIAL DESCRIPTION (SHORT TEXT)<span class="th-sub">(MATL_DESC)</span></th>
                        <th>BASE UNIT OF MEASURE<span class="th-sub">(BASE_OUM)</span></th>
                        <th>MANUFACTURER PART NUMBER<span class="th-sub">(MANU_MAT (PN))</span></th>
                        <th>NUMBER OF A MANUFACTURER<span class="th-sub">(MFR NO (CAGE CODE))</span></th>
                        <th>DOCUMENT NUMBER(WITHOUT DOCUMENT MANAGEMENT SYSTEM)<span class="th-sub">(DOCUMENT)</span></th>
                        <th>UNSERVICEABLE PLANT<span class="th-sub">(ZZUWERKS)</span></th>
                        <th>UNSERSABLE STORAGE LOCATION<span class="th-sub">(ZZULGORT)</span></th>
                        <th>REFURBISHMENT PLANT<span class="th-sub">(ZZRWERKS)</span></th>
                        <th>REFURBISHMENT ISSUE STORAGE LOCATION<span class="th-sub">(ZZRILGORT)</span></th>
                        <th>REFURBISHMENT RECEIPT STORAGE LOCATION<span class="th-sub">(ZZRRLGORT)</span></th>
                        <th>PARENT SHOP<span class="th-sub">(ZZRARBPL)</span></th>
                        <th>PARENT SHOP PLANT<span class="th-sub">(ZZPWERKS)</span></th>
                        <th>SERVICEABLE STORE LOCATION<span class="th-sub">(ZZSLGORT)</span></th>
                        <th>TYPE OF TECHNICAL OBJECT (A/C TYPE)<span class="th-sub">(ZZEQART)</span></th>
                        <th>PURCHASING GROUP<span class="th-sub">(EKGRP)</span></th>
                        <th>AIRCRAFT REGISTRATION<span class="th-sub">(Reg)</span></th>
                    </tr>
                </thead>
                <tbody id="modal-tbody">
                    <!-- Baris di-generate via JS -->
                </tbody>
            </table>
        </div>
        
        <div style="text-align: left; margin-top: 15px; display: flex; gap: 10px; align-items: center;">
            <button id="btn-add-row" type="button" class="btn-submit" style="background: #10b981; margin-top:0;">
                <i class="ph ph-plus-circle"></i> Add Row
            </button>
            <span style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-main); padding: 5px 10px; border-radius: 4px; border: 1px solid var(--border-color);">
                <i class="ph ph-info"></i> Support drag bulk-select, Delete, Cut (Ctrl+X), Copy (Ctrl+C), Smart Paste (Ctrl+V), dan direct file upload di kolom Document.
            </span>
        </div>

        <!-- Hidden input untuk trigger file selector -->
        <input type="file" id="cell-file-picker" style="display: none;" accept="*/*" />
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
            const filePicker = document.getElementById('cell-file-picker');
            let activeFileInputTarget = null; // Menyimpan input text cell mana yang sedang diisi via upload

            // FUNGSI NOTIFIKASI TOAST SWEET & RINGAN (Tanpa menutup modal utama)
            function showSweetToast(filename, rowNum) {
                let toast = document.getElementById('cell-upload-toast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'cell-upload-toast';
                    toast.style.cssText = `
                        position: fixed; top: 25px; right: 25px; z-index: 99999;
                        background: #10b981; color: white; padding: 12px 20px;
                        border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
                        font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 10px;
                        opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
                        transform: translateY(-15px); pointer-events: none;
                    `;
                    document.body.appendChild(toast);
                }
                toast.innerHTML = `<i class="ph ph-check-circle" style="font-size: 1.3rem;"></i> <span>File <strong>"${filename}"</strong> successfully attached to Row ${rowNum}!</span>`;
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
                
                clearTimeout(toast._timer);
                toast._timer = setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(-15px)';
                }, 3000);
            }

            // FUNGSI ADD ROW: Dijamin kosong & tidak menduplikasi row atasnya
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
                    <td>
                        <div style="position: relative; display: flex; align-items: center; width: 100%;">
                            <input type="text" class="excel-input input-doc" placeholder="DOC / UPLOAD" style="padding-right: 32px;">
                            <button type="button" class="btn-doc-upload" tabindex="-1" title="Upload Attachment File">
                                <i class="ph ph-upload-simple"></i>
                            </button>
                        </div>
                    </td>
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

            // EVENT LISTENER HAPUS BARIS
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

            // EVENT LISTENER TRIGGER UPLOAD FILE PADA KOLOM DOCUMENT
            tbody.addEventListener('click', (e) => {
                const uploadBtn = e.target.closest('.btn-doc-upload');
                if (uploadBtn) {
                    const row = uploadBtn.closest('tr');
                    activeFileInputTarget = row.querySelector('.input-doc');
                    filePicker.value = ''; // Reset nilai picker
                    filePicker.click();
                }
            });

            // SAAT FILE DIPILIH DARI KOMPUTER
            filePicker.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0] && activeFileInputTarget) {
                    const file = e.target.files[0];
                    activeFileInputTarget.value = file.name.toUpperCase();
                    activeFileInputTarget._attachedFile = file; // Simpan objek file untuk backend

                    const rowIdx = Array.from(tbody.children).indexOf(activeFileInputTarget.closest('tr')) + 1;
                    showSweetToast(file.name, rowIdx);
                }
            });

            // ==========================================
            // FITUR EXCEL: MULTI-SELECT, DELETE, CUT, COPY
            // ==========================================
            let isSelecting = false;
            let startCell = null;

            function clearSelection() {
                tbody.querySelectorAll('.selected-cell').forEach(td => td.classList.remove('selected-cell'));
            }

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

                    const minRow = Math.min(rows.indexOf(startTr), rows.indexOf(endTr));
                    const maxRow = Math.max(rows.indexOf(startTr), rows.indexOf(endTr));
                    const minCol = Math.min(Array.from(startTr.children).indexOf(startCell), Array.from(endTr.children).indexOf(endCell));
                    const maxCol = Math.max(Array.from(startTr.children).indexOf(startCell), Array.from(endTr.children).indexOf(endCell));

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

            tbody.addEventListener('keydown', (e) => {
                const input = e.target;
                if (!input.classList.contains('excel-input')) return;

                const selectedCells = tbody.querySelectorAll('.selected-cell');
                const isMultiSelected = selectedCells.length > 1;

                // 1. Bulk Delete
                if ((e.key === 'Delete' || e.key === 'Backspace') && isMultiSelected) {
                    e.preventDefault();
                    selectedCells.forEach(td => {
                        const inp = td.querySelector('.excel-input');
                        if (inp) inp.value = '';
                    });
                }

                // 2. Bulk Copy (Ctrl+C)
                if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && isMultiSelected) {
                    e.preventDefault();
                    let copyText = '';
                    let currentRow = null;
                    selectedCells.forEach(td => {
                        const tr = td.closest('tr');
                        if (currentRow !== tr) {
                            if (currentRow !== null) copyText += '\n';
                            currentRow = tr;
                        } else {
                            copyText += '\t';
                        }
                        const inp = td.querySelector('.excel-input');
                        copyText += inp ? inp.value : '';
                    });
                    navigator.clipboard.writeText(copyText);
                }

                // 3. Bulk Cut (Ctrl+X)
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
                        if (inp) inp.value = '';
                    });
                    navigator.clipboard.writeText(cutText);
                }

                // 4. Arrow Key Navigation
                const td = input.closest('td');
                const tr = td.closest('tr');
                const colIdx = Array.from(tr.children).indexOf(td);
                const rowIdx = Array.from(tbody.children).indexOf(tr);

                if (e.key === 'ArrowUp' && tbody.children[rowIdx - 1]) {
                    e.preventDefault();
                    tbody.children[rowIdx - 1].children[colIdx].querySelector('.excel-input').focus();
                } else if (e.key === 'ArrowDown' && tbody.children[rowIdx + 1]) {
                    e.preventDefault();
                    tbody.children[rowIdx + 1].children[colIdx].querySelector('.excel-input').focus();
                }
            });

            // ==========================================
            // LOGIKA SMART PASTE (Mencegah Enter Terpisah)
            // ==========================================
            tbody.addEventListener('paste', (e) => {
                const targetInput = e.target.closest('.excel-input');
                if (!targetInput) return;

                e.preventDefault();
                const pasteData = (e.clipboardData || window.clipboardData).getData('text');

                function parseExcelPaste(text) {
                    let rows = [];
                    let currentRow = [];
                    let currentCell = '';
                    let insideQuotes = false;

                    for (let i = 0; i < text.length; i++) {
                        let char = text[i];
                        let nextChar = text[i + 1];

                        if (char === '"') {
                            if (insideQuotes && nextChar === '"') {
                                currentCell += '"';
                                i++;
                            } else {
                                insideQuotes = !insideQuotes;
                            }
                        } else if (char === '\t' && !insideQuotes) {
                            currentRow.push(currentCell);
                            currentCell = '';
                        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
                            if (char === '\r' && nextChar === '\n') i++;
                            currentRow.push(currentCell);
                            if (currentRow.some(cell => cell.trim() !== '')) {
                                rows.push(currentRow);
                            }
                            currentRow = [];
                            currentCell = '';
                        } else {
                            currentCell += char;
                        }
                    }
                    if (currentCell !== '' || currentRow.length > 0) {
                        currentRow.push(currentCell);
                        if (currentRow.some(cell => cell.trim() !== '')) rows.push(currentRow);
                    }
                    return rows;
                }

                const parsedRows = parseExcelPaste(pasteData);
                const startCell = targetInput.closest('td');
                const startRow = startCell.closest('tr');
                const startColIndex = Array.from(startRow.children).indexOf(startCell);
                
                let currentRow = startRow;

                parsedRows.forEach((colsData) => {
                    if (!currentRow) currentRow = addRow();
                    let currentColIndex = startColIndex;

                    colsData.forEach((colText) => {
                        const cell = currentRow.children[currentColIndex];
                        if (cell) {
                            const input = cell.querySelector('.excel-input');
                            if (input) {
                                input.value = colText.replace(/\r?\n/g, ' ').trim().toUpperCase();
                            }
                        }
                        currentColIndex++;
                    });
                    currentRow = currentRow.nextElementSibling;
                });
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

                const docInput = row.querySelector('.input-doc');

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
                    doc: docInput.value.trim().toUpperCase(),
                    docFile: docInput._attachedFile || null, // Objek File asli tersimpan di sini
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
