// File: menu/existingPartNumber.js
import { openEntryModal } from './modal/entryExistingPNModal.js'; 
import { openNotifModal } from './modal/notifExistingPNModal.js';
import { supabase } from '../config/user/supabaseClient.js';
import { 
    fetchAllTickets, 
    createTicketWithItems, 
    updateTicketAndItems, 
    deleteTicketCompletely 
} from '../config/Transaction/existingPN.js';

export function render(container) {
    container.innerHTML = `
        <style>
            .action-dropdown { position: relative; display: inline-block; }
            .action-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); transition: 0.2s; padding: 4px; border-radius: 4px;}
            .action-btn:hover { background: var(--bg-main); color: var(--primary); }
            
            .dropdown-content-fixed {
                display: none; position: fixed;
                background-color: var(--bg-card); min-width: 170px;
                box-shadow: 0px 4px 15px rgba(0,0,0,0.15); z-index: 9999;
                border-radius: 8px; border: 1px solid var(--border-color);
                flex-direction: column; text-align: left;
            }
            .dropdown-content-fixed.show { display: flex; }
            .dropdown-item {
                padding: 10px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-main); font-weight: 500;
            }
            .dropdown-item:hover { background-color: var(--bg-main); }
            .dropdown-item.text-red { color: #ef4444; }
            .dropdown-item.text-red:hover { background-color: #fef2f2; }
            
            .pn-list { display: flex; flex-wrap: wrap; gap: 6px; }
            .pn-badge { background: var(--bg-main); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; color: var(--text-main); }
        </style>

        <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
                <h3 class="card-title" style="margin-bottom: 5px;"><i class="ph ph-hard-drives"></i> Existing Part Number Tickets</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Manage material tracking by Ticket.</p>
            </div>
            <button id="btn-add-pn" class="btn-submit" style="margin-top: 0;">
                <i class="ph ph-plus-circle"></i> Input New Data
            </button>
        </div>

        <div class="card">
            <h3 class="card-title"><i class="ph ph-table"></i> Dashboard Tiket SAP</h3>
            <div class="table-responsive">
                <table class="data-table" id="table-pn" style="min-width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align:center;">Action</th>
                            <th>Ticket No</th>
                            <th>Status</th>
                            <th>Request Type</th>
                            <th>Requester</th>
                            <th>Requested PNs (MANU_MAT)</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-pn">
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                                <i class="ph ph-spinner ph-spin" style="font-size: 1.5rem;"></i> Memuat tiket dari database...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="global-dropdown" class="dropdown-content-fixed">
            <div class="dropdown-item btn-detail" id="dd-detail"><i class="ph ph-eye"></i> View Detail / Edit</div>
            <div class="dropdown-item" id="dd-notif"><i class="ph ph-envelope-simple"></i> Outlook Notification</div>
            <div class="dropdown-item text-red btn-delete" id="dd-delete"><i class="ph ph-trash"></i> Delete Ticket</div>
        </div>
    `;

    let ticketData = [];

    // 1. STYLING STATUS
    function getStatusStyle(status) {
        if (status === 'Received') return 'background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
        if (status === 'Under Evaluation') return 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;';
        if (status === 'Created') return 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;';
        return 'background: #f1f5f9; color: #475569;';
    }

    // 2. RENDER TABEL
    function renderTable() {
        const tbody = document.getElementById('tbody-pn');
        tbody.innerHTML = ''; 

        if (ticketData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 25px; color: var(--text-muted);">Belum ada tiket tersimpan.</td></tr>`;
            return;
        }

        ticketData.forEach((row, index) => {
            const pnListHTML = (row.pns || []).map(p => `<span class="pn-badge">${p.pn}</span>`).join('');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;">
                    <button class="action-btn drop-trigger" data-index="${index}">
                        <i class="ph ph-dots-three-outline-vertical"></i>
                    </button>
                </td>
                <td style="font-weight: 700; color: var(--primary);">${row.ticketNo}</td>
                <td style="cursor: pointer;" class="btn-status" data-index="${index}" title="Click to Change Status">
                    <span class="status-badge" style="${getStatusStyle(row.status)}">
                        ${row.status} <i class="ph ph-pencil-simple" style="font-size:0.7rem;"></i>
                    </span>
                </td>
                <td><span class="status-badge badge-gray">${row.request}</span></td>
                <td>${row.requester}</td>
                <td><div class="pn-list">${pnListHTML || '-'}</div></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 3. LOAD DATA DARI SUPABASE
    async function loadData() {
        try {
            ticketData = await fetchAllTickets();
            renderTable();
        } catch (err) {
            console.error('Error loadData:', err);
            document.getElementById('tbody-pn').innerHTML = `
                <tr><td colspan="6" style="text-align:center; color:#ef4444; padding:20px;">Gagal memuat tiket dari database!</td></tr>
            `;
        }
    }
    loadData();

    // 4. DROPDOWN DAN ACTIONS
    const globalDropdown = document.getElementById('global-dropdown');
    let activeDropdownIndex = null;

    document.addEventListener('click', () => globalDropdown.classList.remove('show'));

    document.getElementById('tbody-pn').addEventListener('click', (e) => {
        const trigger = e.target.closest('.drop-trigger');
        if (trigger) {
            e.stopPropagation();
            activeDropdownIndex = trigger.getAttribute('data-index');
            const rect = trigger.getBoundingClientRect();
            
            globalDropdown.style.top = `${rect.bottom + 5}px`;
            globalDropdown.style.left = `${rect.left}px`;

            // TAMPILAN LABEL MENU: 'Created' = View Detail (Read-Only), lainnya = Edit Ticket
            const currentStatus = ticketData[activeDropdownIndex].status;
            const detailLabel = document.getElementById('dd-detail');
            if (currentStatus === 'Created') {
                detailLabel.innerHTML = `<i class="ph ph-eye"></i> View Detail (Read-Only)`;
            } else {
                detailLabel.innerHTML = `<i class="ph ph-pencil-simple"></i> Edit Ticket PNs`;
            }

            globalDropdown.classList.add('show');
            return;
        }

        // KLIK UBAH STATUS (UPDATE LANGSUNG KE SUPABASE)
        const btnStatus = e.target.closest('.btn-status');
        if (btnStatus) {
            const idx = btnStatus.getAttribute('data-index');
            const targetTicket = ticketData[idx];

            Swal.fire({
                title: `Change Status: ${targetTicket.ticketNo}`,
                input: 'select',
                inputOptions: { 
                    'Received': 'Received', 
                    'Under Evaluation': 'Under Evaluation', 
                    'Created': 'Created' 
                },
                inputValue: targetTicket.status,
                showCancelButton: true,
                confirmButtonText: 'Update Status',
                confirmButtonColor: 'var(--primary)',
                background: 'var(--bg-card)', color: 'var(--text-main)'
            }).then(async (res) => {
                if (res.isConfirmed) {
                    const { error } = await supabase
                        .from('existing_pn_tickets')
                        .update({ status: res.value })
                        .eq('ticket_no', targetTicket.ticketNo);

                    if (!error) {
                        targetTicket.status = res.value; 
                        renderTable(); 
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Status set to ${res.value}`, showConfirmButton: false, timer: 1500 });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Gagal Ubah Status', text: error.message });
                    }
                }
            });
        }
    });

    // EVENT LISTENER BUKA NOTIFIKASI EMAIL OUTLOOK
    document.getElementById('dd-notif').addEventListener('click', () => {
        const ticket = ticketData[activeDropdownIndex];
        openNotifModal(ticket);
    });

    // 5. DETAIL VIEW / EDIT MODAL
    document.getElementById('dd-detail').addEventListener('click', () => {
        const ticket = ticketData[activeDropdownIndex];
        
        // HANYA 'Created' YANG READ-ONLY; 'Received' & 'Under Evaluation' BISA DIEDIT
        const isReadOnly = (ticket.status === 'Created');

        openEntryModal({
            title: !isReadOnly 
                ? `<i class="ph ph-note-pencil"></i> Edit Ticket (${ticket.status}): ${ticket.ticketNo}` 
                : `<i class="ph ph-file-text"></i> Ticket Details (Created): ${ticket.ticketNo}`,
            headerData: { 
                ticketNo: ticket.ticketNo, 
                requester: ticket.requester, 
                department: ticket.dept 
            },
            initialData: ticket.pns,
            isReadOnly: isReadOnly,
            
            // Simpan Perubahan ke Supabase & Google Drive
            onSubmit: async (updatedPns) => {
                Swal.fire({
                    title: 'Memperbarui Tiket & File...',
                    text: 'Sedang memproses perubahan ke Supabase dan Google Drive...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                    background: 'var(--bg-card)', color: 'var(--text-main)'
                });

                try {
                    await updateTicketAndItems(ticket.ticketNo, updatedPns);
                    await loadData(); // Refresh data riil dari Supabase
                    Swal.fire({ 
                        icon: 'success', 
                        title: 'Data Saved!', 
                        text: 'Data tiket dan dokumen berhasil diperbarui.', 
                        background: 'var(--bg-card)', color: 'var(--text-main)', 
                        timer: 1500, showConfirmButton: false 
                    });
                } catch (err) {
                    console.error('Update ticket error:', err);
                    Swal.fire({ 
                        icon: 'error', 
                        title: 'Gagal Update Tiket', 
                        text: err.message, 
                        background: 'var(--bg-card)', color: 'var(--text-main)' 
                    });
                }
            }
        });
    });

    // 6. DELETE TIKET LENGKAP DENGAN FILE GDRIVE
    document.getElementById('dd-delete').addEventListener('click', () => {
        const ticket = ticketData[activeDropdownIndex];
        Swal.fire({
            title: 'Delete Ticket?',
            text: `Hapus tiket ${ticket.ticketNo}? Seluruh file lampiran di Google Drive juga akan dihapus.`,
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#ef4444',
            background: 'var(--bg-card)', color: 'var(--text-main)'
        }).then(async (res) => {
            if (res.isConfirmed) {
                Swal.fire({
                    title: 'Menghapus Tiket...',
                    text: 'Sedang membersihkan database & file Google Drive...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                    background: 'var(--bg-card)', color: 'var(--text-main)'
                });

                try {
                    await deleteTicketCompletely(ticket.ticketNo);
                    await loadData();
                    Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Tiket berhasil dihapus.', timer: 1500, showConfirmButton: false });
                } catch (err) {
                    console.error('Delete error:', err);
                    Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: err.message });
                }
            }
        });
    });

    // 7. INPUT TIKET BARU (UPLOAD KE GDRIVE + SUPABASE)
    document.getElementById('btn-add-pn').addEventListener('click', () => {
        const randomTicket = Math.floor(100000 + Math.random() * 900000).toString();

        // Ambil user aktif dari session localStorage login saat ini
        let activeUser = { name: 'User', unit: '-', empId: null };
        try {
            const stored = localStorage.getItem('currentUser');
            if (stored) activeUser = JSON.parse(stored);
        } catch (e) {
            console.error('User session error:', e);
        }

        openEntryModal({
            title: '<i class="ph ph-hard-drives"></i> Create New PN Ticket',
            headerData: { 
                ticketNo: randomTicket, 
                requester: activeUser.name || 'User', 
                department: activeUser.unit || '-',
                empId: activeUser.empId || null
            },
            initialData: [],
            isReadOnly: false,
            onSubmit: async (arrayOfPns, header) => {
                Swal.fire({
                    title: 'Menyimpan Tiket Baru...',
                    text: 'Sedang mengunggah file ke Google Drive dan mencatat ke database...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                    background: 'var(--bg-card)', color: 'var(--text-main)'
                });

                try {
                    await createTicketWithItems(header, arrayOfPns);
                    await loadData();
                    Swal.fire({ 
                        icon: 'success', 
                        title: 'Tiket Berhasil Dibuat!', 
                        text: `Tiket No. ${header.ticketNo} berhasil disimpan ke database.`, 
                        background: 'var(--bg-card)', color: 'var(--text-main)', 
                        timer: 1500, showConfirmButton: false 
                    });
                } catch (err) {
                    console.error('Create ticket error:', err);
                    Swal.fire({ 
                        icon: 'error', 
                        title: 'Gagal Menyimpan Tiket', 
                        text: err.message, 
                        background: 'var(--bg-card)', color: 'var(--text-main)' 
                    });
                }
            }
        });
    });
}
