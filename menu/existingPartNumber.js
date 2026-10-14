// File: menu/existingPartNumber.js
import { openEntryModal } from './entryModal.js';

export function render(container) {
    // 1. INJEKSI HTML (Hanya Header, Tombol Modal & Tabel)
    container.innerHTML = `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
                <h3 class="card-title" style="margin-bottom: 5px;"><i class="ph ph-hard-drives"></i> Existing Part Number</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Isi seluruh field material yang diperlukan untuk tracking ke SAP.</p>
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

    // 2. STATE DATA (Mockup Awal)
    let pnData = [
        {
            request: "EXISTING PN", dangerous: "NO", shelf: "NO", requester: "Muhammad Rizki F",
            no: "1", type: "TOOLS", desc: "FREEZER", uom: "2 EA", pn: "CF1633N",
            mfr: "", doc: "", unserv_plant: "", unserv_loc: "", ref_plant: "", ref_iss: "",
            ref_rec: "", parent_shop: "", parent_plant: "", serv_loc: "", ac_type: "", pur_grp: "", reg: ""
        }
    ];

    // 3. FUNGSI RENDER TABLE
    function renderTable() {
        const tbody = document.getElementById('tbody-pn');
        tbody.innerHTML = ''; 

        pnData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
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

    // 4. LOGIKA TOMBOL & DEFINISI FIELD DINAMIS UNTUK MODAL
    document.getElementById('btn-add-pn').addEventListener('click', () => {
        
        // --- DI SINI KITA DEFINISIKAN SELURUH KOLOM YANG ADA DI TABEL SAP ---
        // Engine entryModal.js akan me-looping ini menjadi form 2 kolom.
        const formFields = [
            // General Info
            { id: 'dangerous_good', label: 'Dangerous Good', type: 'select', options: ['NO', 'YES'], required: true },
            { id: 'shelf_life', label: 'Shelf Life', type: 'select', options: ['NO', 'YES'], required: true },
            
            // Material Codes
            { id: 'matl_type', label: 'Matl Type (MATL_TYPE)', type: 'select', options: ['TOOLS', 'CONSUMABLE', 'SPAREPART'], required: true },
            { id: 'matl_desc', label: 'Material Desc (MATL_DESC)', type: 'text', placeholder: 'e.g. FREEZER', uppercase: true, required: true },
            { id: 'base_oum', label: 'Base Unit (BASE_OUM)', type: 'text', placeholder: 'e.g. 2 EA', uppercase: true, required: true },
            { id: 'manu_mat', label: 'Manufacturer PN (MANU_MAT)', type: 'text', placeholder: 'e.g. CF1633N', uppercase: true, required: true },
            { id: 'mfr_no', label: 'MFR NO (CAGE CODE)', type: 'text', uppercase: true },
            { id: 'document', label: 'Document Number', type: 'text', uppercase: true },
            
            // Plant & Location
            { id: 'zzuwerks', label: 'Unserviceable Plant (ZZUWERKS)', type: 'text', uppercase: true },
            { id: 'zzulgort', label: 'Unserviceable St. Loc (ZZULGORT)', type: 'text', uppercase: true },
            { id: 'zzrwerks', label: 'Refurbishment Plant (ZZRWERKS)', type: 'text', uppercase: true },
            { id: 'zzrilgort', label: 'Refurb Issue St. Loc (ZZRILGORT)', type: 'text', uppercase: true },
            { id: 'zzrrlgort', label: 'Refurb Receipt St. Loc (ZZRRLGORT)', type: 'text', uppercase: true },
            
            // Additional Details
            { id: 'zzrarbpl', label: 'Parent Shop (ZZRARBPL)', type: 'text', uppercase: true },
            { id: 'zzpwerks', label: 'Parent Shop Plant (ZZPWERKS)', type: 'text', uppercase: true },
            { id: 'zzslgort', label: 'Serviceable St. Loc (ZZSLGORT)', type: 'text', uppercase: true },
            { id: 'zzeqart', label: 'A/C Type (ZZEQART)', type: 'text', uppercase: true },
            { id: 'ekgrp', label: 'Purchasing Group (EKGRP)', type: 'text', uppercase: true },
            { id: 'reg', label: 'Aircraft Reg (Reg)', type: 'text', uppercase: true }
        ];

        // Panggil Dynamic Modal (entryModal.js)
        openEntryModal({
            title: '<i class="ph ph-hard-drives"></i> Tambah Data Existing PN',
            fields: formFields,
            onSubmit: (formData) => {
                // Semua input user dari modal otomatis ditangkap di parameter formData
                
                // Susun Object Baru sesuai kolom tabel
                const newEntry = {
                    request: "EXISTING PN",          // Auto
                    requester: "Muhammad Rizki F",   // Auto By Login
                    no: (pnData.length + 1).toString(), // Auto Increment
                    
                    dangerous: formData.dangerous_good,
                    shelf: formData.shelf_life,
                    type: formData.matl_type,
                    desc: formData.matl_desc,
                    uom: formData.base_oum,
                    pn: formData.manu_mat,
                    mfr: formData.mfr_no,
                    doc: formData.document,
                    unserv_plant: formData.zzuwerks,
                    unserv_loc: formData.zzulgort,
                    ref_plant: formData.zzrwerks,
                    ref_iss: formData.zzrilgort,
                    ref_rec: formData.zzrrlgort,
                    parent_shop: formData.zzrarbpl,
                    parent_plant: formData.zzpwerks,
                    serv_loc: formData.zzslgort,
                    ac_type: formData.zzeqart,
                    pur_grp: formData.ekgrp,
                    reg: formData.reg
                };

                // Push dan Render
                pnData.push(newEntry);
                renderTable();
            }
        });
    });
}
