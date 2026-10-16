// File: menu/modal/entryExistingPNModal.js

export function openEntryModal(config) {
    const isReadOnly = config.isReadOnly || false;
    const initialData = config.initialData || [];

    let htmlForm = `
        <style>
            .excel-table { width: 100%; border-collapse: collapse; min-width: 4200px; font-size: 0.8rem; background: var(--bg-card); user-select: none; }
            .excel-table th { 
                background: var(--bg-main); color: var(--text-muted); padding: 10px 12px; 
                text-align: center; border: 1px solid var(--border-color); white-space: nowrap;
                vertical-align: middle; line-height: 1.3;
            }
            .th-sub { display: block; font-size: 0.72rem; font-weight: normal; opacity: 0.85; margin-top: 3px; color: var(--primary); }
            .excel-table td { border: 1px solid var(--border-color); padding: 0; position: relative; }
            
            .excel-input { 
                width: 100%; height: 40px; border: none; background: transparent; 
                padding: 0 10px; font-size: 0.85rem; color: var(--text-main); 
                outline: none; text-transform: uppercase; font-family: inherit;
            }
            .excel-input:focus { 
                background: var(--bg-card); 
                box-shadow: ${isReadOnly ? 'none' : 'inset 0 0 0 2px var(--primary)'}; 
            }
            .excel-input[readonly] { cursor: default; }

            .excel-table td.selected-cell { background-color: rgba(59, 130, 246, 0.2) !important; }
            .excel-table td.selected-cell input { background-color: transparent !important; color: transparent; text-shadow: 0 0 0 var(--text-main); }

            .btn-doc-action {
                position: absolute; right: 5px; background: none; border: none; 
                color: var(--primary); font-size: 1.15rem; cursor: pointer; 
                display: flex; align-items: center; justify-content: center;
                padding: 4px; border-radius: 4px; transition: 0.2s;
            }
            .btn-doc-action:hover { background: var(--bg-main); color: #2563eb; }

            /* Ganti / sesuaikan bagian .btn-doc-action */
            .doc-actions-container {
                position: absolute; 
                right: 5px; 
                top: 50%; 
                transform: translateY(-50%);
                display: flex; 
                align-items: center; 
                gap: 3px; 
                z-index: 3;
            }
            
            .btn-doc-action {
                background: none; 
                border: none; 
                color: var(--primary); 
                font-size: 1.1rem; 
                cursor: pointer; 
                display: inline-flex; 
                align-items: center; 
                justify-content: center;
                padding: 3px; 
                border-radius: 4px; 
                transition: 0.2s;
            }
            .btn-doc-action:hover { 
                background: var(--bg-main); 
                color: #1d4ed8; 
            }
        </style>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 10px; font-size: 0.85rem; text-align: left;">
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
            <div>
                <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Status Mode</div>
                <div style="font-weight: 700; font-size: 0.85rem;">
                    ${isReadOnly 
                        ? '<span style="color:#eab308;"><i class="ph ph-lock"></i> READ ONLY (CREATED)</span>' 
                        : '<span style="color:#10b981;"><i class="ph ph-pencil-line"></i> EDITABLE</span>'}
                </div>
            </div>
        </div>

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
                <tbody id="modal-tbody"></tbody>
            </table>
        </div>
        
        <div style="text-align: left; margin-top: 15px; display: flex; gap: 10px; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 10px; align-items: center;">
                ${!isReadOnly ? `
                    <button id="btn-add-row" type="button" class="btn-submit" style="background: #10b981; margin-top:0;">
                        <i class="ph ph-plus-circle"></i> Add Row
                    </button>
                    <span style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-main); padding: 5px 10px; border-radius: 4px; border: 1px solid var(--border-color);">
                        <i class="ph ph-info"></i> Edit Mode: Drag-select, Bulk Delete, Copy (Ctrl+C), Cut (Ctrl+X), & Smart Paste aktif.
                    </span>
                ` : `
                    <span style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-main); padding: 5px 10px; border-radius: 4px; border: 1px solid var(--border-color);">
                        <i class="ph ph-lock-key"></i> Mode View Detail: Data terkunci (Read-Only) karena tiket sudah berstatus 'Created'. Klik ikon file di kolom Document untuk mengunduh lampiran.
                    </span>
                `}
            </div>
        </div>

        <input type="file" id="cell-file-picker" style="display: none;" accept="*/*" />
    `;

    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;">${config.title}</span>`,
        html: htmlForm,
        width: '98vw',
        background: 'var(--bg-card)', 
        showCancelButton: !isReadOnly,
        confirmButtonText: isReadOnly ? '<i class="ph ph-x"></i> Close View' : '<i class="ph ph-floppy-disk"></i> Save / Submit Ticket',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: '#64748b',
        focusConfirm: false,
        didOpen: () => {
            const tbody = document.getElementById('modal-tbody');
            const filePicker = document.getElementById('cell-file-picker');
            let activeFileInputTarget = null;

            // Helper render tombol dokumen (View / Replace / Upload)
            function getDocButtonsHTML(hasDocFile) {
                if (isReadOnly) {
                    return hasDocFile ? `
                        <button type="button" class="btn-doc-action btn-doc-view" tabindex="-1" title="Lihat / Download File">
                            <i class="ph ph-eye"></i>
                        </button>` : '';
                }

                // MODE EDIT:
                if (hasDocFile) {
                    return `
                        <button type="button" class="btn-doc-action btn-doc-view" tabindex="-1" title="Lihat File Sebelumnya">
                            <i class="ph ph-eye"></i>
                        </button>
                        <button type="button" class="btn-doc-action btn-doc-upload" tabindex="-1" title="Ganti / Upload Ulang File">
                            <i class="ph ph-arrows-clockwise"></i>
                        </button>
                    `;
                }

                // Jika belum ada dokumen sama sekali:
                return `
                    <button type="button" class="btn-doc-action btn-doc-upload" tabindex="-1" title="Upload File">
                        <i class="ph ph-upload-simple"></i>
                    </button>
                `;
            }

            // File: menu/modal/entryExistingPNModal.js -> di dalam didOpen: () => { ... }

            function addRow(data = null) {
                const tr = document.createElement('tr');
                tr.className = 'pn-row';
                const roAttr = isReadOnly ? 'readonly' : '';
                
                // Helper: Ambil data jika ada (mode edit), jika tiket baru (data == null) kosongkan bersih ("")
                const val = (prop) => (data && data[prop] !== undefined) ? data[prop] : '';
                
                // Nomor baris otomatis (1, 2, 3...)
                const currentRowNo = (data && data.no) ? data.no : (tbody.children.length + 1);
                
                // Nilai bersih (kosong jika baru)
                const reqVal = val('request'); 
                const dgVal  = val('dangerous');
                const shelfVal = val('shelf');
                const docVal = val('doc');
                const hasFile = Boolean(docVal || (data && (data.docFile || data.gdriveUrl)));
                
                tr.innerHTML = `
                    <td style="position: sticky; left: 0; background: var(--bg-card); z-index: 2; text-align:center; border-right: 1px solid var(--border-color);">
                        ${!isReadOnly ? `
                            <button class="btn-del-row" style="background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;" tabindex="-1" title="Delete Row"><i class="ph ph-trash"></i></button>
                        ` : `<span style="color: var(--text-muted); font-size:0.75rem;">-</span>`}
                    </td>
                    <td><input type="text" class="excel-input input-req" value="${reqVal}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-dg" value="${dgVal}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-shelf" value="${shelfVal}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-no" value="${currentRowNo}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-type" value="${val('type')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-desc" value="${val('desc')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-uom" value="${val('uom')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-pn" value="${val('pn')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-mfr" value="${val('mfr')}" ${roAttr}></td>
                    <td>
                        <div style="position: relative; display: flex; align-items: center; width: 100%;">
                            <input type="text" class="excel-input input-doc" value="${docVal}" style="padding-right: 58px;" ${roAttr}>
                            <div class="doc-actions-container" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 3px; z-index: 3;">
                                ${getDocButtonsHTML(hasFile)}
                            </div>
                        </div>
                    </td>
                    <td><input type="text" class="excel-input input-uplant" value="${val('uplant')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-uloc" value="${val('uloc')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-rplant" value="${val('rplant')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-riss" value="${val('riss')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-rrec" value="${val('rrec')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-pshop" value="${val('pshop')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-pplant" value="${val('pplant')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-sloc" value="${val('sloc')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-ac" value="${val('ac')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-pur" value="${val('pur')}" ${roAttr}></td>
                    <td><input type="text" class="excel-input input-reg" value="${val('reg')}" ${roAttr}></td>
                `;
            
                if (data && data.docFile) {
                    tr.querySelector('.input-doc')._attachedFile = data.docFile;
                } else if (data && data.gdriveUrl) {
                    tr.querySelector('.input-doc')._attachedFile = data.gdriveUrl;
                }
            
                tbody.appendChild(tr);
                return tr;
            }

            if (initialData.length > 0) {
                initialData.forEach(item => addRow(item));
            } else {
                addRow();
            }

            if (!isReadOnly) {
                document.getElementById('btn-add-row').addEventListener('click', () => addRow());

                tbody.addEventListener('click', (e) => {
                    const btn = e.target.closest('.btn-del-row');
                    if (btn) {
                        if (tbody.children.length === 1) {
                            Swal.showValidationMessage('Minimal harus ada 1 material di tiket!');
                        } else {
                            btn.closest('tr').remove();
                            Swal.resetValidationMessage();
                        }
                    }
                });
            }

            // KLIK TOMBOL DOKUMEN: PREVIEW / LIHAT vs UPLOAD / REPLACE
            tbody.addEventListener('click', (e) => {
                const viewBtn = e.target.closest('.btn-doc-view');
                const uploadBtn = e.target.closest('.btn-doc-upload');
            
                // 1. AKSI MELIHAT FILE SEBELUMNYA
                if (viewBtn) {
                    e.stopPropagation();
                    const row = viewBtn.closest('tr');
                    const docInput = row.querySelector('.input-doc');
                    const attachedFile = docInput._attachedFile;
            
                    if (attachedFile instanceof File || attachedFile instanceof Blob) {
                        // Buka file fisik (PDF / Gambar) di tab baru browser
                        const fileUrl = URL.createObjectURL(attachedFile);
                        window.open(fileUrl, '_blank');
                    } else if (typeof attachedFile === 'string' && (attachedFile.startsWith('http://') || attachedFile.startsWith('https://'))) {
                        window.open(attachedFile, '_blank');
                    } else if (docInput.value) {
                        Swal.showValidationMessage(`File Tercatat: "${docInput.value}" (File fisik belum diunggah ulang pada sesi peramban ini).`);
                    } else {
                        Swal.showValidationMessage('Tidak ada lampiran dokumen di baris ini.');
                    }
                    return;
                }
            
                // 2. AKSI MENGGANTI ATAU UPLOAD FILE BARU
                if (uploadBtn) {
                    e.stopPropagation();
                    const row = uploadBtn.closest('tr');
                    activeFileInputTarget = row.querySelector('.input-doc');
                    filePicker.value = '';
                    filePicker.click();
                    return;
                }
            });

            filePicker.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0] && activeFileInputTarget) {
                    const file = e.target.files[0];
                    activeFileInputTarget.value = file.name.toUpperCase();
                    activeFileInputTarget._attachedFile = file;
            
                    // Otomatis ubah tombol di samping input menjadi tombol View + Replace
                    const container = activeFileInputTarget.parentElement.querySelector('.doc-actions-container');
                    if (container) {
                        container.innerHTML = `
                            <button type="button" class="btn-doc-action btn-doc-view" tabindex="-1" title="Lihat File Baru">
                                <i class="ph ph-eye"></i>
                            </button>
                            <button type="button" class="btn-doc-action btn-doc-upload" tabindex="-1" title="Ganti Lagi">
                                <i class="ph ph-arrows-clockwise"></i>
                            </button>
                        `;
                    }
                    Swal.resetValidationMessage();
                }
            });

            // FITUR EXCEL GRID (Hanya aktif jika Editable)
            if (!isReadOnly) {
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
                                if (cell && cell.querySelector('.excel-input')) cell.classList.add('selected-cell');
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

                    if ((e.key === 'Delete' || e.key === 'Backspace') && isMultiSelected) {
                        e.preventDefault();
                        selectedCells.forEach(td => {
                            const inp = td.querySelector('.excel-input');
                            if (inp) inp.value = '';
                        });
                    }

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
                });

                tbody.addEventListener('paste', (e) => {
                    const targetInput = e.target.closest('.excel-input');
                    if (!targetInput) return;
                    e.preventDefault();
                    const pasteData = (e.clipboardData || window.clipboardData).getData('text');

                    function parseExcelPaste(text) {
                        let rows = []; let currentRow = []; let currentCell = ''; let insideQuotes = false;
                        for (let i = 0; i < text.length; i++) {
                            let char = text[i]; let nextChar = text[i + 1];
                            if (char === '"') {
                                if (insideQuotes && nextChar === '"') { currentCell += '"'; i++; }
                                else { insideQuotes = !insideQuotes; }
                            } else if (char === '\t' && !insideQuotes) {
                                currentRow.push(currentCell); currentCell = '';
                            } else if ((char === '\n' || char === '\r') && !insideQuotes) {
                                if (char === '\r' && nextChar === '\n') i++;
                                currentRow.push(currentCell);
                                if (currentRow.some(c => c.trim() !== '')) rows.push(currentRow);
                                currentRow = []; currentCell = '';
                            } else { currentCell += char; }
                        }
                        if (currentCell !== '' || currentRow.length > 0) {
                            currentRow.push(currentCell);
                            if (currentRow.some(c => c.trim() !== '')) rows.push(currentRow);
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
                                if (input) input.value = colText.replace(/\r?\n/g, ' ').trim().toUpperCase();
                            }
                            currentColIndex++;
                        });
                        currentRow = currentRow.nextElementSibling;
                    });
                    clearSelection();
                });
            }
        },
        preConfirm: () => {
            if (isReadOnly) return true;

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
                    docFile: docInput._attachedFile || null,
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
        if (result.isConfirmed && !isReadOnly && config.onSubmit) {
            config.onSubmit(result.value, config.headerData);
            Swal.fire({ 
                icon: 'success', 
                title: 'Data Saved!', 
                text: 'Data tiket berhasil diperbarui.', 
                background: 'var(--bg-card)', color: 'var(--text-main)', 
                timer: 1500, showConfirmButton: false 
            });
        }
    });
}
