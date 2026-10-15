// File: menu/modal/logOut.js
import { openUserManagementModal } from './userManagement.js';

export function openUserModal(userData = {}) {
    const user = {
        name: userData.name || "Muhammad Rizki F",
        initials: userData.initials || "MR",
        empId: userData.empId || "584920",
        unit: userData.unit || "TCP-10 (Engineering Support)",
        role: userData.role || "Requester",
        ...userData
    };

    // CEK APAKAH USER ADALAH ADMIN
    const isAdmin = user.role.toLowerCase().includes('admin');

    const htmlContent = `
        <style>
            .user-detail-card {
                display: flex; flex-direction: column; align-items: center; padding: 10px 0; text-align: center;
            }
            .profile-avatar-large {
                width: 72px; height: 72px; border-radius: 50%;
                background: linear-gradient(135deg, var(--primary), #3b82f6);
                color: #ffffff; display: flex; align-items: center; justify-content: center;
                font-size: 1.75rem; font-weight: 700; margin-bottom: 12px;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
            }
            .user-badge-role {
                display: inline-block; padding: 3px 10px; border-radius: 20px;
                background: #dbeafe; color: var(--primary); font-size: 0.75rem; font-weight: 600; margin-top: 4px;
            }
            .info-list {
                width: 100%; margin-top: 20px; background: var(--bg-main);
                border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; text-align: left;
            }
            .info-row {
                display: flex; justify-content: space-between; align-items: center;
                padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;
            }
            .info-row:last-child { border-bottom: none; }
            .info-label { color: var(--text-muted); display: flex; align-items: center; gap: 8px; font-weight: 500; }
            .info-value { color: var(--text-main); font-weight: 600; text-align: right; }

            /* Tombol Admin User Management */
            .btn-admin-mgmt {
                width: 100%; margin-top: 15px; padding: 11px 16px;
                background: linear-gradient(135deg, #0f172a, #1e293b);
                color: #ffffff; border: 1px solid rgba(255,255,255,0.15);
                border-radius: 8px; font-size: 0.85rem; font-weight: 600;
                cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
                transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            }
            .btn-admin-mgmt:hover {
                background: var(--primary); border-color: var(--primary);
                transform: translateY(-1px);
            }
        </style>

        <div class="user-detail-card">
            <div class="profile-avatar-large">${user.initials}</div>
            <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 2px;">${user.name}</h3>
            <span class="user-badge-role">${user.role}</span>

            <div class="info-list">
                <div class="info-row">
                    <span class="info-label"><i class="ph ph-user"></i> Nama</span>
                    <span class="info-value">${user.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="ph ph-identification-card"></i> Employee ID No.</span>
                    <span class="info-value">${user.empId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="ph ph-buildings"></i> Unit</span>
                    <span class="info-value">${user.unit}</span>
                </div>
            </div>

            <!-- TOMBOL HANYA MUNCUL JIKA USER ADALAH ADMIN -->
            ${isAdmin ? `
                <button type="button" class="btn-admin-mgmt" id="btn-trigger-user-mgmt">
                    <i class="ph ph-users-three" style="font-size:1.15rem; color:#60a5fa;"></i> User Management (Admin)
                </button>
            ` : ''}
        </div>
    `;

    Swal.fire({
        title: `<span style="font-size: 1.1rem; color: var(--text-main);"><i class="ph ph-user-circle"></i> User Profile</span>`,
        html: htmlContent,
        width: '420px',
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: '<i class="ph ph-sign-out"></i> Log out',
        confirmButtonColor: '#ef4444',
        cancelButtonText: '<i class="ph ph-x"></i> Close',
        cancelButtonColor: '#64748b',
        reverseButtons: true,
        focusConfirm: false,
        didOpen: () => {
            // Pasang event listener jika tombol User Management ada (khusus admin)
            const btnMgmt = document.getElementById('btn-trigger-user-mgmt');
            if (btnMgmt) {
                btnMgmt.addEventListener('click', () => {
                    // Tutup modal profil dan buka modal User Management
                    Swal.close();
                    setTimeout(() => {
                        openUserManagementModal();
                    }, 200);
                });
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Konfirmasi Log Out',
                text: 'Apakah Anda yakin ingin keluar dari sistem?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Ya, Keluar',
                cancelButtonText: 'Batal',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
            }).then((logoutRes) => {
                if (logoutRes.isConfirmed) {
                    localStorage.removeItem('currentUser');
                    Swal.fire({
                        icon: 'success',
                        title: 'Logged Out',
                        text: 'Mengarahkan ke halaman login...',
                        timer: 1200,
                        showConfirmButton: false,
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)'
                    }).then(() => {
                        window.location.replace('menu/loginPage.html');
                    });
                }
            });
        }
    });
}
