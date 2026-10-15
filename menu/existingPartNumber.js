// File: menu/existingPartNumber.js
import { openEntryModal } from './entryModal.js';

export function render(container) {
    container.innerHTML = `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
                <h3 class="card-title" style="margin-bottom: 5px;"><i class="ph ph-hard-drives"></i> Existing Part Number</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Tracker & Material Input Dashboard.</p>
            </div>
            <button id="btn-add-pn" class="btn-submit" style="margin-top: 0;">
                <i class="ph ph-plus-circle"></i> Input New Data
            </button>
        </div>

        <div class="card">
            <h3 class="card-title"><i class="ph ph-table"></i> Tracking Process Material SAP</h3>
            <div class="table-responsive">
                <table class="data-table" id="table-pn">
                    <thead>
                        <tr>
                            <!-- Tambah Kolom ACTION di awal -->
                            <th rowspan="2" style="border-right: 2px solid var(--border-color); text-align:center;">Action</th>
                            
                            <th rowspan="2" style="border-right: 1px solid var(--border-color);">Request</th>
                            <th rowspan="2" style="border-right: 1px solid var(--border-color);">Dangerous Good</th>
                            <th rowspan="2" style="border-right: 1px solid var(--border-color);">Shelf Life</th>
                            <th rowspan="2" style="border-right: 1px solid var(--border-color);">Requester</th>
                            <th rowspan="2" style="border-right: 2px solid var(--border-color);">NO</th>
                            
                            <th>MATERIAL TYPE</th>
                            <th>MATERIAL DESCRIPTION (SHORT TEXT)</th>
                            <th>BASE UNIT OF MEASURE</th>
                            <th>MANUFACTURER PART NUMBER</th>
                            <th>NUMBER OF A MANUFACTURER</th>
                            <th>DOCUMENT NUMBER</th>
                            <th>UNSERVICEABLE PLANT</th>
                            <th>UNSERSABLE STORAGE LOCATION</th>
                            <th>REFURBISHMENT PLANT</th>
                            <th>REFURBISHMENT ISSUE ST LOC</th>
                            <th>REFURBISHMENT RECEIPT ST LOC</th>
                            <th>PARENT SHOP</th>
                            <th>PARENT SHOP PLANT</th>
                            <th>SERVICEABLE STORE LOCATION</th>
                            <th>TYPE OF TECH OBJECT (A/C TYPE)</th>
                            <th>PURCHASING GROUP</th>
                            <th>AIRCRAFT REGISTRATION</th>
                        </tr>
                        <tr style="background-color: var(--bg-main);">
                            <th>MATL_TYPE</th>
                            <th>MATL_DESC</th>
                            <th>BASE_OUM</th>
                            <th>MANU_MAT (PN)</th>
                            <th>MFR NO (CAGE CODE)</th>
                            <th>DOCUMENT</th>
                            <th>ZZUWERKS</th>
                            <th>ZZULGORT</th>
                            <th>ZZRWERKS</th>
                            <th>ZZRILGORT</th>
                            <th>ZZRRLGORT</th>
                            <th>ZZRARBPL</th>
                            <th>ZZPWERKS</th>
                            <th>ZZSLGORT</th>
                            <th>ZZEQART</th>
                            <th>EKGRP</th>
                            <th>Reg</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-pn"></tbody>
                </table>
            </div>
        </div>
    `;

    // DATA STATE
    let pnData = [
        {
            request: "EXISTING PN", dangerous: "NO", shelf: "NO", requester: "Muhammad Rizki F",
            no: "1", type: "TOOLS", desc: "FREEZER", uom: "2 EA", pn: "CF1633N",
            mfr: "", doc: "", unserv_plant: "", unserv_loc: "", ref_plant: "", ref_iss: "",
            ref_rec: "", parent_shop: "", parent_plant: "", serv_loc: "", ac_type: "", pur_grp: "", reg: ""
        }
    ];

    // FUNGSI RENDER TABLE
    function renderTable() {
        const tbody = document.getElementById('tbody-pn');
        tbody.innerHTML = ''; 

        pnData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <!-- Tombol Hapus (Action) -->
                <td style="border-right: 2px solid var(--border-color); text-align:center;">
                    <button class="btn-delete" data-index="${index}" style="background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;" title="Delete Data">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
                
                <td style="border-right: 1px solid var(--border-color);"><span class="status-badge badge-green">${row.request}</span></td>
                <td style="border-right: 1px solid var(--border-color);"><span class="status-badge badge-gray">${row.dangerous}</span></td>
                <td style="border-right: 1px solid var(--border-color);"><span class="status-badge badge-gray">${row.shelf}</span></td>
                <td style="border-right: 1px solid var(--border-color);">${row.requester}</td>
                <td style="border-right: 2px solid var(--border-color); text-align: center;">${index + 1}</td>
                
                <td><strong>${row.type}</strong></td>
                <td>${row.desc}</td>
                <td>${row.uom}</td>
                <td><strong>${row.pn}</strong></td>
                <td>${row.mfr}</td>
                <td>${row.doc}</td>
                <td>${row.unserv_plant}</td>
                <td>${row.unserv_loc}</td>
                <td>${row.ref_plant}</td>
                <td>${row.ref_iss}</td>
                <td>${row.ref_rec}</td>
                <td>${row.parent_shop}</td>
                <td>${row.parent_plant}</td>
                <td>${row.serv_loc}</td>
                <td>${row.ac_type}</td>
                <td>${row.pur_grp}</td>
                <td>${row.reg}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    renderTable();

    // LOGIKA HAPUS DATA (Event Delegation)
    document.getElementById('tbody-pn').addEventListener('click', (e) => {
        const btnDelete = e.target.closest('.btn-delete');
        if (btnDelete) {
            const index = btnDelete.getAttribute('data-index');
            
            // Konfirmasi Hapus via SweetAlert
            Swal.fire({
                title: 'Hapus Data?',
                text: `Anda yakin ingin menghapus material ${pnData[index].desc}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Ya, Hapus',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
            }).then((result) => {
                if (result.isConfirmed) {
                    pnData.splice(index, 1); // Hapus array berdasarkan index
                    renderTable(); // Update Tabel
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data Terhapus', showConfirmButton: false, timer: 1500 });
                }
            });
        }
    });

    // LOGIKA INPUT MODAL (Grouped by Sections)
    document.getElementById('btn-add-pn').addEventListener('click', () => {
        
        // Definisikan kolom dan pecah menjadi Section/Grup
        const formConfig = {
            title: '<i class="ph ph-hard-drives"></i> Tambah Data Existing PN',
            sections: [
                {
                    title: '1. General Information',
                    fields: [
                        { id: 'dangerous_good', label: 'Dangerous Good', type: 'select', options: ['NO', 'YES'], required: true },
                        { id: 'shelf_life', label: 'Shelf Life', type: 'select', options: ['NO', 'YES'], required: true },
                    ]
                },
                {
                    title: '2. Material Codes & Desc',
                    fields: [
                        { id: 'matl_type', label: 'Matl Type (MATL_TYPE)', type: 'select', options: ['TOOLS', 'CONSUMABLE', 'SPAREPART'], required: true },
                        { id: 'matl_desc', label: 'Material Desc (MATL_DESC)', type: 'text', placeholder: 'e.g. FREEZER', uppercase: true, required: true },
                        { id: 'base_oum', label: 'Base Unit (BASE_OUM)', type: 'text', placeholder: 'e.g. 2 EA', uppercase: true, required: true },
                        { id: 'manu_mat', label: 'Manufacturer PN (MANU_MAT)', type: 'text', placeholder: 'e.g. CF1633N', uppercase: true, required: true },
                        { id: 'mfr_no', label: 'MFR NO (CAGE CODE)', type: 'text', uppercase: true },
                        { id: 'document', label: 'Document Number', type: 'text', uppercase: true },
                    ]
                },
                {
                    title: '3. Plant & Locations',
                    fields: [
                        { id: 'zzuwerks', label: 'Unserviceable Plant', type: 'text', uppercase: true },
                        { id: 'zzulgort', label: 'Unserviceable St. Loc', type: 'text', uppercase: true },
                        { id: 'zzrwerks', label: 'Refurbishment Plant', type: 'text', uppercase: true },
                        { id: 'zzrilgort', label: 'Refurb Issue St. Loc', type: 'text', uppercase: true },
                        { id: 'zzrrlgort', label: 'Refurb Receipt St. Loc', type: 'text', uppercase: true },
                    ]
                },
                {
                    title: '4. Additional Details',
                    fields: [
                        { id: 'zzrarbpl', label: 'Parent Shop (ZZRARBPL)', type: 'text', uppercase: true },
                        { id: 'zzpwerks', label: 'Parent Shop Plant', type: 'text', uppercase: true },
                        { id: 'zzslgort', label: 'Serviceable St. Loc', type: 'text', uppercase: true },
                        { id: 'zzeqart', label: 'A/C Type (ZZEQART)', type: 'text', uppercase: true },
                        { id: 'ekgrp', label: 'Purchasing Group', type: 'text', uppercase: true },
                        { id: 'reg', label: 'Aircraft Reg (Reg)', type: 'text', uppercase: true }
                    ]
                }
            ],
            onSubmit: (formData) => {
                const newEntry = {
                    request: "EXISTING PN", requester: "Muhammad Rizki F", no: (pnData.length + 1).toString(),
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

        // Panggil Dynamic Modal dengan config baru
        openEntryModal(formConfig);
    });
}
