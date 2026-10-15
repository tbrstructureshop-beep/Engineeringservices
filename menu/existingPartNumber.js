// File: menu/existingPartNumber.js
import { openEntryModal } from './modal/entryExistingPNModal.js'; 

export function render(container) {
    // 1. INJEKSI HTML & CSS (CSS untuk Action Dropdown)
    container.innerHTML = `
        <style>
            /* CSS untuk Dropdown Action (Titik Tiga) */
            .action-dropdown { position: relative; display: inline-block; }
            .action-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); transition: 0.2s; padding: 4px; border-radius: 4px;}
            .action-btn:hover { background: var(--bg-main); color: var(--primary); }
            
            .dropdown-content {
                display: none; position: absolute; right: 0; top: 100%;
                background-color: var(--bg-card); min-width: 140px;
                box-shadow: 0px 4px 12px rgba(0,0,0,0.1); z-index: 10;
                border-radius: 8px; border: 1px solid var(--border-color);
                overflow: hidden; flex-direction: column; text-align: left;
            }
            .dropdown-content.show { display: flex; }
            .dropdown-item {
                padding: 10px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-main); font-weight: 500;
            }
            .dropdown-item:hover { background-color: var(--bg-main); }
            .dropdown-item.text-red { color: #ef4444; }
            .dropdown-item.text-red:hover { background-color: #fef2f2; }
        </style>

        <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
                <h3 class="card-title" style="margin-bottom: 5px;"><i class="ph ph-hard-drives"></i> Existing Part Number</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Manage material tracking.</p>
            </div>
            <button id="btn-add-pn" class="btn-submit" style="margin-top: 0;">
                <i class="ph ph-plus-circle"></i> Input New Data
            </button>
        </div>

        <!-- TABEL RINGKAS -->
        <div class="card">
            <h3 class="card-title"><i class="ph ph-table"></i> Track Material SAP</h3>
            <div class="table-responsive">
                <table class="data-table" id="table-pn" style="min-width: 100%;">
                    <thead>
                        <tr>
                            <th>Ticket No</th>
                            <th>Status</th>
                            <th>Request Type</th>
                            <th>Requester</th>
                            <th>MANU_MAT (PN)</th>
                            <th style="text-align:center;">Action</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-pn"></tbody>
                </table>
            </div>
        </div>
    `;

    // 2. DATA STATE (Lengkap di memori, tapi ringkas di tampilan)
    let pnData = [
        {
            ticket: "492018", status: "Received", request: "EXISTING PN", 
            requester: "Muhammad Rizki F", dept: "TCP-10", pn: "CF1633N",
            dangerous: "NO", shelf: "NO", type: "TOOLS", desc: "FREEZER", 
            uom: "2 EA", mfr: "MFR01", doc: "DOC-99", unserv_plant: "P1", 
            unserv_loc: "L1", ref_plant: "R1", ref_iss: "I1", ref_rec: "RC1",
            parent_shop: "PS1", parent_plant: "PP1", serv_loc: "SL1", 
            ac_type: "A320", pur_grp: "PG1", reg: "PK-GMF"
        }
    ];

    // Status Warna
    function getStatusStyle(status) {
        if (status === 'Received') return 'background: #dbeafe; color: #1e40af;';
        if (status === 'Evaluated') return 'background: #fef08a; color: #854d0e;';
        if (status === 'Approved') return 'background: #dcfce7; color: #166534;';
        return 'background: #f1f5f9; color: #475569;';
    }

    // 3. FUNGSI RENDER TABEL RINGKAS
    function renderTable() {
        const tbody = document.getElementById('tbody-pn');
        tbody.innerHTML = ''; 

        pnData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600;">${row.ticket}</td>
                
                <td style="cursor: pointer;" class="btn-status" data-index="${index}" title="Change Status">
                    <span class="status-badge" style="${getStatusStyle(row.status)}">${row.status} <i class="ph ph-pencil-simple" style="font-size:0.7rem;"></i></span>
                </td>

                <td><span class="status-badge badge-gray">${row.request}</span></td>
                <td>${row.requester}</td>
                <td><strong>${row.pn}</strong></td>
                
                <!-- ACTION DROP DOWN -->
                <td style="text-align:center;">
                    <div class="action-dropdown">
                        <button class="action-btn drop-trigger" data-index="${index}">
                            <i class="ph ph-dots-three-outline-vertical"></i>
                        </button>
                        <div class="dropdown-content" id="dropdown-${index}">
                            <div class="dropdown-item btn-detail" data-index="${index}"><i class="ph ph-eye"></i> Detail Info</div>
                            <div class="dropdown-item text-red btn-delete" data-index="${index}"><i class="ph ph-trash"></i> Delete Data</div>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    renderTable();

    // 4. EVENT LISTENER (Dropdown, Detail, Delete, Status)
    
    // Global Klik (Tutup Dropdown jika klik di luar)
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('show'));
    });

    document.getElementById('tbody-pn').addEventListener('click', (e) => {
        // Toggle Action Dropdown
        const trigger = e.target.closest('.drop-trigger');
        if (trigger) {
            e.stopPropagation(); // Mencegah global click menutup dropdown yang baru dibuka
            document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('show'));
            const index = trigger.getAttribute('data-index');
            document.getElementById(`dropdown-${index}`).classList.toggle('show');
            return;
        }

        // Action: DETAIL INFO
        const btnDetail = e.target.closest('.btn-detail');
        if (btnDetail) {
            const index = btnDetail.getAttribute('data-index');
            const data = pnData[index];
            Swal.fire({
                title: 'Material Detail',
                html: `
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align:left; font-size: 0.85rem; background: var(--bg-main); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-main);">
                        <div><strong style="color:var(--text-muted);">Ticket No:</strong> <br>${data.ticket}</div>
                        <div><strong style="color:var(--text-muted);">Status:</strong> <br>${data.status}</div>
                        <div><strong style="color:var(--text-muted);">Request Type:</strong> <br>${data.request}</div>
                        <div><strong style="color:var(--text-muted);">Dept:</strong> <br>${data.dept}</div>
                        <div><strong style="color:var(--text-muted);">Material Type:</strong> <br>${data.type}</div>
                        <div><strong style="color:var(--text-muted);">Dangerous:</strong> <br>${data.dangerous}</div>
                        <div style="grid-column: span 2;"><strong style="color:var(--text-muted);">Description:</strong> <br>${data.desc}</div>
                        <div><strong style="color:var(--text-muted);">PN / MANU_MAT:</strong> <br><b>${data.pn}</b></div>
                        <div><strong style="color:var(--text-muted);">UoM:</strong> <br>${data.uom}</div>
                        <div><strong style="color:var(--text-muted);">Unserviceable Plant:</strong> <br>${data.unserv_plant}</div>
                        <div><strong style="color:var(--text-muted);">Refurbishment Plant:</strong> <br>${data.ref_plant}</div>
                        <div><strong style="color:var(--text-muted);">Parent Shop:</strong> <br>${data.parent_shop}</div>
                        <div><strong style="color:var(--text-muted);">A/C Type:</strong> <br>${data.ac_type}</div>
                    </div>
                `,
                width: '600px',
                background: 'var(--bg-card)',
                confirmButtonColor: 'var(--primary)',
                confirmButtonText: 'Close'
            });
            return;
        }

        // Action: DELETE
        const btnDelete = e.target.closest('.btn-delete');
        if (btnDelete) {
            const index = btnDelete.getAttribute('data-index');
            Swal.fire({
                title: 'Delete Data?',
                text: `Hapus PN ${pnData[index].pn}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                background: 'var(--bg-card)', color: 'var(--text-main)'
            }).then((result) => {
                if (result.isConfirmed) {
                    pnData.splice(index, 1);
                    renderTable();
                }
            });
            return;
        }

        // Action: UBAH STATUS (Admin)
        const btnStatus = e.target.closest('.btn-status');
        if (btnStatus) {
            const index = btnStatus.getAttribute('data-index');
            Swal.fire({
                title: 'Update Ticket Status',
                input: 'select',
                inputOptions: { 'Received': 'Received', 'Evaluated': 'Evaluated', 'Approved': 'Approved' },
                inputValue: pnData[index].status,
                showCancelButton: true,
                confirmButtonText: 'Update Status',
                confirmButtonColor: 'var(--primary)',
                background: 'var(--bg-card)', color: 'var(--text-main)'
            }).then((res) => {
                if (res.isConfirmed) {
                    pnData[index].status = res.value; 
                    renderTable(); 
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Status Updated', showConfirmButton: false, timer: 1500 });
                }
            });
        }
    });

    // 5. LOGIKA MODAL (GENERATE NOMOR TIKET OTOMATIS)
    document.getElementById('btn-add-pn').addEventListener('click', () => {
        // Generate 6 digit random number
        const randomTicket = Math.floor(100000 + Math.random() * 900000).toString();

        const formConfig = {
            title: '<i class="ph ph-hard-drives"></i> Tambah Data Existing PN',
            // Informasi Fix yang masuk ke atas Modal
            headerData: {
                ticketNo: randomTicket,
                requester: 'Muhammad Rizki F',
                department: 'TCP-10'
            },
            sections: [
                {
                    title: '1. General Info & Codes',
                    fields: [
                        { id: 'dangerous_good', label: 'Dangerous Good', type: 'select', options: ['NO', 'YES'], required: true },
                        { id: 'shelf_life', label: 'Shelf Life', type: 'select', options: ['NO', 'YES'], required: true },
                        { id: 'matl_type', label: 'Matl Type', type: 'select', options: ['TOOLS', 'CONSUMABLE', 'SPAREPART'], required: true },
                        { id: 'matl_desc', label: 'Material Desc', type: 'text', uppercase: true, required: true },
                        { id: 'base_oum', label: 'Base Unit (UoM)', type: 'text', uppercase: true, required: true },
                        { id: 'manu_mat', label: 'Manufacturer PN', type: 'text', uppercase: true, required: true },
                        { id: 'mfr_no', label: 'MFR NO (CAGE CODE)', type: 'text', uppercase: true },
                        { id: 'document', label: 'Document Number', type: 'text', uppercase: true },
                    ]
                },
                {
                    title: '2. Plant & Locations',
                    fields: [
                        { id: 'zzuwerks', label: 'Unserviceable Plant', type: 'text', uppercase: true },
                        { id: 'zzulgort', label: 'Unserviceable St. Loc', type: 'text', uppercase: true },
                        { id: 'zzrwerks', label: 'Refurbishment Plant', type: 'text', uppercase: true },
                        { id: 'zzrilgort', label: 'Refurb Issue St. Loc', type: 'text', uppercase: true },
                        { id: 'zzrrlgort', label: 'Refurb Receipt St. Loc', type: 'text', uppercase: true },
                    ]
                },
                {
                    title: '3. Additional Details',
                    fields: [
                        { id: 'zzrarbpl', label: 'Parent Shop', type: 'text', uppercase: true },
                        { id: 'zzpwerks', label: 'Parent Shop Plant', type: 'text', uppercase: true },
                        { id: 'zzslgort', label: 'Serviceable St. Loc', type: 'text', uppercase: true },
                        { id: 'zzeqart', label: 'A/C Type', type: 'text', uppercase: true },
                        { id: 'ekgrp', label: 'Purchasing Group', type: 'text', uppercase: true },
                        { id: 'reg', label: 'Aircraft Reg', type: 'text', uppercase: true }
                    ]
                }
            ],
            onSubmit: (formData, header) => {
                // Saat submit, kita ambil Header Data & Form Input
                const newEntry = {
                    ticket: header.ticketNo,
                    status: "Received", 
                    request: "EXISTING PN", 
                    requester: header.requester, 
                    dept: header.department,
                    
                    dangerous: formData.dangerous_good, shelf: formData.shelf_life,
                    type: formData.matl_type, desc: formData.matl_desc, uom: formData.base_oum,
                    pn: formData.manu_mat, mfr: formData.mfr_no, doc: formData.document,
                    unserv_plant: formData.zzuwerks, unserv_loc: formData.zzulgort,
                    ref_plant: formData.zzrwerks, ref_iss: formData.zzrilgort, ref_rec: formData.zzrrlgort,
                    parent_shop: formData.zzrarbpl, parent_plant: formData.zzpwerks, serv_loc: formData.zzslgort,
                    ac_type: formData.zzeqart, pur_grp: formData.ekgrp, reg: formData.reg
                };
                pnData.push(newEntry);
                renderTable();
            }
        };

        openEntryModal(formConfig);
    });
}
