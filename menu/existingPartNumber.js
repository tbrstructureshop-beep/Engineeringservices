// File: menu/existingPartNumber.js
import { openEntryModal } from './entryModal.js';

export function render(container) {
    // 1. Injeksi HTML (Hanya Tombol Modal & Tabel 2 Baris)
    container.innerHTML = `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3 class="card-title" style="margin-bottom: 5px;"><i class="ph ph-hard-drives"></i> Existing Part Number</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Manage and track existing material processes to SAP.</p>
            </div>
            <button id="btn-add-pn" class="btn-submit" style="margin-top: 0;">
                <i class="ph ph-plus-circle"></i> Add New Request
            </button>
        </div>

        <!-- TABLE TRACKING DATA -->
        <div class="card">
            <h3 class="card-title"><i class="ph ph-table"></i> Tracking Process Material SAP</h3>
            <div class="table-responsive">
                <table class="data-table" id="table-pn">
                    <thead>
                        <!-- ROW 1: DESKRIPSI -->
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
                            <th>DOCUMENT NUMBER (WITHOUT DMS)</th>
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
                        <!-- ROW 2: SAP CODE -->
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
                    <tbody id="tbody-pn">
                        <!-- Rows injected via JS -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 2. Data Initial
    let pnData = [
        {
            request: "EXISTING PN", dangerous: "NO", shelf: "NO", requester: "Muhammad Rizki F",
            no: "1", type: "TOOLS", desc: "FREEZER", uom: "2 EA", pn: "CF1633N",
            mfr: "", doc: "", unserv_plant: "", unserv_loc: "", ref_plant: "", ref_iss: "",
            ref_rec: "", parent_shop: "", parent_plant: "", serv_loc: "", ac_type: "", pur_grp: "", reg: ""
        }
    ];

    // 3. Fungsi Render Table
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

    // 4. Handle Klik Tombol "Add New Request" (Memanggil Modal)
    document.getElementById('btn-add-pn').addEventListener('click', () => {
        
        // Konfigurasi Input apa saja yang dibutuhkan menu ini
        const formFields = [
            { id: 'matl_type', label: 'Material Type (MATL_TYPE)', type: 'select', options: ['TOOLS', 'CONSUMABLE', 'SPAREPART'], required: true },
            { id: 'matl_desc', label: 'Material Description', type: 'text', placeholder: 'e.g. FREEZER', required: true },
            { id: 'base_oum', label: 'Base Unit (BASE_OUM)', type: 'text', placeholder: 'e.g. 2 EA', required: true },
            { id: 'manu_mat', label: 'Manufacturer PN (MANU_MAT)', type: 'text', placeholder: 'e.g. CF1633N', required: true },
            { id: 'dangerous_good', label: 'Dangerous Good', type: 'select', options: ['NO', 'YES'], required: true }
        ];

        // Panggil Dynamic Modal
        openEntryModal({
            title: 'Submit Existing PN',
            fields: formFields,
            onSubmit: (formData) => {
                // Logic setelah tombol submit modal di klik
                const newEntry = {
                    request: "EXISTING PN",
                    dangerous: formData.dangerous_good,
                    shelf: "NO", // Default
                    requester: "Muhammad Rizki F", // Hardcoded
                    no: (pnData.length + 1).toString(),
                    type: formData.matl_type,
                    desc: formData.matl_desc.toUpperCase(),
                    uom: formData.base_oum.toUpperCase(),
                    pn: formData.manu_mat.toUpperCase(),
                    // Sisanya kosong sesuai requirement existing form
                    mfr: "", doc: "", unserv_plant: "", unserv_loc: "", ref_plant: "", ref_iss: "",
                    ref_rec: "", parent_shop: "", parent_plant: "", serv_loc: "", ac_type: "", pur_grp: "", reg: ""
                };

                pnData.push(newEntry);
                renderTable();
            }
        });
    });
}
