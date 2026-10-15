// File: menu/modal/userManagement.js

export function openUserManagementModal() {
    // 1. Ambil data users dari localStorage (atau inisialisasi default jika kosong)
    const STORAGE_KEY = 'gmf_users_list';
    let usersList = [];
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            usersList = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Gagal memuat users:", e);
    }

    if (!usersList || usersList.length === 0) {
        usersList = [
            { empId: "584920", name: "Muhammad Rizki F", unit: "TCP-10 (Engineering Support)", role: "Requester", status: "APPROVED", password: "password123" },
            { empId: "589999", name: "Admin TED-2", unit: "TED-2 (Engineering Support)", role: "Admin TED-2", status: "APPROVED", password: "admin123" },
            { empId: "581122", name: "Budi Santoso", unit: "TCP-12", role: "Requester", status: "PENDING", password: "password123" },
            { empId: "582233", name: "Andi Wijaya", unit: "TCP-01", role: "Requester", status: "PENDING", password: "password123" }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usersList));
    }

    let htmlForm = `
        <style>
            .user-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 0.82rem; background: var(--bg-card); user-select: none; }
            .user-table th { 
                background: var(--bg-main); color: var(--text-muted); padding: 12px 10px; 
                text-align: center; border: 1px solid var(--border-color); white-space: nowrap;
                vertical-align: middle; line-height: 1.3; font-size: 0.75rem; text-transform: uppercase;
            }
            .user-table td { border: 1px solid var(--border-color); padding: 0; position: relative; }
            .user-input { 
                width: 100%; height: 38px; border: none; background: transparent; 
                padding: 0 10px; font-size: 0.85rem; color: var(--text-main); 
                outline: none; font-family: inherit;
            }
            .user-input:focus { 
                background: var(--bg-card); 
                box-shadow: inset 0 0 0 2px var(--primary); 
            }
            .user-table td.selected-cell {
                background-color: rgba(59, 130, 246, 0.2) !important;
            }
            .user-table td.selected-cell input {
                background-color: transparent !important; color: transparent; text-shadow: 0 0 0 var(--text-main);
            }
            .status-badge-cell {
                display: inline-flex; align-items: center; justify-content: center;
                gap: 4px; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; cursor: pointer;
            }
            .badge-approved { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
            .badge-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .quick-btn {
                background: none; border: none; font-size: 0.75rem; cursor: pointer; padding: 2px 6px; border-radius: 4px;
                font-weight: 600;
            }
            .quick-btn:hover { text-decoration: underline; }
        </style>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 12px 18px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 5px; font-size: 0.85rem; text-align: left;">
            <div>
                <span style="font-weight: 700; color: var(--text-main); font-size: 1rem;"><i class="ph ph-shield-check" style="color:var(--primary);"></i> User Registration & Role Management</span>
                <p style="color: var(--text-muted); font-size: 0.75rem; margin-top: 2px;">Kelola akun aktif, setujui status pendaftaran baru (Pending), atau tambahkan user massal.</p>
            </div>
            <div style="display:flex; gap:8px;">
                <button type="button" id="btn-approve-all" class="quick-btn" style="background:#dcfce7; color:#166534; padding:6px 12px; border-radius:6px; border:1px solid #bbf7d0;">
                    <i class="ph ph-check-circle"></i> Approve All Pending
                </button>
            </div>
        </div>

        <div style="margin-top: 15px; overflow-x: auto; max-height: 52vh; border: 1px solid var(--border-color); border-radius: 6px;">
            <table class="user-table">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        <th style="position: sticky; left: 0; z-index: 11; width: 45px;">ACT</th>
                        <th style="width: 140px;">STATUS REGISTRASI<br><span style="font-size:0.68rem; font-weight:normal; opacity:0.8;">(APPROVED / PENDING)</span></th>
                        <th style="width: 150px;">EMPLOYEE ID NO.<br><span style="font-size:0.68rem; font-weight:normal; opacity:0.8;">(USERNAME LOGIN)</span></th>
                        <th style="width: 250px;">FULL NAME</th>
                        <th style="width: 280px;">UNIT / DEPARTMENT</th>
                        <th style="width: 180px;">ROLE<br><span style="font-size:0.68rem; font-weight:normal; opacity:0.8;">(REQUESTER / ADMIN TED-2)</span></th>
                        <th style="width: 160px;">DEFAULT PASSWORD</th>
                    </tr>
                </thead>
                <tbody id="user-mgmt-tbody"></tbody>
            </table>
        </div>

        <div style="text-align: left; margin-top: 15px; display: flex; gap: 10px; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 10px; align-items: center;">
                <button id="btn-add-user-row" type="button" class="btn-submit" style="background: #10b981; margin-top:0; padding:8px 16px; font-size:0.85rem;">
                    <i class="ph ph-user-plus"></i> Add User Row
                </button>
                <span style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-main); padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                    <i class="ph ph-info"></i> Support drag-select, Delete, Cut (Ctrl+X), Copy (Ctrl+C), & Paste (Ctrl+V) langsung dari Excel.
                </span>
            </div>
        </div>
    `;

    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;"><i class="ph ph-users-three"></i> Admin User Management</span>`,
        html: htmlForm,
        width: '92vw',
        background: 'var(--bg-card)',
        showCancelButton: true,
        confirmButtonText: '<i class="ph ph-floppy-disk"></i> Save & Apply Changes',
        confirmButtonColor: 'var(--primary)',
        cancelButtonText: '<i class="ph ph-x"></i> Cancel',
        cancelButtonColor: '#64748b',
        focusConfirm: false,
        didOpen: () => {
            const tbody = document.getElementById('user-mgmt-tbody');

            function addRow(data = null) {
                const tr = document.createElement('tr');
                tr.className = 'user-row';

                const val = (prop, fallback = '') => (data && data[prop] !== undefined) ? data[prop] : fallback;
                let statusVal = (val('status', 'APPROVED')).toUpperCase();
                if (statusVal !== 'PENDING') statusVal = 'APPROVED';

                tr.innerHTML = `
                    <td style="position: sticky; left: 0; background: var(--bg-card); z-index: 2; text-align:center; border-right: 1px solid var(--border-color);">
                        <button class="btn-del-user" style="background:none; border:none; color:#ef4444; font-size:1.15rem; cursor:pointer;" tabindex="-1" title="Delete User"><i class="ph ph-trash"></i></button>
                    </td>
                    <td style="text-align:center; padding: 2px;">
                        <input type="text" class="user-input input-status" value="${statusVal}" style="text-align:center; font-weight:700; color:${statusVal === 'APPROVED' ? '#166534' : '#92400e'};" placeholder="APPROVED">
                    </td>
                    <td><input type="text" class="user-input input-empid" placeholder="e.g. 584920" value="${val('empId')}"></td>
                    <td><input type="text" class="user-input input-name" placeholder="Full Name" value="${val('name')}"></td>
                    <td><input type="text" class="user-input input-unit" placeholder="e.g. TCP-10" value="${val('unit')}"></td>
                    <td><input type="text" class="user-input input-role" placeholder="Requester / Admin TED-2" value="${val('role', 'Requester')}"></td>
                    <td><input type="text" class="user-input input-password" placeholder="password123" value="${val('password', 'password123')}"></td>
                `;

                tbody.appendChild(tr);
                return tr;
            }

            // Render data yang ada
            usersList.forEach(u => addRow(u));

            // Tombol tambah baris
            document.getElementById('btn-add-user-row').addEventListener('click', () => {
                const tr = addRow();
                tr.querySelector('.input-empid').focus();
            });

            // Tombol Approve All Pending
            document.getElementById('btn-approve-all').addEventListener('click', () => {
                const rows = tbody.querySelectorAll('.user-row');
                let count = 0;
                rows.forEach(r => {
                    const st = r.querySelector('.input-status');
                    if (st && st.value.trim().toUpperCase() === 'PENDING') {
                        st.value = 'APPROVED';
                        st.style.color = '#166534';
                        count++;
                    }
                });
                Swal.showValidationMessage(`${count} user pending diubah menjadi APPROVED! Klik "Save & Apply Changes" untuk menyimpan.`);
                setTimeout(() => Swal.resetValidationMessage(), 3500);
            });

            // Delete Row
            tbody.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-del-user');
                if (btn) {
                    if (tbody.children.length === 1) {
                        Swal.showValidationMessage('Minimal harus ada 1 user di tabel!');
                    } else {
                        btn.closest('tr').remove();
                        Swal.resetValidationMessage();
                    }
                }
            });

            // Dinamis ubah warna teks status saat diketik
            tbody.addEventListener('input', (e) => {
                if (e.target.classList.contains('input-status')) {
                    const v = e.target.value.trim().toUpperCase();
                    e.target.style.color = (v === 'APPROVED') ? '#166534' : '#92400e';
                }
            });

            // ==========================================
            // EXCEL FEATURES: SELECTION, DELETE, COPY, CUT, PASTE
            // ==========================================
            let isSelecting = false;
            let startCell = null;

            function clearSelection() {
                tbody.querySelectorAll('.selected-cell').forEach(td => td.classList.remove('selected-cell'));
            }

            tbody.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('user-input')) {
                    isSelecting = true;
                    startCell = e.target.closest('td');
                    clearSelection();
                    startCell.classList.add('selected-cell');
                }
            });

            tbody.addEventListener('mouseover', (e) => {
                if (isSelecting && e.target.classList.contains('user-input')) {
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
                            if (cell && cell.querySelector('.user-input')) cell.classList.add('selected-cell');
                        }
                    }
                }
            });

            document.addEventListener('mouseup', () => { isSelecting = false; });

            tbody.addEventListener('keydown', (e) => {
                const input = e.target;
                if (!input.classList.contains('user-input')) return;
                const selectedCells = tbody.querySelectorAll('.selected-cell');
                const isMultiSelected = selectedCells.length > 1;

                // 1. Bulk Delete
                if ((e.key === 'Delete' || e.key === 'Backspace') && isMultiSelected) {
                    e.preventDefault();
                    selectedCells.forEach(td => {
                        const inp = td.querySelector('.user-input');
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
                        const inp = td.querySelector('.user-input');
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
                        const inp = td.querySelector('.user-input');
                        cutText += inp ? inp.value : '';
                        if (inp) inp.value = '';
                    });
                    navigator.clipboard.writeText(cutText);
                }

                // 4. Arrow navigation
                const td = input.closest('td');
                const tr = td.closest('tr');
                const colIdx = Array.from(tr.children).indexOf(td);
                const rowIdx = Array.from(tbody.children).indexOf(tr);

                if (e.key === 'ArrowUp' && tbody.children[rowIdx - 1]) {
                    e.preventDefault();
                    tbody.children[rowIdx - 1].children[colIdx].querySelector('.user-input').focus();
                } else if (e.key === 'ArrowDown' && tbody.children[rowIdx + 1]) {
                    e.preventDefault();
                    tbody.children[rowIdx + 1].children[colIdx].querySelector('.user-input').focus();
                }
            });

            // 5. Smart Paste
            tbody.addEventListener('paste', (e) => {
                const targetInput = e.target.closest('.user-input');
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
                            const input = cell.querySelector('.user-input');
                            if (input) {
                                input.value = colText.replace(/\r?\n/g, ' ').trim();
                                if (input.classList.contains('input-status')) {
                                    const v = input.value.toUpperCase();
                                    input.style.color = (v === 'APPROVED') ? '#166534' : '#92400e';
                                }
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
            const rows = document.querySelectorAll('.user-row');
            const updatedUsers = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const empId = row.querySelector('.input-empid').value.trim();
                const name = row.querySelector('.input-name').value.trim();
                const unit = row.querySelector('.input-unit').value.trim();
                const role = row.querySelector('.input-role').value.trim();
                let status = row.querySelector('.input-status').value.trim().toUpperCase();
                const password = row.querySelector('.input-password').value.trim() || 'password123';

                if (!empId || !name) {
                    Swal.showValidationMessage(`Baris ${i + 1}: Employee ID dan Full Name wajib diisi!`);
                    return false;
                }

                if (status !== 'PENDING') status = 'APPROVED';

                const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "US";

                const userObj = { empId, name, unit, role, status, password, initials };
                updatedUsers.push(userObj);

                // Sinkronkan juga ke key login masing-masing akun
                localStorage.setItem('registeredUsers_' + empId, JSON.stringify(userObj));
            }

            // Simpan seluruh list user ke key utama
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
            return updatedUsers;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Data User Berhasil Disimpan!',
                text: `${result.value.length} akun telah disinkronkan ke sistem.`,
                timer: 1800,
                showConfirmButton: false,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
            });
        }
    });
}
