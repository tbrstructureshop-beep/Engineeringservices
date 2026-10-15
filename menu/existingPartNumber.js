// File: menu/existingPartNumber.js
import { openEntryModal } from './modal/entryExistingPNModal.js'; 

export function render(container) {
    // 1. INJEKSI HTML & CSS
    container.innerHTML = `
        <style>
            /* DROPDOWN MELAYANG DI ATAS TABLE */
            .action-dropdown { position: relative; display: inline-block; }
            .action-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); transition: 0.2s; padding: 4px; border-radius: 4px;}
            .action-btn:hover { background: var(--bg-main); color: var(--primary); }
            
            /* Class .dropdown-content-fixed akan dipakai JS untuk floating */
            .dropdown-content-fixed {
                display: none; position: fixed; /* KUNCI UTAMA: Fixed Position */
                background-color: var(--bg-card); min-width: 140px;
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
            
            /* Penataan Badge Multi PN di tabel */
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
            <!-- Wrapper Table -->
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
        
        <!-- ELEMENT GLOBAL UNTUK DROPDOWN MELAYANG -->
        <div id="global-dropdown" class="dropdown-content-fixed">
            <div class="dropdown-item btn-detail" id="dd-detail"><i class="ph ph-eye"></i> Detail PNs</div>
            <div class="dropdown-item text-red btn-delete" id="dd-delete"><i class="ph ph-trash"></i> Delete Ticket</div>
        </div>
    `;

    // 2. STATE DATA (STRUKTUR BARU: 1 TIKET -> BANYAK PN)
    let ticketData = [
        {
            ticketNo: "492018", status: "Received", request: "EXISTING PN", 
            requester: "Muhammad Rizki F", dept: "TCP-10",
            // Array menampung banyak list PN dalam 1 tiket
            pns: [
                { pn: "CF1633N", desc: "FREEZER", type: "TOOLS", uom: "2 EA", dangerous: "NO", shelf: "NO", mfr: "MFR1", doc: "", uplant: "", uloc: "", rplant: "", riss: "", rrec: "", pshop: "", pplant: "", sloc: "", ac: "", pur: "", reg: "" },
                { pn: "HEX-BOLT-9", desc: "HEXAGONAL BOLT", type: "SPAREPART", uom: "10 EA", dangerous: "NO", shelf: "NO", mfr: "MFR2", doc: "", uplant: "", uloc: "", rplant: "", riss: "", rrec: "", pshop: "", pplant: "", sloc: "", ac: "", pur: "", reg: "" }
            ]
        }
    ];

    function getStatusStyle(status) {
        if (status === 'Received') return 'background: #dbeafe; color: #1e40af;';
        if (status === 'Evaluated') return 'background: #fef08a; color: #854d0e;';
        if (status === 'Approved') return 'background: #dcfce7; color: #166534;';
        return 'background: #f1f5f9; color: #475569;';
    }

    // 3. RENDER TABEL UTAMA
    function renderTable() {
        const tbody = document.getElementById('tbody-pn');
        tbody.innerHTML = ''; 

        ticketData.forEach((row, index) => {
            // Mapping Array PNs menjadi List Badge HTML
            const pnListHTML = row.pns.map(p => `<span class="pn-badge">${p.pn}</span>`).join('');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;">
                    <button class="action-btn drop-trigger" data-index="${index}">
                        <i class="ph ph-dots-three-outline-vertical"></i>
                    </button>
                </td>
                <td style="font-weight: 700; color: var(--primary);">${row.ticketNo}</td>
                <td style="cursor: pointer;" class="btn-status" data-index="${index}" title="Change Status">
                    <span class="status-badge" style="${getStatusStyle(row.status)}">${row.status} <i class="ph ph-pencil-simple" style="font-size:0.7rem;"></i></span>
                </td>
                <td><span class="status-badge badge-gray">${row.request}</span></td>
                <td>${row.requester}</td>
                <td><div class="pn-list">${pnListHTML}</div></td>
            `;
            tbody.appendChild(tr);
        });
    }
    renderTable();

    // 4. LOGIKA DROPDOWN MELAYANG (DI ATAS TABEL) & ACTIONS
    const globalDropdown = document.getElementById('global-dropdown');
    let activeDropdownIndex = null;

    // Tutup dropdown jika klik di luar
    document.addEventListener('click', () => {
        globalDropdown.classList.remove('show');
    });

    document.getElementById('tbody-pn').addEventListener('click', (e) => {
        // --- KLIK TITIK TIGA ---
        const trigger = e.target.closest('.drop-trigger');
        if (trigger) {
            e.stopPropagation(); // Cegah event menutup otomatis
            activeDropdownIndex = trigger.getAttribute('data-index');
            
            // Dapatkan kordinat tombol persis di layar
            const rect = trigger.getBoundingClientRect();
            
            // Atur posisi menu melayang tepat di bawah kordinat tombol
            globalDropdown.style.top = `${rect.bottom + 5}px`;
            globalDropdown.style.left = `${rect.left}px`;
            globalDropdown.classList.add('show');
            return;
        }

        // --- KLIK UBAH STATUS ---
        const btnStatus = e.target.closest('.btn-status');
        if (btnStatus) {
            const idx = btnStatus.getAttribute('data-index');
            Swal.fire({
                title: `Status Ticket: ${ticketData[idx].ticketNo}`,
                input: 'select',
                inputOptions: { 'Received': 'Received', 'Evaluated': 'Evaluated', 'Approved': 'Approved' },
                inputValue: ticketData[idx].status,
                showCancelButton: true,
                confirmButtonText: 'Update Status',
                confirmButtonColor: 'var(--primary)',
                background: 'var(--bg-card)', color: 'var(--text-main)'
            }).then((res) => {
                if (res.isConfirmed) {
                    ticketData[idx].status = res.value; 
                    renderTable(); 
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Status Updated', showConfirmButton: false, timer: 1500 });
                }
            });
        }
    });

    // --- KLIK MENU DALAM DROPDOWN (DETAIL & DELETE) ---
    document.getElementById('dd-detail').addEventListener('click', () => {
        const data = ticketData[activeDropdownIndex];
        
        // Buat tabel HTML Rincian Multi PN
        let tableHTML = `
            <div style="overflow-x: auto; max-height: 50vh; font-size: 0.8rem;">
                <table class="data-table" style="min-width: 1500px;">
                    <thead style="background: var(--bg-main);">
                        <tr><th>PN</th><th>DESC</th><th>TYPE</th><th>UoM</th><th>DG</th><th>Shelf</th><th>MFR</th><th>A/C</th><th>Plant</th></tr>
                    </thead>
                    <tbody>
        `;
        data.pns.forEach(p => {
            tableHTML += `<tr>
                <td><b>${p.pn}</b></td><td>${p.desc}</td><td>${p.type}</td><td>${p.uom}</td>
                <td>${p.dangerous}</td><td>${p.shelf}</td><td>${p.mfr}</td><td>${p.ac}</td><td>${p.uplant}</td>
            </tr>`;
        });
        tableHTML += `</tbody></table></div>`;

        Swal.fire({
            title: `Detail Tiket ${data.ticketNo}`,
            html: tableHTML,
            width: '90vw',
            background: 'var(--bg-card)', color: 'var(--text-main)',
            confirmButtonColor: 'var(--primary)'
        });
    });

    document.getElementById('dd-delete').addEventListener('click', () => {
        Swal.fire({
            title: 'Delete Ticket?',
            text: `Hapus tiket ${ticketData[activeDropdownIndex].ticketNo} beserta seluruh PN di dalamnya?`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444',
            background: 'var(--bg-card)', color: 'var(--text-main)'
        }).then((res) => {
            if (res.isConfirmed) {
                ticketData.splice(activeDropdownIndex, 1);
                renderTable();
            }
        });
    });

    // 5. MUNCULKAN MODAL INPUT TIKET
    document.getElementById('btn-add-pn').addEventListener('click', () => {
        // Generate 6 digit angka
        const randomTicket = Math.floor(100000 + Math.random() * 900000).toString();

        const formConfig = {
            title: '<i class="ph ph-hard-drives"></i> Create New PN Ticket',
            headerData: { ticketNo: randomTicket, requester: 'Muhammad Rizki F', department: 'TCP-10' },
            
            // Ketika "Submit Ticket" di klik di dalam modal
            onSubmit: (arrayOfPns, header) => {
                const newTicket = {
                    ticketNo: header.ticketNo,
                    status: "Received",
                    request: "EXISTING PN",
                    requester: header.requester,
                    dept: header.department,
                    pns: arrayOfPns // Kumpulan PN dari table modal
                };
                
                // Masukkan tiket baru dan render ulang tabel utama
                ticketData.unshift(newTicket);
                renderTable();
            }
        };

        openEntryModal(formConfig);
    });
}
