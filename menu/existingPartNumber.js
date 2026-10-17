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
import { createNotification } from '../config/notification.js';
import { ExistingPNFilterManager } from './searchAndFilters/ExistingNewPN.js';
import { exportTicketToExcel } from './getExcelFile/existingNewPN.js';

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
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <!-- Global Quick Search Bar -->
                <div style="position: relative; display: flex; align-items: center;">
                    <i class="ph ph-magnifying-glass" style="position: absolute; left: 10px; color: var(--text-muted); font-size: 1rem; pointer-events: none;"></i>
                    <input type="text" id="global-search-input" placeholder="Quick search ticket / PN..." style="padding: 8px 12px 8px 32px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card); color: var(--text-main); font-size: 0.85rem; outline: none; width: 220px; transition: 0.2s;">
                </div>
                
                <button type="button" id="btn-toggle-filter-mode" style="background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); padding: 9px 14px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: 0.2s;">
                    <i class="ph ph-funnel" style="font-size: 1.1rem; color: var(--primary);"></i> <span id="label-filter-mode">Filter Mode</span>
                </button>
                <button type="button" id="btn-open-analytics" style="background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); padding: 9px 14px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: 0.2s;">
                    <i class="ph ph-chart-pie-slice" style="font-size: 1.1rem; color: #8b5cf6;"></i> Analytics
                </button>
                <button id="btn-add-pn" class="btn-submit" style="margin-top: 0;">
                    <i class="ph ph-plus-circle"></i> Input New Data
                </button>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                <h3 class="card-title" style="margin-bottom: 0;"><i class="ph ph-table"></i> Dashboard Tiket SAP</h3>
                <div id="filter-indicator-box" style="display: none; align-items: center; gap: 8px;">
                    <span style="font-size: 0.8rem; background: #eff6ff; color: var(--primary); padding: 4px 10px; border-radius: 6px; font-weight: 600; border: 1px solid #bfdbfe;">
                        <i class="ph ph-funnel"></i> Filter: <b id="filter-ticket-label">#</b>
                    </span>
                    <button type="button" id="btn-reset-filter" style="background: none; border: 1px solid var(--border-color); color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                        <i class="ph ph-x-circle"></i> Clear Filter
                    </button>
                </div>
            </div>
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
                            <th>Timeline & Dates</th>
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
            <div class="dropdown-item" id="dd-excel"><i class="ph ph-file-xls" style="color: #10b981;"></i> Download Excel</div>
            <div class="dropdown-item text-red btn-delete" id="dd-delete"><i class="ph ph-trash"></i> Delete Ticket</div>
        </div>
    `;

    let ticketData = [];
    let activeFilterTicket = null;
    let globalSearchKeyword = '';

    const filterManager = new ExistingPNFilterManager({
        onFilterApplied: () => {
            renderTable(); // Re-render tabel setiap kali filter checklist diubah
        }
    });

    // 1. STYLING STATUS
    function getStatusStyle(status) {
        if (status === 'Received') return 'background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
        if (status === 'Under Evaluation') return 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;';
        if (status === 'Created') return 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;';
        return 'background: #f1f5f9; color: #475569;';
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
    
        // Menggunakan en-GB agar urutannya Day Month Year (DD MMM YYYY)
        return d.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        }).toUpperCase(); // Hasil: "16 OCT 2026"
    }

    // 2. RENDER TABEL
    function renderTable() {
        const tbody = document.getElementById('tbody-pn');
        tbody.innerHTML = ''; 

        // Update tampilan indikator filter di atas tabel
        const filterBox = document.getElementById('filter-indicator-box');
        const filterLabel = document.getElementById('filter-ticket-label');
        if (filterBox && filterLabel) {
            if (activeFilterTicket) {
                filterBox.style.display = 'flex';
                filterLabel.textContent = '#' + activeFilterTicket;
            } else {
                filterBox.style.display = 'none';
            }
        }

        // Terapkan filter jika ada
        let filteredDataset = filterManager.getFilteredData();

        // 2. Terapkan Quick Search Bar Global (Normalized Case)
        if (globalSearchKeyword) {
            const kw = globalSearchKeyword.toLowerCase().trim();
            filteredDataset = filteredDataset.filter(row => {
                const pnsStr = (row.pns || []).map(p => p.pn).join(' ').toLowerCase();
                return (row.ticketNo && row.ticketNo.toLowerCase().includes(kw)) ||
                       (row.status && row.status.toLowerCase().includes(kw)) ||
                       (row.request && row.request.toLowerCase().includes(kw)) ||
                       (row.requester && row.requester.toLowerCase().includes(kw)) ||
                       (row.dept && row.dept.toLowerCase().includes(kw)) ||
                       pnsStr.includes(kw);
            });
        }

        // 3. Terapkan Filter Notifikasi (jika ada tiket yang diklik dari lonceng)
        const displayedTickets = activeFilterTicket 
            ? filteredDataset.filter(t => t.ticketNo === activeFilterTicket)
            : filteredDataset;

        if (displayedTickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 25px; color: var(--text-muted);">${activeFilterTicket ? `Tiket #${activeFilterTicket} tidak ditemukan di database.` : 'Belum ada tiket tersimpan.'}</td></tr>`;
            return;
        }

        displayedTickets.forEach((row) => {
            // Ambil index asli dari ticketData agar aksi edit/status tetap akurat saat difilter
            const originalIndex = ticketData.indexOf(row);
            const pnListHTML = (row.pns || []).map(p => `<span class="pn-badge">${p.pn}</span>`).join('');

            // Beri sorotan latar jika baris ini berasal dari klik notifikasi
            const isHighlighted = activeFilterTicket && row.ticketNo === activeFilterTicket;
            const highlightStyle = isHighlighted ? 'background-color: rgba(37, 99, 235, 0.05);' : '';

            const tr = document.createElement('tr');
            tr.style.cssText = highlightStyle;
            tr.innerHTML = `
                <td style="text-align:center;">
                    <button class="action-btn drop-trigger" data-index="${originalIndex}">
                        <i class="ph ph-dots-three-outline-vertical"></i>
                    </button>
                </td>
                <td style="font-weight: 700; color: var(--primary);">${row.ticketNo}</td>
                <td style="cursor: pointer;" class="btn-status" data-index="${originalIndex}" title="Click to Change Status">
                    <span class="status-badge" style="${getStatusStyle(row.status)}">
                        ${row.status} <i class="ph ph-pencil-simple" style="font-size:0.7rem;"></i>
                    </span>
                </td>
                <td><span class="status-badge badge-gray">${row.request}</span></td>
                <td>
                    <b>${row.requester}</b>
                    <div style="font-size: 0.72rem; color: var(--primary); font-weight: 600;">Unit: ${row.dept || '-'}</div>
                </td>
                <td><div class="pn-list">${pnListHTML || '-'}</div></td>

                <!-- KOLOM TIMELINE -->
                <td style="font-size: 0.75rem; line-height: 1.4; color: var(--text-muted); white-space: nowrap;">
                    <div><i class="ph ph-calendar-plus" style="color:var(--primary);"></i> <b>Sub:</b> ${formatDateTime(row.createdAt)}</div>
                    <div><i class="ph ph-clock-clockwise" style="color:#f59e0b;"></i> <b>Upd:</b> ${formatDateTime(row.updatedAt)}</div>
                    ${row.closedAt ? `<div><i class="ph ph-check-circle" style="color:#10b981;"></i> <b>Closed:</b> ${formatDateTime(row.closedAt)}</div>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // 3. LOAD DATA DARI SUPABASE
    async function loadData() {
        try {
            ticketData = await fetchAllTickets();
            filterManager.setDataset(ticketData);
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

            // --- CEK OTORISASI ROLE ---
            let activeUser = { name: 'Admin', role: 'Requester', unit: '-' };
            try { const stored = localStorage.getItem('currentUser'); if (stored) activeUser = JSON.parse(stored); } catch (e) {}
            const isTed = (activeUser.role && activeUser.role.toUpperCase().includes('TED')) || (activeUser.unit && activeUser.unit.toUpperCase().includes('TED'));

            if (!isTed) {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Hanya Admin TED-2 yang diizinkan untuk mengubah status tiket.', background: 'var(--bg-card)', color: 'var(--text-main)' });
                return;
            }
            // --------------------------

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

                        // --- PEMICU NOTIFIKASI KE UNIT PENGAJU ---
                        const isCompleted = res.value === 'Created';
                        await createNotification({
                            serviceType: 'EXISTING_PN',
                            ticketNo: targetTicket.ticketNo,
                            senderName: activeUser.name || 'Admin',
                            senderUnit: activeUser.unit || 'TED-2',
                            targetUnit: targetTicket.dept, // Dikirim balik ke unit pengaju tiket tersebut
                            title: isCompleted ? 'Existing PN Created on SAP' : `Ticket Status: ${res.value}`,
                            message: isCompleted 
                                ? `Your Existing PN Request Ticket #${targetTicket.ticketNo} Already Completed and Created on SAP`
                                : `Your Existing PN Request Ticket #${targetTicket.ticketNo} Updated By ${activeUser.unit || 'TED-2'} (${res.value}) check for detail`
                        });
                        // ------------------------------------------

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
    document.getElementById('dd-detail').addEventListener('click', async () => {
        const ticket = ticketData[activeDropdownIndex];

        // --- VALIDASI JUST-IN-TIME (Mencegah Stale Data) ---
        Swal.fire({ title: 'Memeriksa akses...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-card)', color: 'var(--text-main)' });
        
        // Tarik status paling update detik ini dari database
        const { data: freshData, error: fetchErr } = await supabase
            .from('existing_pn_tickets')
            .select('status')
            .eq('ticket_no', ticket.ticketNo)
            .single();
            
        if (!fetchErr && freshData) {
            ticket.status = freshData.status; // Update data memori lokal
            renderTable(); // Update badge di background
        }
        Swal.close();
        // ---------------------------------------------------
        
        // --- CEK OTORISASI ROLE ---
        let activeUser = { role: 'Requester', unit: '-' };
        try { const stored = localStorage.getItem('currentUser'); if (stored) activeUser = JSON.parse(stored); } catch (e) {}
        const isTed = (activeUser.role && activeUser.role.toUpperCase().includes('TED')) || (activeUser.unit && activeUser.unit.toUpperCase().includes('TED'));

        // Aturan Read-Only: Cek menggunakan status yang PALING BARU ditarik
        let isReadOnly = false;
        if (ticket.status === 'Created') isReadOnly = true;
        if (!isTed && ticket.status === 'Under Evaluation') isReadOnly = true;

        if (isReadOnly && !isTed) {
            // Beritahu user jika ternyata statusnya sudah berubah di device lain
            Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: `Status tiket saat ini: ${ticket.status}. Dibuka dalam mode Read-Only.`, showConfirmButton: false, timer: 3000 });
        }
        // --------------------------

        openEntryModal({
            title: !isReadOnly 
                ? `<i class="ph ph-note-pencil"></i> Edit Ticket (${ticket.status}): ${ticket.ticketNo}` 
                : `<i class="ph ph-lock-key"></i> Ticket Details (Read-Only): ${ticket.ticketNo}`,
            headerData: { 
                ticketNo: ticket.ticketNo, 
                requester: ticket.requester, 
                department: ticket.dept,
                lastUpdatedByName: ticket.lastUpdatedByName || ticket.requester,
                lastUpdatedByUnit: ticket.lastUpdatedByUnit || ticket.dept,
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt,
                closedAt: ticket.closedAt
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
                    await updateTicketAndItems(ticket.ticketNo, updatedPns, {
                        name: activeUser.name,
                        unit: activeUser.unit
                    });
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


    // 6. DELETE TIKET LENGKAP DENGAN FILE GDRIVE (VERSI VALIDASI JIT TERBARU)
    document.getElementById('dd-delete').addEventListener('click', async () => {
        const ticket = ticketData[activeDropdownIndex];

        // --- VALIDASI JUST-IN-TIME (Mencegah Stale Data) ---
        Swal.fire({ title: 'Memeriksa status tiket...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-card)', color: 'var(--text-main)' });
        
        // Tarik status paling update detik ini dari database
        const { data: freshData, error: fetchErr } = await supabase
            .from('existing_pn_tickets')
            .select('status')
            .eq('ticket_no', ticket.ticketNo)
            .single();
            
        if (!fetchErr && freshData) {
            ticket.status = freshData.status;
            renderTable(); // Update UI background seketika
        }
        Swal.close();
        // ---------------------------------------------------

        // --- CEK OTORISASI ROLE ---
        let activeUser = { role: 'Requester', unit: '-' };
        try { const stored = localStorage.getItem('currentUser'); if (stored) activeUser = JSON.parse(stored); } catch (e) {}
        const isTed = (activeUser.role && activeUser.role.toUpperCase().includes('TED')) || (activeUser.unit && activeUser.unit.toUpperCase().includes('TED'));

        // Cegah hapus jika tiket sudah diproses (Berdasarkan status TERBARU)
        if (!isTed && (ticket.status === 'Under Evaluation' || ticket.status === 'Created')) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Akses Ditolak', 
                text: `Terjadi pembaruan. Tiket saat ini sudah berstatus '${ticket.status}' dan tidak dapat dihapus oleh Unit Pengaju.`, 
                background: 'var(--bg-card)', color: 'var(--text-main)' 
            });
            return;
        }
        // --------------------------

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

        let activeUser = { name: 'User', unit: '-', empId: null };
        try {
            const stored = localStorage.getItem('currentUser');
            if (stored) activeUser = JSON.parse(stored);
        } catch (e) {}

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
                Swal.fire({ title: 'Menyimpan Tiket Baru...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-card)', color: 'var(--text-main)' });
                try {
                    await createTicketWithItems(header, arrayOfPns);
                    await loadData();
                    Swal.fire({ icon: 'success', title: 'Tiket Berhasil Dibuat!', timer: 1500, showConfirmButton: false, background: 'var(--bg-card)', color: 'var(--text-main)' });
                } catch (err) {
                    Swal.fire({ icon: 'error', title: 'Gagal Menyimpan Tiket', text: err.message, background: 'var(--bg-card)', color: 'var(--text-main)' });
                }
            }
        });
    });
    const btnResetFilter = document.getElementById('btn-reset-filter');
    if (btnResetFilter) {
        btnResetFilter.addEventListener('click', () => {
            activeFilterTicket = null;
            renderTable();
        });
    }

    // Tombol Toggle Mode Filter ala Google Sheets
    const btnToggleFilter = document.getElementById('btn-toggle-filter-mode');
    const labelFilterMode = document.getElementById('label-filter-mode');
    if (btnToggleFilter) {
        btnToggleFilter.addEventListener('click', () => {
            const tableEl = document.getElementById('table-pn');
            const isActive = filterManager.toggleFilterMode(tableEl);

            if (isActive) {
                btnToggleFilter.style.borderColor = 'var(--primary)';
                btnToggleFilter.style.background = 'rgba(37, 99, 235, 0.15)'; // Adaptif gelap & terang
                btnToggleFilter.style.color = 'var(--primary)';
                labelFilterMode.textContent = 'Exit Filter Mode';
            } else {
                btnToggleFilter.style.borderColor = 'var(--border-color)';
                btnToggleFilter.style.background = 'var(--bg-card)';
                btnToggleFilter.style.color = 'var(--text-main)';
                labelFilterMode.textContent = 'Filter Mode';
            }
        });
    }

    // Event Listener Quick Search Bar
    const globalSearchInput = document.getElementById('global-search-input');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            globalSearchKeyword = e.target.value;
            renderTable();
        });
    }

    const btnAnalytics = document.getElementById('btn-open-analytics');
    if (btnAnalytics) {
        btnAnalytics.addEventListener('click', async () => {
            const { render: renderAnalytics } = await import('./analytics/existingNewPN.js');
            const container = document.getElementById('app-container');
            document.getElementById('page-title').textContent = 'Existing PN Analytics & Statistics';
            renderAnalytics(container);
        });
    }

    // Tangkap sinyal klik notifikasi dari luar modul
    window.addEventListener('filter-ticket', (e) => {
        if (e.detail && e.detail.ticketNo) {
            activeFilterTicket = e.detail.ticketNo;
            renderTable();
        }
    });
}
