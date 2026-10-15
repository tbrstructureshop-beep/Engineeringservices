// File: menu/modal/userManagement.js
import { supabase } from '../../config/user/supabaseClient.js';

export async function openUserManagementModal() {
    // Loading awal saat fetch data dari Supabase
    Swal.fire({
        title: 'Memuat data user...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        background: 'var(--bg-card)',
        color: 'var(--text-main)'
    });

    const { data: rawUsers, error } = await supabase
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

    // In-memory state untuk mencegah data ter-reset saat pagination / filtering
    let usersList = (rawUsers || []).map((u, idx) => ({
        _tempId: u.emp_id || `temp_${Date.now()}_${idx}`,
        emp_id: u.emp_id || '',
        name: u.name || '',
        unit: u.unit || '',
        role: u.role || 'Requester',
        status: (u.status || 'APPROVED').toUpperCase() === 'PENDING' ? 'PENDING' : 'APPROVED',
        password: u.password || 'password123',
        initials: u.initials || ''
    }));

    const deletedEmpIds = [];

    // Konfigurasi Table State
    let currentTab = 'ALL'; // 'ALL', 'APPROVED', 'PENDING'
    let globalSearch = '';
    let isFilterActive = false;
    let colFilters = {
        status: '',
        emp_id: '',
        name: '',
        unit: '',
        role: '',
        password: ''
    };
    let currentPage = 1;
    let pageSize = 10; // 10, 25, 50, atau Infinity ('ALL')

    const htmlForm = `
        <style>
            .mgmt-toolbar {
                display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center;
                background: var(--bg-main); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);
            }
            .mgmt-tabs { display: flex; gap: 6px; }
            .mgmt-tab-btn {
                background: transparent; border: 1px solid var(--border-color); color: var(--text-muted);
                padding: 6px 14px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
                display: flex; align-items: center; gap: 6px; transition: all 0.2s;
            }
            .mgmt-tab-btn.active {
                background: var(--primary); color: #fff; border-color: var(--primary);
            }
            .tab-count-badge {
                font-size: 0.72rem; padding: 2px 6px; border-radius: 10px;
                background: rgba(0,0,0,0.12); color: inherit;
            }
            .mgmt-tab-btn.active .tab-count-badge {
                background: rgba(255,255,255,0.25); color: #fff;
            }
            .mgmt-controls {
                display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px;
                justify-content: space-between; font-size: 0.82rem;
            }
            .search-box-wrapper {
                position: relative; display: flex; align-items: center; min-width: 260px;
            }
            .search-box-wrapper i {
                position: absolute; left: 10px; color: var(--text-muted); font-size: 1rem;
            }
            .mgmt-search-input {
                width: 100%; height: 34px; border: 1px solid var(--border-color); border-radius: 6px;
                padding: 0 10px 0 32px; background: var(--bg-card); color: var(--text-main);
                font-size: 0.82rem; outline: none; font-family: inherit;
            }
            .mgmt-search-input:focus { border-color: var(--primary); }
            
            /* Table Styling */
            .user-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 0.82rem; background: var(--bg-card); }
            .user-table th { 
                background: var(--bg-main); color: var(--text-muted); padding: 10px 8px; 
                text-align: center; border: 1px solid var(--border-color); white-space: nowrap;
                vertical-align: middle; line-height: 1.3; font-size: 0.75rem; text-transform: uppercase;
            }
            .user-table td { border: 1px solid var(--border-color); padding: 0; position: relative; }
            .user-input { 
                width: 100%; height: 38px; border: none; background: transparent; 
                padding: 0 10px; font-size: 0.85rem; color: var(--text-main); 
                outline: none; font-family: inherit; box-sizing: border-box;
            }
            .user-input:focus { 
                background: var(--bg-card); 
                box-shadow: inset 0 0 0 2px var(--primary); 
            }
            /* Seamless Select Dropdown */
            select.user-input {
                cursor: pointer; appearance: auto; -webkit-appearance: auto;
            }
            select.user-input option {
                background: var(--bg-card); color: var(--text-main);
            }
            .status-select-approved { color: #166534 !important; font-weight: 700; background: #dcfce7 !important; }
            .status-select-pending { color: #92400e !important; font-weight: 700; background: #fef3c7 !important; }

            /* Filter Row */
            .filter-row th { padding: 4px; background: var(--bg-card); }
            .filter-input {
                width: 100%; height: 26px; border: 1px solid var(--border-color); border-radius: 4px;
                padding: 0 6px; font-size: 0.72rem; background: var(--bg-main); color: var(--text-main);
                outline: none; box-sizing: border-box; font-family: inherit;
            }
            .filter-input:focus { border-color: var(--primary); }

            /* Pagination */
            .mgmt-pagination {
                display: flex; justify-content: space-between; align-items: center;
                margin-top: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap; gap: 10px;
            }
            .pagination-btn {
                background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);
                padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 500;
            }
            .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        </style>

        <!-- Top Header & Tabs -->
        <div class="mgmt-toolbar">
            <div class="mgmt-tabs">
                <button type="button" class="mgmt-tab-btn active" data-tab="ALL">
                    <i class="ph ph-users"></i> All Users <span class="tab-count-badge" id="badge-count-all">0</span>
                </button>
                <button type="button" class="mgmt-tab-btn" data-tab="APPROVED">
                    <i class="ph ph-check-circle"></i> Approved <span class="tab-count-badge" id="badge-count-approved">0</span>
                </button>
                <button type="button" class="mgmt-tab-btn" data-tab="PENDING">
                    <i class="ph ph-clock"></i> Pending <span class="tab-count-badge" id="badge-count-pending">0</span>
                </button>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" id="btn-toggle-filter" class="pagination-btn" style="display:flex; align-items:center; gap:5px;">
                    <i class="ph ph-funnel"></i> <span id="toggle-filter-label">Activate Column Filter</span>
                </button>
                <button type="button" id="btn-approve-all" class="pagination-btn" style="background:#dcfce7; color:#166534; border-color:#bbf7d0; font-weight:600;">
                    <i class="ph ph-checks"></i> Approve All Pending
                </button>
            </div>
        </div>

        <!-- Global Search, Rows Page Size, Add User -->
        <div class="mgmt-controls">
            <div style="display: flex; gap: 10px; align-items: center; flex: 1;">
                <div class="search-box-wrapper">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" id="mgmt-global-search" class="mgmt-search-input" placeholder="Search across all columns...">
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span>Show:</span>
                    <select id="mgmt-page-size" class="mgmt-search-input" style="width: auto; height: 34px; padding: 0 8px;">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="ALL">All Data</option>
                    </select>
                </div>
            </div>
            <div>
                <button id="btn-add-user-row" type="button" class="pagination-btn" style="background: #10b981; color: #fff; border:none; height: 34px; padding: 0 14px; font-weight:600; display:flex; align-items:center; gap:6px;">
                    <i class="ph ph-user-plus"></i> Add User Row
                </button>
            </div>
        </div>

        <!-- Table Container -->
        <div style="margin-top: 10px; overflow-x: auto; max-height: 48vh; border: 1px solid var(--border-color); border-radius: 6px;">
            <table class="user-table">
                <thead style="position: sticky; top: 0; z-index: 10;">
                    <tr>
                        <th style="position: sticky; left: 0; z-index: 11; width: 45px;">ACT</th>
                        <th style="width: 150px;">STATUS REGISTRASI</th>
                        <th style="width: 150px;">EMPLOYEE ID NO.</th>
                        <th style="width: 250px;">FULL NAME</th>
                        <th style="width: 260px;">UNIT / DEPARTMENT</th>
                        <th style="width: 190px;">ROLE</th>
                        <th style="width: 160px;">DEFAULT PASSWORD</th>
                    </tr>
                    <!-- Filter Row (Toggleable) -->
                    <tr id="mgmt-filter-row" class="filter-row" style="display: none;">
                        <th style="position: sticky; left: 0; z-index: 11; text-align:center;">
                            <button id="btn-clear-filters" title="Reset Filters" style="background:none; border:none; cursor:pointer; color:var(--text-muted);"><i class="ph ph-arrow-counter-clockwise"></i></button>
                        </th>
                        <th><input type="text" class="filter-input" data-col="status" placeholder="Filter status..."></th>
                        <th><input type="text" class="filter-input" data-col="emp_id" placeholder="Filter ID..."></th>
                        <th><input type="text" class="filter-input" data-col="name" placeholder="Filter name..."></th>
                        <th><input type="text" class="filter-input" data-col="unit" placeholder="Filter unit..."></th>
                        <th><input type="text" class="filter-input" data-col="role" placeholder="Filter role..."></th>
                        <th><input type="text" class="filter-input" data-col="password" placeholder="Filter pass..."></th>
                    </tr>
                </thead>
                <tbody id="user-mgmt-tbody"></tbody>
            </table>
        </div>

        <!-- Pagination Controls -->
        <div class="mgmt-pagination">
            <span id="mgmt-page-info">Showing 0 to 0 of 0 users</span>
            <div style="display: flex; gap: 6px; align-items: center;">
                <button type="button" class="pagination-btn" id="btn-page-first" title="First Page"><i class="ph ph-caret-double-left"></i></button>
                <button type="button" class="pagination-btn" id="btn-page-prev" title="Previous Page"><i class="ph ph-caret-left"></i> Prev</button>
                <span id="mgmt-page-number" style="font-weight: 600; padding: 0 8px;">Page 1 of 1</span>
                <button type="button" class="pagination-btn" id="btn-page-next" title="Next Page">Next <i class="ph ph-caret-right"></i></button>
                <button type="button" class="pagination-btn" id="btn-page-last" title="Last Page"><i class="ph ph-caret-double-right"></i></button>
            </div>
        </div>
    `;

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
            // Helper Toast Notif
            const showToast = (icon, title) => {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2200,
                    timerProgressBar: true,
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)'
                });
                Toast.fire({ icon, title });
            };

            const tbody = document.getElementById('user-mgmt-tbody');
            const pageInfo = document.getElementById('mgmt-page-info');
            const pageNumber = document.getElementById('mgmt-page-number');
            const btnPrev = document.getElementById('btn-page-prev');
            const btnNext = document.getElementById('btn-page-next');
            const btnFirst = document.getElementById('btn-page-first');
            const btnLast = document.getElementById('btn-page-last');

            // Hitung & update badge tab
            function updateBadges() {
                const total = usersList.length;
                const approved = usersList.filter(u => u.status === 'APPROVED').length;
                const pending = usersList.filter(u => u.status === 'PENDING').length;

                document.getElementById('badge-count-all').textContent = total;
                document.getElementById('badge-count-approved').textContent = approved;
                document.getElementById('badge-count-pending').textContent = pending;
            }

            // Filter logic
            function getFilteredUsers() {
                return usersList.filter(user => {
                    // 1. Tab filter
                    if (currentTab === 'APPROVED' && user.status !== 'APPROVED') return false;
                    if (currentTab === 'PENDING' && user.status !== 'PENDING') return false;

                    // 2. Global search
                    if (globalSearch) {
                        const hay = `${user.emp_id} ${user.name} ${user.unit} ${user.role} ${user.status}`.toLowerCase();
                        if (!hay.includes(globalSearch.toLowerCase())) return false;
                    }

                    // 3. Column contains filters
                    if (isFilterActive) {
                        for (const key of Object.keys(colFilters)) {
                            const val = (colFilters[key] || '').toLowerCase().trim();
                            if (val) {
                                const userVal = (user[key] || '').toLowerCase();
                                if (!userVal.includes(val)) return false;
                            }
                        }
                    }

                    return true;
                });
            }

            // Render baris tabel
            function renderTable() {
                updateBadges();
                const filtered = getFilteredUsers();
                const totalItems = filtered.length;
                const limit = pageSize === Infinity ? totalItems : pageSize;
                const totalPages = Math.max(1, Math.ceil(totalItems / limit));

                if (currentPage > totalPages) currentPage = totalPages;
                if (currentPage < 1) currentPage = 1;

                const startIdx = (currentPage - 1) * limit;
                const endIdx = pageSize === Infinity ? totalItems : Math.min(startIdx + limit, totalItems);
                const pageData = filtered.slice(startIdx, endIdx);

                tbody.innerHTML = '';

                if (pageData.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
                                <i class="ph ph-magnifying-glass" style="font-size: 1.5rem; display:block; margin-bottom: 4px;"></i>
                                Tidak ada data user yang sesuai filter.
                            </td>
                        </tr>
                    `;
                } else {
                    pageData.forEach(user => {
                        const tr = document.createElement('tr');
                        tr.className = 'user-row';
                        tr.dataset.tempid = user._tempId;

                        const isApproved = user.status === 'APPROVED';

                        tr.innerHTML = `
                            <td style="position: sticky; left: 0; background: var(--bg-card); z-index: 2; text-align:center; border-right: 1px solid var(--border-color);">
                                <button class="btn-del-user" data-tempid="${user._tempId}" style="background:none; border:none; color:#ef4444; font-size:1.15rem; cursor:pointer;" title="Delete User">
                                    <i class="ph ph-trash"></i>
                                </button>
                            </td>
                            <td style="padding: 2px;">
                                <select class="user-input select-status ${isApproved ? 'status-select-approved' : 'status-select-pending'}" data-tempid="${user._tempId}" data-field="status">
                                    <option value="APPROVED" ${isApproved ? 'selected' : ''}>APPROVED</option>
                                    <option value="PENDING" ${!isApproved ? 'selected' : ''}>PENDING</option>
                                </select>
                            </td>
                            <td><input type="text" class="user-input" data-tempid="${user._tempId}" data-field="emp_id" placeholder="e.g. 584920" value="${user.emp_id}"></td>
                            <td><input type="text" class="user-input" data-tempid="${user._tempId}" data-field="name" placeholder="Full Name" value="${user.name}"></td>
                            <td><input type="text" class="user-input" data-tempid="${user._tempId}" data-field="unit" placeholder="e.g. TCP-10" value="${user.unit}"></td>
                            <td style="padding: 2px;">
                                <select class="user-input select-role" data-tempid="${user._tempId}" data-field="role">
                                    <option value="Requester" ${user.role === 'Requester' ? 'selected' : ''}>Requester</option>
                                    <option value="Admin TED-2" ${user.role === 'Admin TED-2' ? 'selected' : ''}>Admin TED-2</option>
                                </select>
                            </td>
                            <td><input type="text" class="user-input" data-tempid="${user._tempId}" data-field="password" placeholder="password123" value="${user.password}"></td>
                        `;
                        tbody.appendChild(tr);
                    });
                }

                // Update pagination info
                pageInfo.textContent = totalItems > 0 
                    ? `Showing ${startIdx + 1} to ${endIdx} of ${totalItems} users` 
                    : `Showing 0 to 0 of 0 users`;
                pageNumber.textContent = `Page ${currentPage} of ${totalPages}`;

                btnFirst.disabled = currentPage === 1;
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage >= totalPages;
                btnLast.disabled = currentPage >= totalPages;
            }

            // Sync setiap perubahan input/select ke state array `usersList`
            tbody.addEventListener('input', (e) => {
                const target = e.target;
                const tempId = target.dataset.tempid;
                const field = target.dataset.field;
                if (!tempId || !field) return;

                const user = usersList.find(u => u._tempId === tempId);
                if (user) {
                    user[field] = target.value;
                }
            });

            tbody.addEventListener('change', (e) => {
                const target = e.target;
                const tempId = target.dataset.tempid;
                const field = target.dataset.field;
                if (!tempId || !field) return;

                const user = usersList.find(u => u._tempId === tempId);
                if (user) {
                    user[field] = target.value;
                    if (field === 'status') {
                        if (target.value === 'APPROVED') {
                            target.className = 'user-input select-status status-select-approved';
                        } else {
                            target.className = 'user-input select-status status-select-pending';
                        }
                        updateBadges();
                    }
                }
            });

            // Tab Switching
            document.querySelectorAll('.mgmt-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.mgmt-tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentTab = btn.dataset.tab;
                    currentPage = 1;
                    renderTable();
                });
            });

            // Global Search Input
            document.getElementById('mgmt-global-search').addEventListener('input', (e) => {
                globalSearch = e.target.value.trim();
                currentPage = 1;
                renderTable();
            });

            // Page Size Change
            document.getElementById('mgmt-page-size').addEventListener('change', (e) => {
                const val = e.target.value;
                pageSize = val === 'ALL' ? Infinity : parseInt(val, 10);
                currentPage = 1;
                renderTable();
            });

            // Pagination Buttons
            btnFirst.addEventListener('click', () => { currentPage = 1; renderTable(); });
            btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
            btnNext.addEventListener('click', () => { currentPage++; renderTable(); });
            btnLast.addEventListener('click', () => {
                const filtered = getFilteredUsers();
                const limit = pageSize === Infinity ? filtered.length : pageSize;
                currentPage = Math.max(1, Math.ceil(filtered.length / limit));
                renderTable();
            });

            // Toggle Column Filters
            const filterRow = document.getElementById('mgmt-filter-row');
            const toggleFilterBtn = document.getElementById('btn-toggle-filter');
            const toggleFilterLabel = document.getElementById('toggle-filter-label');

            toggleFilterBtn.addEventListener('click', () => {
                isFilterActive = !isFilterActive;
                if (isFilterActive) {
                    filterRow.style.display = 'table-row';
                    toggleFilterBtn.style.background = '#dbeafe';
                    toggleFilterBtn.style.color = '#1d4ed8';
                    toggleFilterBtn.style.borderColor = '#93c5fd';
                    toggleFilterLabel.textContent = 'Deactivate Column Filter';
                    showToast('info', 'Filter per kolom diaktifkan');
                } else {
                    filterRow.style.display = 'none';
                    toggleFilterBtn.style.background = 'var(--bg-main)';
                    toggleFilterBtn.style.color = 'var(--text-main)';
                    toggleFilterBtn.style.borderColor = 'var(--border-color)';
                    toggleFilterLabel.textContent = 'Activate Column Filter';
                    showToast('info', 'Filter per kolom dinonaktifkan');
                }
                currentPage = 1;
                renderTable();
            });

            // Input Column Filter (Contains)
            document.querySelectorAll('.filter-input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const col = e.target.dataset.col;
                    colFilters[col] = e.target.value;
                    currentPage = 1;
                    renderTable();
                });
            });

            // Reset Filter Inputs
            document.getElementById('btn-clear-filters').addEventListener('click', () => {
                document.querySelectorAll('.filter-input').forEach(inp => inp.value = '');
                Object.keys(colFilters).forEach(k => colFilters[k] = '');
                currentPage = 1;
                renderTable();
                showToast('info', 'Filter kolom di-reset');
            });

            // Tombol Add User Row
            document.getElementById('btn-add-user-row').addEventListener('click', () => {
                const newId = `new_${Date.now()}`;
                const newUser = {
                    _tempId: newId,
                    emp_id: '',
                    name: '',
                    unit: '',
                    role: 'Requester',
                    status: currentTab === 'PENDING' ? 'PENDING' : 'APPROVED',
                    password: 'password123',
                    initials: ''
                };
                usersList.unshift(newUser); // taruh di posisi paling atas
                currentPage = 1;
                renderTable();
                showToast('success', 'Baris user baru ditambahkan!');
            });

            // Tombol Approve All Pending
            document.getElementById('btn-approve-all').addEventListener('click', () => {
                let count = 0;
                usersList.forEach(u => {
                    if (u.status === 'PENDING') {
                        u.status = 'APPROVED';
                        count++;
                    }
                });
                renderTable();
                if (count > 0) {
                    showToast('success', `${count} user pending diubah menjadi APPROVED!`);
                } else {
                    showToast('info', 'Tidak ada user pending yang ditemukan.');
                }
            });

            // Tombol Hapus User dengan Konfirmasi SweetAlert
            tbody.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-del-user');
                if (!btn) return;
                const tempId = btn.dataset.tempid;
                const user = usersList.find(u => u._tempId === tempId);
                if (!user) return;

                Swal.fire({
                    title: 'Hapus User?',
                    text: `Apakah Anda yakin ingin menghapus akun ${user.name || user.emp_id || 'ini'}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Ya, Hapus',
                    cancelButtonText: 'Batal',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)'
                }).then((res) => {
                    if (res.isConfirmed) {
                        if (user.emp_id) {
                            deletedEmpIds.push(user.emp_id);
                        }
                        usersList = usersList.filter(u => u._tempId !== tempId);
                        renderTable();
                        showToast('success', `User ${user.name || user.emp_id} berhasil dihapus.`);
                    }
                });
            });

            // Render pertama kali
            renderTable();
        },
        preConfirm: async () => {
            const upsertPayload = [];

            for (let i = 0; i < usersList.length; i++) {
                const u = usersList[i];
                const emp_id = (u.emp_id || '').trim();
                const name = (u.name || '').trim();
                const unit = (u.unit || '').trim();
                const role = (u.role || 'Requester').trim();
                const status = (u.status || 'APPROVED').toUpperCase() === 'PENDING' ? 'PENDING' : 'APPROVED';
                const password = (u.password || 'password123').trim();

                if (!emp_id || !name) {
                    Swal.showValidationMessage(`Ada user yang Employee ID atau Full Name-nya masih kosong!`);
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
                // 1. Eksekusi hapus di Supabase jika ada user yang dibuang
                if (deletedEmpIds.length > 0) {
                    const { error: delError } = await supabase
                        .from('app_users')
                        .delete()
                        .in('emp_id', deletedEmpIds);
                    if (delError) throw delError;
                }

                // 2. Eksekusi Upsert (insert/update) ke Supabase
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
                title: 'Data Tersimpan di Supabase!',
                text: `${result.value.length} akun berhasil disinkronkan ke cloud database.`,
                timer: 1800,
                showConfirmButton: false,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
            });
        }
    });
}
