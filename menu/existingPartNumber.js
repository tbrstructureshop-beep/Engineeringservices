// File: menu/existingPartNumber.js
import { openEntryModal } from './modal/entryExistingPNModal.js'; 
import { openNotifModal } from './modal/notifExistingPNModal.js'; // <-- Tambahkan import ini

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
                    <tbody id="tbody-pn"></tbody>
                </table>
            </div>
        </div>
        
        <div id="global-dropdown" class="dropdown-content-fixed">
            <div class="dropdown-item btn-detail" id="dd-detail"><i class="ph ph-eye"></i> View Detail / Edit</div>
            <div class="dropdown-item" id="dd-notif"><i class="ph ph-envelope-simple"></i> Outlook Notification</div>
            <div class="dropdown-item text-red btn-delete" id="dd-delete"><i class="ph ph-trash"></i> Delete Ticket</div>
        </div>
    `;

    // 1. DATA SEEDING
    let ticketData = [
        {
            ticketNo: "492018", 
            status: "Received", // Bisa Diedit
            request: "EXISTING PN", 
            requester: "Muhammad Rizki F", 
            dept: "TCP-10",
            pns: [
                { pn: "CF1633N", desc: "FREEZER", type: "TOOLS", uom: "2 EA", dangerous: "NO", shelf: "NO", mfr: "MFR1", doc: "MANUAL_CF1633N.PDF", docFile: null, uplant: "", uloc: "", rplant: "", riss: "", rrec: "", pshop: "", pplant: "", sloc: "", ac: "", pur: "", reg: "" },
                { pn: "HEX-BOLT-9", desc: "HEXAGONAL BOLT", type: "SPAREPART", uom: "10 EA", dangerous: "NO", shelf: "NO", mfr: "MFR2", doc: "", docFile: null, uplant: "", uloc: "", rplant: "", riss: "", rrec: "", pshop: "", pplant: "", sloc: "", ac: "", pur: "", reg: "" }
            ]
        },
        {
            ticketNo: "492019", 
            status: "Created", // Terkunci (Read-Only)
            request: "EXISTING PN", 
            requester: "Budi Santoso", 
            dept: "TCP-12",
            pns: [
                { pn: "VALVE-OIL-4", desc: "PRESSURE VALVE", type: "EQUIPMENT", uom: "1 EA", dangerous: "NO", shelf: "NO", mfr: "BOSCH", doc: "SPEC_VALVE.PDF", docFile: null, uplant: "", uloc: "", rplant: "", riss: "", rrec: "", pshop: "", pplant: "", sloc: "", ac: "", pur: "", reg: "" }
            ]
        }
    ];

    // 2. STYLING STATUS
    function getStatusStyle(status) {
        if (status === 'Received') return 'background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
        if (status === 'Under Evaluation') return 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;';
        if (status === 'Created') return 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;';
        return 'background: #f1f5f9; color: #475569;';
    }

    // 3. RENDER TABEL
    function renderTable() {
        const tbody = document.getElementById('tbody-pn');
        tbody.innerHTML = ''; 

        ticketData.forEach((row, index) => {
            const pnListHTML = row.pns.map(p => `<span class="pn-badge">${p.pn}</span>`).join('');

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
                <td><div class="pn-list">${pnListHTML}</div></td>
            `;
            tbody.appendChild(tr);
        });
    }
    renderTable();

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

        // KLIK UBAH STATUS
        const btnStatus = e.target.closest('.btn-status');
        if (btnStatus) {
            const idx = btnStatus.getAttribute('data-index');
            Swal.fire({
                title: `Change Status: ${ticketData[idx].ticketNo}`,
                input: 'select',
                inputOptions: { 
                    'Received': 'Received', 
                    'Under Evaluation': 'Under Evaluation', 
                    'Created': 'Created' 
                },
                inputValue: ticketData[idx].status,
                showCancelButton: true,
                confirmButtonText: 'Update Status',
                confirmButtonColor: 'var(--primary)',
                background: 'var(--bg-card)', color: 'var(--text-main)'
            }).then((res) => {
                if (res.isConfirmed) {
                    ticketData[idx].status = res.value; 
                    renderTable(); 
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Status set to ${res.value}`, showConfirmButton: false, timer: 1500 });
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
            
            // Simpan perubahan ke ticketData jika dalam mode edit
            onSubmit: (updatedPns) => {
                ticket.pns = updatedPns;
                renderTable();
            }
        });
    });

    // 6. DELETE TIKET
    document.getElementById('dd-delete').addEventListener('click', () => {
        Swal.fire({
            title: 'Delete Ticket?',
            text: `Hapus tiket ${ticketData[activeDropdownIndex].ticketNo}?`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444',
            background: 'var(--bg-card)', color: 'var(--text-main)'
        }).then((res) => {
            if (res.isConfirmed) {
                ticketData.splice(activeDropdownIndex, 1);
                renderTable();
            }
        });
    });

    // 7. INPUT TIKET BARU
    document.getElementById('btn-add-pn').addEventListener('click', () => {
        const randomTicket = Math.floor(100000 + Math.random() * 900000).toString();

        openEntryModal({
            title: '<i class="ph ph-hard-drives"></i> Create New PN Ticket',
            headerData: { ticketNo: randomTicket, requester: 'Muhammad Rizki F', department: 'TCP-10' },
            initialData: [],
            isReadOnly: false,
            onSubmit: (arrayOfPns, header) => {
                const newTicket = {
                    ticketNo: header.ticketNo,
                    status: "Received", // Awal tiket masuk sebagai Received (Editable)
                    request: "EXISTING PN",
                    requester: header.requester,
                    dept: header.department,
                    pns: arrayOfPns
                };
                ticketData.unshift(newTicket);
                renderTable();
            }
        });
    });
}
