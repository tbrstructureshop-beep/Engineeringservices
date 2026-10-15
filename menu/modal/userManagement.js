// File: menu/modal/userManagement.js
import { supabase } from '../../config/user/supabaseClient.js';

export async function openUserManagementModal() {
    // Toast Notifikasi Cepat
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
    });

    Swal.fire({
        title: 'Memuat data user...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
    });

    // Ambil data users langsung dari Supabase
    const { data: usersList, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: true });

    Swal.close();

    if (error) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Memuat Data',
            text: error.message,
            background: 'var(--bg-card)',
            color: 'var(--text-main)'
        });
        return;
    }

    let htmlForm = `
        <style>
            .user-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 0.82rem; background: var(--bg-card); user-select: none; table-layout: fixed; }
            .user-table th { 
                background: var(--bg-main); color: var(--text-muted); padding: 10px 8px; 
                text-align: center; border: 1px solid var(--border-color); white-space: nowrap;
                vertical-align: middle; line-height: 1.3; font-size: 0.73rem; text-transform: uppercase;
            }
            .user-table td { border: 1px solid var(--border-color); padding: 0; position: relative; height: 38px; }
            
            /* Kontrol Input & Select seragam agar cell tidak rusak */
            .user-input, .user-select { 
                width: 100%; height: 38px; border: none; background: transparent; 
                padding: 0 10px; font-size: 0.84rem; color: var(--text-main); 
                outline: none; font-family: inherit; box-sizing: border-box; margin: 0;
            }
            .user-input:focus, .user-select:focus { 
                background: var(--bg-card); 
                box-shadow: inset 0 0 0 2px var(--primary); 
            }

            /* Custom Select Dropdown agar rapi */
            .user-select {
                cursor: pointer;
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
                background-repeat: no-repeat;
                background-position: right 10px center;
                background-size: 11px;
                padding-right: 26px;
            }
            .user-select option {
                background: var(--bg-card, #ffffff);
                color: var(--text-main, #0f172a);
                font-weight: 500;
            }

            /* Badge/Warna Status */
            .status-approved { color: #166534 !important; font-weight: 700 !important; background-color: rgba(220, 252, 231, 0.35); }
            .status-pending { color: #b45309 !important; font-weight: 700 !important; background-color: rgba(254, 243, 199, 0.35); }

            .user-table td.selected-cell { background-color: rgba(59, 130, 246, 0.2) !important; }

            /* Style Tab Filter */
            .mgmt-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-top: 14px; }
            .mgmt-tab-btn {
                background: none; border: 1px solid var(--border-color); padding: 7px 15px; border-radius: 6px;
                color: var(--text-muted); font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;
                transition: all 0.2s;
            }
            .mgmt-tab-btn:hover { background: var(--bg-main); color: var(--text-main); }
            .mgmt-tab-btn.active {
                background: var(--primary); color: #ffffff; border-color: var(--primary);
                box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
            }
            .mgmt-tab-counter {
                display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 0.7rem; font-weight: 700;
                background: rgba(0,0,0,0.12);
            }
            .mgmt-tab-btn.active .mgmt-tab-counter {
                background: rgba(255,255,255,0.25); color: #ffffff;
            }

            .quick-btn {
                background: none; border: none; font-size: 0.75rem; cursor: pointer; padding: 6px 12px; border-radius: 6px; font-weight: 600;
                display: flex; align-items: center; gap: 6px; transition: all 0.2s;
            }
            .quick-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        </style>

        <!-- Header Info -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 12px 18px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 5px; font-size: 0.85rem; text-align: left;">
            <div>
                <span style="font-weight: 700; color: var(--text-main); font-size: 1rem;"><i class="ph ph-shield-check" style="color:var(--primary);"></i> User Registration & Role Management</span>
                <p style="color: var(--text-muted); font-size: 0.75rem; margin-top: 2px;">Kelola akun aktif, setujui status pendaftaran baru (Pending), atau edit role tanpa mengubah struktur baris.</p>
            </div>
            <div style="display:flex; gap:8px;">
                <button type="button" id="btn-approve-all" class="quick-btn" style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0;">
                    <i class="ph ph-check-circle"></i> Approve All Pending
                </button>
            </div>
        </div>

        <!-- TABS FILTER: ALL, APPROVED, PENDING -->
        <div class="mgmt-tabs">
            <button type="button" class="mgmt-tab-btn active" data-tab="ALL">
                <i class="ph ph-users"></i> All Users <span class="mgmt-tab-counter" id="count-all">0</span>
            </button>
            <button type="button" class="mgmt-tab-btn" data-tab="APPROVED">
                <i class="ph ph-check-circle" style="color:#10b981;"></i> Approved <span class="mgmt-tab-counter" id="count-approved">0</span>
            </button>
            <button type="button" class="mgmt-tab-btn" data-tab="PENDING">
                <i class="ph ph-clock-countdown" style="color:#f59e0b;"></i> Pending Approval <span class="mgmt-tab-counter" id="count-pending">0</span>
            </button>
        </div>

        <!-- TABEL DATA -->
        <div style="margin-top: 10px; overflow-x: auto; max-height: 50vh; border: 1px solid var(--border-color); border-radius: 6px;">
            <table class="user-table">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        <th style="position: sticky; left: 0; z-index: 11; width: 45px;">ACT</th>
                        <th style="width: 160px;">STATUS REGISTRASI</th>
                        <th style="width: 150px;">EMPLOYEE ID NO.</th>
                        <th style="width: 240px;">FULL NAME</th>
                        <th style="width: 260px;">UNIT / DEPARTMENT</th>
                        <th style="width: 190px;">ROLE</th>
                        <th style="width: 160px;">DEFAULT PASSWORD</th>
                    </tr>
                </thead>
                <tbody id="user-mgmt-tbody"></tbody>
            </table>
        </div>

        <!-- FOOTER BUTTONS -->
        <div style="text-align: left; margin-top: 14px; display: flex; gap: 10px; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 10px; align-items: center;">
                <button id="btn-add-user-row" type="button" class="btn-submit" style="background: #10b981; margin-top:0; padding:8px 16px; font-size:0.85rem;">
                    <i class="ph ph-user-plus"></i> Add User Row
                </button>
                <span style="font-size: 0.78rem; color: var(--text-muted); background: var(--bg-main); padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                    <i class="ph ph-info"></i> Support copy/paste Excel langsung & edit dropdown secara instan.
                </span>
            </div>
        </div>
    `;

    const deletedEmpIds = [];
    let currentFilterTab = 'ALL';

    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;"><i class="ph ph-users-three"></i> Admin User Management</span>`,
        html: htmlForm,
        width: '94vw',
        background: 'var(--bg-card)',
        showCancelButton: true,
        confirmButtonText: '<i class="ph ph-floppy-disk"></i> Save & Apply Changes',
        confirmButtonColor: 'var(--primary)',
        cancelButtonText: '<i class="ph ph-x"></i> Cancel',
        cancelButtonColor: '#64748b',
        focusConfirm: false,
        didOpen: () => {
            const tbody = document.getElementById('user-mgmt-tbody');

            // 1. Fungsi Update Angka Counter Tab & Filter Tampilan
            function updateCountersAndFilter() {
                const rows = tbody.querySelectorAll('.user-row');
                let countApproved = 0;
                let countPending = 0;

                rows.forEach(row => {
                    const statusSelect = row.querySelector('.select-status');
                    const statusVal = statusSelect ? statusSelect.value : 'APPROVED';

                    if (statusVal === 'PENDING') {
                        countPending++;
                    } else {
                        countApproved++;
                    }

                    // Terapkan Filter Tab
                    if (currentFilterTab === 'ALL') {
                        row.style.display = '';
                    } else if (currentFilterTab === statusVal) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });

                document.getElementById('count-all').textContent = rows.length;
                document.getElementById('count-approved').textContent = countApproved;
                document.getElementById('count-pending').textContent = countPending;
            }

            // 2. Fungsi Buat Baris Tabel dengan Dropdown
            function addRow(data = null, isNewManual = false) {
                const tr = document.createElement('tr');
                tr.className = 'user-row';

                const val = (prop, fallback = '') => (data && data[prop] !== undefined) ? data[prop] : fallback;
                let statusVal = (val('status', 'APPROVED')).toUpperCase();
                if (statusVal !== 'PENDING') statusVal = 'APPROVED';

                let roleVal = val('role', 'Requester');

                tr.innerHTML = `
                    <td style="position: sticky; left: 0; background: var(--bg-card); z-index: 2; text-align:center; border-right: 1px solid var(--border-color);">
                        <button type="button" class="btn-del-user" style="background:none; border:none; color:#ef4444; font-size:1.15rem; cursor:pointer;" title="Delete User"><i class="ph ph-trash"></i></button>
                    </td>
                    <td>
                        <select class="user-select select-status ${statusVal === 'APPROVED' ? 'status-approved' : 'status-pending'}">
                            <option value="APPROVED" ${statusVal === 'APPROVED' ? 'selected' : ''}>APPROVED</option>
                            <option value="PENDING" ${statusVal === 'PENDING' ? 'selected' : ''}>PENDING</option>
                        </select>
                    </td>
                    <td><input type="text" class="user-input input-empid" placeholder="e.g. 584920" value="${val('emp_id', val('empId'))}"></td>
                    <td><input type="text" class="user-input input-name" placeholder="Full Name" value="${val('name')}"></td>
                    <td><input type="text" class="user-input input-unit" placeholder="e.g. TCP-10" value="${val('unit')}"></td>
                    <td>
                        <select class="user-select select-role">
                            <option value="Requester" ${roleVal === 'Requester' ? 'selected' : ''}>Requester</option>
                            <option value="Admin TED-2" ${roleVal === 'Admin TED-2' ? 'selected' : ''}>Admin TED-2</option>
                        </select>
                    </td>
                    <td><input type="text" class="user-input input-password" placeholder="password123" value="${val('password', 'password123')}"></td>
                `;

                tbody.appendChild(tr);

                // Listener saat status diubah via dropdown
                const selectStatus = tr.querySelector('.select-status');
                selectStatus.addEventListener('change', (e) => {
                    const newStatus = e.target.value;
                    if (newStatus === 'APPROVED') {
                        e.target.className = 'user-select select-status status-approved';
                    } else {
                        e.target.className = 'user-select select-status status-pending';
                    }
                    updateCountersAndFilter();
                    Toast.fire({
                        icon: 'info',
                        title: `Status diubah ke ${newStatus}`
                    });
                });

                // Listener saat role diubah
                const selectRole = tr.querySelector('.select-role');
                selectRole.addEventListener('change', (e) => {
                    Toast.fire({
                        icon: 'info',
                        title: `Role diubah ke ${e.target.value}`
                    });
                });

                updateCountersAndFilter();
                return tr;
            }

            // Render data user awal
            usersList.forEach(u => addRow(u));

            // 3. Logika Tab Filter
            document.querySelectorAll('.mgmt-tab-btn').forEach(tabBtn => {
                tabBtn.addEventListener('click', () => {
                    document.querySelectorAll('.mgmt-tab-btn').forEach(b => b.classList.remove('active'));
                    tabBtn.classList.add('active');
                    currentFilterTab = tabBtn.getAttribute('data-tab');
                    updateCountersAndFilter();
                });
            });

            // 4. Tambah Baris User Baru
            document.getElementById('btn-add-user-row').addEventListener('click', () => {
                const tr = addRow({ status: currentFilterTab === 'PENDING' ? 'PENDING' : 'APPROVED' }, true);
                tr.querySelector('.input-empid').focus();

                Toast.fire({
                    icon: 'success',
                    title: 'Baris user baru ditambahkan'
                });
            });

            // 5. Tombol Approve All Pending
            document.getElementById('btn-approve-all').addEventListener('click', () => {
                const rows = tbody.querySelectorAll('.user-row');
                let count = 0;

                rows.forEach(r => {
                    const select = r.querySelector('.select-status');
                    if (select && select.value === 'PENDING') {
                        select.value = 'APPROVED';
                        select.className = 'user-select select-status status-approved';
                        count++;
                    }
                });

                if (count > 0) {
                    updateCountersAndFilter();
                    Swal.fire({
                        icon: 'success',
                        title: 'Approve Berhasil',
                        text: `${count} user pending telah diubah menjadi APPROVED. Klik 'Save & Apply Changes' untuk menyimpan permanen.`,
                        confirmButtonColor: 'var(--primary)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        timer: 2500
                    });
                } else {
                    Toast.fire({
                        icon: 'info',
                        title: 'Tidak ada user pending saat ini'
                    });
                }
            });

            // 6. Tombol Hapus User dengan Konfirmasi SweetAlert
            tbody.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-del-user');
                if (!btn) return;

                const row = btn.closest('tr');
                const empId = row.querySelector('.input-empid').value.trim();
                const userName = row.querySelector('.input-name').value.trim() || 'User ini';

                Swal.fire({
                    title: 'Hapus User?',
                    html: `Apakah Anda yakin ingin menghapus akun <strong>${userName}</strong> (${empId || 'Tanpa ID'})?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: '<i class="ph ph-trash"></i> Ya, Hapus',
                    cancelButtonText: 'Batal',
                    reverseButtons: true,
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)'
                }).then((confirmRes) => {
                    if (confirmRes.isConfirmed) {
                        if (empId) deletedEmpIds.push(empId);
                        row.remove();
                        updateCountersAndFilter();

                        Toast.fire({
                            icon: 'success',
                            title: `Akun ${userName} dihapus dari tabel`
                        });
                    }
                });
            });

            // 7. Support Paste dari Excel ke Input & Select
            tbody.addEventListener('paste', (e) => {
                const targetInput = e.target.closest('.user-input') || e.target.closest('.user-select');
                if (!targetInput) return;
                e.preventDefault();
                const pasteData = (e.clipboardData || window.clipboardData).getData('text');

                const rowsData = pasteData.trim().split(/\r\n|\n|\r/).map(r => r.split('\t'));
                const startCell = targetInput.closest('td');
                const startRow = startCell.closest('tr');
                const startColIndex = Array.from(startRow.children).indexOf(startCell);
                let currentRow = startRow;

                rowsData.forEach(cols => {
                    if (!currentRow) currentRow = addRow();
                    let currentCol = startColIndex;
                    cols.forEach(val => {
                        const cell = currentRow.children[currentCol];
                        if (cell) {
                            const control = cell.querySelector('.user-input') || cell.querySelector('.user-select');
                            if (control) {
                                const cleanVal = val.trim();
                                if (control.tagName === 'SELECT') {
                                    // Deteksi nilai status atau role
                                    const upper = cleanVal.toUpperCase();
                                    if (upper === 'APPROVED' || upper === 'PENDING') {
                                        control.value = upper;
                                        control.className = `user-select select-status ${upper === 'APPROVED' ? 'status-approved' : 'status-pending'}`;
                                    } else if (upper.includes('ADMIN')) {
                                        control.value = 'Admin TED-2';
                                    } else {
                                        control.value = 'Requester';
                                    }
                                } else {
                                    control.value = cleanVal;
                                }
                            }
                        }
                        currentCol++;
                    });
                    currentRow = currentRow.nextElementSibling;
                });
                updateCountersAndFilter();
                Toast.fire({ icon: 'info', title: 'Data Excel berhasil ditempel (paste)!' });
            });
        },
        preConfirm: async () => {
            const rows = document.querySelectorAll('.user-row');
            const upsertPayload = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const emp_id = row.querySelector('.input-empid').value.trim();
                const name = row.querySelector('.input-name').value.trim();
                const unit = row.querySelector('.input-unit').value.trim();
                const role = row.querySelector('.select-role').value;
                const status = row.querySelector('.select-status').value;
                const password = row.querySelector('.input-password').value.trim() || 'password123';

                if (!emp_id || !name) {
                    Swal.showValidationMessage(`Baris ${i + 1}: Employee ID dan Full Name wajib diisi!`);
                    return false;
                }

                const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "US";

                upsertPayload.push({
                    emp_id,
                    name,
                    unit,
                    role,
                    status,
                    password,
                    initials
                });
            }

            try {
                // Hapus user di Supabase jika ada yang dihapus
                if (deletedEmpIds.length > 0) {
                    await supabase.from('app_users').delete().in('emp_id', deletedEmpIds);
                }

                // Upsert seluruh user ke Supabase
                const { error: upsertError } = await supabase
                    .from('app_users')
                    .upsert(upsertPayload, { onConflict: 'emp_id' });

                if (upsertError) throw upsertError;
                return upsertPayload;
            } catch (err) {
                Swal.showValidationMessage(`Gagal simpan ke Supabase: ${err.message}`);
                return false;
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Perubahan Berhasil Disimpan!',
                text: `${result.value.length} akun telah disinkronkan ke cloud database Supabase.`,
                timer: 2000,
                showConfirmButton: false,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
            });
        }
    });
}
