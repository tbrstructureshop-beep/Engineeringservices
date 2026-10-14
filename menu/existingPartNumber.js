export function render(container) {
    // 1. Injeksi HTML ke container
    container.innerHTML = `
        <!-- FORM PENGISIAN -->
        <div class="card">
            <h3 class="card-title"><i class="ph ph-clipboard-text"></i> Material Request Form</h3>
            <form id="form-existing-pn">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Material Type</label>
                        <select id="matl_type" required>
                            <option value="TOOLS">TOOLS</option>
                            <option value="CONSUMABLE">CONSUMABLE</option>
                            <option value="SPAREPART">SPAREPART</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Material Description</label>
                        <input type="text" id="matl_desc" placeholder="e.g. FREEZER" required autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>Base Unit (UoM)</label>
                        <input type="text" id="base_oum" placeholder="e.g. 2 EA" required autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>Manufacturer PN</label>
                        <input type="text" id="manu_mat" placeholder="e.g. CF1633N" required autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>Dangerous Good</label>
                        <select id="dangerous_good">
                            <option value="NO">NO</option>
                            <option value="YES">YES</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn-submit">
                    <i class="ph ph-plus-circle"></i> Add to Tracking
                </button>
            </form>
        </div>

        <!-- TABLE TRACKING DATA -->
        <div class="card">
            <h3 class="card-title"><i class="ph ph-table"></i> Tracking Process Material SAP</h3>
            <div class="table-responsive">
                <table class="data-table" id="table-pn">
                    <thead>
                        <tr>
                            <th>Request</th>
                            <th>Dangerous Good</th>
                            <th>Shelf Life</th>
                            <th>Requester</th>
                            <th>NO</th>
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
                    </thead>
                    <tbody id="tbody-pn">
                        <!-- Rows injected via JS -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 2. Data Initial (Sesuai Tabel Instruksi Prompt)
    let pnData = [
        {
            request: "EXISTING PN", dangerous: "NO", shelf: "NO", requester: "Muhammad Rizki F",
            no: "1", type: "TOOLS", desc: "FREEZER", uom: "2 EA", pn: "CF1633N",
            mfr: "", doc: "", unserv_plant: "", unserv_loc: "", ref_plant: "", ref_iss: "",
            ref_rec: "", parent_shop: "", parent_plant: "", serv_loc: "", ac_type: "", pur_grp: "", reg: ""
        }
    ];

    // 3. Render Table
    function renderTable() {
        const tbody = document.getElementById('tbody-pn');
        tbody.innerHTML = ''; 

        pnData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="status-badge badge-green">${row.request}</span></td>
                <td><span class="status-badge badge-gray">${row.dangerous}</span></td>
                <td><span class="status-badge badge-gray">${row.shelf}</span></td>
                <td>${row.requester}</td>
                <td>${index + 1}</td>
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

    // Call first time
    renderTable();

    // 4. Handle Submit Form
    const form = document.getElementById('form-existing-pn');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Ambil Value
        const newEntry = {
            request: "EXISTING PN",
            dangerous: document.getElementById('dangerous_good').value,
            shelf: "NO", // Default
            requester: "Muhammad Rizki F", // Hardcoded User Header
            no: (pnData.length + 1).toString(),
            type: document.getElementById('matl_type').value,
            desc: document.getElementById('matl_desc').value.toUpperCase(),
            uom: document.getElementById('base_oum').value.toUpperCase(),
            pn: document.getElementById('manu_mat').value.toUpperCase(),
            // Empty columns for existing fields
            mfr: "", doc: "", unserv_plant: "", unserv_loc: "", ref_plant: "", ref_iss: "",
            ref_rec: "", parent_shop: "", parent_plant: "", serv_loc: "", ac_type: "", pur_grp: "", reg: ""
        };

        // Push and update UI
        pnData.push(newEntry);
        renderTable();
        
        // Reset form inputs
        form.reset();
    });
}
