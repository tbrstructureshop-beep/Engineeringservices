// File: menu/modal/userManagement.js
import { supabase } from '../../config/user/supabaseClient.js';

export async function openUserManagementModal() {
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
            .user-table td.selected-cell { background-color: rgba(59, 130, 246, 0.2) !important; }
            .quick-btn {
                background: none; border: none; font-size: 0.75rem; cursor: pointer; padding: 6px 12px; border-radius: 6px; font-weight: 600;
            }
            .quick-btn:hover { opacity: 0.85; }
        </style>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 12px 18px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 5px; font-size: 0.85rem; text-align: left;">
            <div>
                <span style="font-weight: 700; color: var(--text-main); font-size: 1rem;"><i class="ph ph-shield-check" style="color:var(--primary);"></i> User Registration & Role Management (Supabase)</span>
                <p style="color: var(--text-muted); font-size: 0.75rem; margin-top: 2px;">Kelola akun aktif, setujui status pendaftaran baru (Pending), atau edit massal.</p>
            </div>
            <div style="display:flex; gap:8px;">
                <button type="button" id="btn-approve-all" class="quick-btn" style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0;">
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
                    <i class="ph ph-info"></i> Support copy/paste Excel langsung ke dalam tabel.
                </span>
            </div>
        </div>
    `;

    const deletedEmpIds = [];

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
                        <button class="btn-del-user" style="background:none; border:none; color:#ef4444; font-size:1.15rem; cursor:pointer;" title="Delete User"><i class="ph ph-trash"></i></button>
                    </td>
                    <td style="text-align:center; padding: 2px;">
                        <input type="text" class="user-input input-status" value="${statusVal}" style="text-align:center; font-weight:700; color:${statusVal === 'APPROVED' ? '#166534' : '#92400e'};" placeholder="APPROVED">
                    </td>
                    <td><input type="text" class="user-input input-empid" placeholder="e.g. 584920" value="${val('emp_id', val('empId'))}"></td>
                    <td><input type="text" class="user-input input-name" placeholder="Full Name" value="${val('name')}"></td>
                    <td><input type="text" class="user-input input-unit" placeholder="e.g. TCP-10" value="${val('unit')}"></td>
                    <td><input type="text" class="user-input input-role" placeholder="Requester / Admin TED-2" value="${val('role', 'Requester')}"></td>
                    <td><input type="text" class="user-input input-password" placeholder="password123" value="${val('password', 'password123')}"></td>
                `;

                tbody.appendChild(tr);
                return tr;
            }

            usersList.forEach(u => addRow(u));

            document.getElementById('btn-add-user-row').addEventListener('click', () => {
                const tr = addRow();
                tr.querySelector('.input-empid').focus();
            });

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

            tbody.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-del-user');
                if (btn) {
                    const row = btn.closest('tr');
                    const empId = row.querySelector('.input-empid').value.trim();
                    if (empId) deletedEmpIds.push(empId);
                    row.remove();
                }
            });

            tbody.addEventListener('input', (e) => {
                if (e.target.classList.contains('input-status')) {
                    const v = e.target.value.trim().toUpperCase();
                    e.target.style.color = (v === 'APPROVED') ? '#166534' : '#92400e';
                }
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
                const role = row.querySelector('.input-role').value.trim();
                let status = row.querySelector('.input-status').value.trim().toUpperCase();
                const password = row.querySelector('.input-password').value.trim() || 'password123';

                if (!emp_id || !name) {
                    Swal.showValidationMessage(`Baris ${i + 1}: Employee ID dan Full Name wajib diisi!`);
                    return false;
                }

                if (status !== 'PENDING') status = 'APPROVED';

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
                // Hapus user yang dibuang jika ada
                if (deletedEmpIds.length > 0) {
                    await supabase.from('app_users').delete().in('emp_id', deletedEmpIds);
                }

                // Upsert ke Supabase
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
                text: `${result.value.length} akun telah disinkronkan ke cloud database.`,
                timer: 1800,
                showConfirmButton: false,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
            });
        }
    });
}
