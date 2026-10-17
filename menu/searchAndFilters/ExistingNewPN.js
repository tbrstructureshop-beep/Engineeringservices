// File: menu/searchAndFilters/ExistingNewPN.js

export class ExistingPNFilterManager {
    constructor({ onFilterApplied }) {
        this.onFilterApplied = onFilterApplied;
        this.isFilterActive = false;
        this.activeFilters = {}; // { colKey: Set(['val1', 'val2']) | null }
        this.dataset = [];
        this.activeDropdown = null;

        this.injectStyles();
        this.initGlobalListener();
    }

    // Injeksi CSS Google Sheets Filter
    injectStyles() {
        if (document.getElementById('gsheet-filter-style')) return;
        const style = document.createElement('style');
        style.id = 'gsheet-filter-style';
        style.innerHTML = `
            .th-filter-wrapper { display: flex; align-items: center; justify-content: space-between; gap: 6px; width: 100%; position: relative; }
            .th-filter-btn {
                background: none; border: 1px solid transparent; color: var(--text-muted);
                border-radius: 4px; padding: 2px 4px; cursor: pointer; display: inline-flex;
                align-items: center; justify-content: center; font-size: 0.95rem; transition: 0.2s;
            }
            .th-filter-btn:hover { background: var(--bg-main); color: var(--primary); }
            .th-filter-btn.filtered { color: var(--primary); background: #eff6ff; border-color: #bfdbfe; font-weight: 700; }
            
            /* Popover Dropdown ala Google Sheets */
            .gsheet-dropdown {
                position: fixed; z-index: 10000; width: 260px; background: var(--bg-card);
                border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                display: flex; flex-direction: column; overflow: hidden; font-family: inherit; font-size: 0.82rem;
                animation: gsheetFadeIn 0.15s ease-out; text-align: left;
            }
            @keyframes gsheetFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            
            .gsheet-search-box { padding: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-main); }
            .gsheet-search-input {
                width: 100%; padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 6px;
                background: var(--bg-card); color: var(--text-main); font-size: 0.8rem; outline: none;
            }
            .gsheet-search-input:focus { border-color: var(--primary); }
            
            .gsheet-quick-actions { display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid var(--border-color); font-size: 0.75rem; }
            .gsheet-link { color: var(--primary); cursor: pointer; font-weight: 600; text-decoration: none; }
            .gsheet-link:hover { text-decoration: underline; }
            
            .gsheet-list { max-height: 190px; overflow-y: auto; padding: 6px 10px; display: flex; flex-direction: column; gap: 4px; }
            .gsheet-item { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 4px; cursor: pointer; user-select: none; }
            .gsheet-item:hover { background: var(--bg-main); }
            .gsheet-item input[type="checkbox"] { cursor: pointer; }
            .gsheet-item-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-main); }
            
            .gsheet-footer { display: flex; justify-content: flex-end; gap: 6px; padding: 8px 10px; border-top: 1px solid var(--border-color); background: var(--bg-main); }
            .gsheet-btn { padding: 5px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border-color); }
            .gsheet-btn-ok { background: var(--primary); color: white; border-color: var(--primary); }
            .gsheet-btn-cancel { background: var(--bg-card); color: var(--text-muted); }
        `;
        document.head.appendChild(style);
    }

    initGlobalListener() {
        document.addEventListener('click', (e) => {
            if (this.activeDropdown && !this.activeDropdown.contains(e.target) && !e.target.closest('.th-filter-btn')) {
                this.closeDropdown();
            }
        });
    }

    setDataset(data) {
        this.dataset = data || [];
    }

    toggleFilterMode(tableEl) {
        this.isFilterActive = !this.isFilterActive;
        if (!this.isFilterActive) {
            this.resetAllFilters();
        }
        this.renderHeaders(tableEl);
        return this.isFilterActive;
    }

    resetAllFilters() {
        this.activeFilters = {};
        this.closeDropdown();
        if (this.onFilterApplied) this.onFilterApplied(this.getFilteredData());
    }

    closeDropdown() {
        if (this.activeDropdown) {
            this.activeDropdown.remove();
            this.activeDropdown = null;
        }
    }

    // Helper Ekstraksi Nilai Baris
    getRowValue(row, colKey) {
        if (colKey === 'ticketNo') return row.ticketNo || '';
        if (colKey === 'status') return row.status || '';
        if (colKey === 'request') return row.request || '';
        if (colKey === 'requester') return `${row.requester} (${row.dept || '-'})`;
        if (colKey === 'pns') return (row.pns || []).map(p => p.pn);
        return '';
    }

    // Menghasilkan data yang sudah terfilter multi-kolom
    getFilteredData() {
        if (!this.isFilterActive) return this.dataset;

        return this.dataset.filter(row => {
            for (const [colKey, selectedSet] of Object.entries(this.activeFilters)) {
                if (!selectedSet) continue;
                const rowVal = this.getRowValue(row, colKey);
                if (Array.isArray(rowVal)) {
                    if (!rowVal.some(v => selectedSet.has(v))) return false;
                } else {
                    if (!selectedSet.has(rowVal)) return false;
                }
            }
            return true;
        });
    }

    // Mengambil opsi unik cascading (menyesuaikan filter kolom lain)
    getAvailableOptionsForColumn(targetColKey) {
        // Filter baris menggunakan SEMUA filter kolom lain KECUALI targetColKey
        const subset = this.dataset.filter(row => {
            for (const [colKey, selectedSet] of Object.entries(this.activeFilters)) {
                if (colKey === targetColKey || !selectedSet) continue;
                const rowVal = this.getRowValue(row, colKey);
                if (Array.isArray(rowVal)) {
                    if (!rowVal.some(v => selectedSet.has(v))) return false;
                } else {
                    if (!selectedSet.has(rowVal)) return false;
                }
            }
            return true;
        });

        // Kumpulkan nilai unik
        const uniqueSet = new Set();
        subset.forEach(row => {
            const val = this.getRowValue(row, targetColKey);
            if (Array.isArray(val)) val.forEach(v => v && uniqueSet.add(v));
            else if (val) uniqueSet.add(val);
        });

        return Array.from(uniqueSet).sort();
    }

    // Pasang tombol funnel di <th> tabel
    renderHeaders(tableEl) {
        if (!tableEl) return;
        const thead = tableEl.querySelector('thead');
        if (!thead) return;

        const thList = thead.querySelectorAll('tr th');
        const colMapping = [null, 'ticketNo', 'status', 'request', 'requester', 'pns', null];

        thList.forEach((th, idx) => {
            const colKey = colMapping[idx];
            // Hapus filter lama jika ada
            const oldWrapper = th.querySelector('.th-filter-wrapper');
            if (oldWrapper) {
                th.innerHTML = oldWrapper.querySelector('.th-title-text').innerHTML;
            }

            if (!this.isFilterActive || !colKey) return;

            const originalHTML = th.innerHTML;
            const isColFiltered = Boolean(this.activeFilters[colKey]);

            th.innerHTML = `
                <div class="th-filter-wrapper">
                    <span class="th-title-text">${originalHTML}</span>
                    <button type="button" class="th-filter-btn ${isColFiltered ? 'filtered' : ''}" data-col="${colKey}" title="Filter ${colKey}">
                        <i class="ph ph-funnel"></i>
                    </button>
                </div>
            `;

            const btn = th.querySelector('.th-filter-btn');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openDropdown(btn, colKey);
            });
        });
    }

    // Buka Dropdown Popover ala Google Sheets
    openDropdown(triggerBtn, colKey) {
        this.closeDropdown();

        const allAvailableOptions = this.getAvailableOptionsForColumn(colKey);
        const currentSelectedSet = this.activeFilters[colKey] ? new Set(this.activeFilters[colKey]) : new Set(allAvailableOptions);

        const rect = triggerBtn.getBoundingClientRect();
        const dropdown = document.createElement('div');
        dropdown.className = 'gsheet-dropdown';
        dropdown.style.top = `${rect.bottom + 6}px`;
        dropdown.style.left = `${Math.min(rect.left, window.innerWidth - 275)}px`;

        dropdown.innerHTML = `
            <div class="gsheet-search-box">
                <input type="text" class="gsheet-search-input" placeholder="Search values..." autofocus>
            </div>
            <div class="gsheet-quick-actions">
                <span class="gsheet-link" id="gs-select-all">Select All</span>
                <span class="gsheet-link" id="gs-clear-all">Clear</span>
            </div>
            <div class="gsheet-list" id="gs-items-box"></div>
            <div class="gsheet-footer">
                <button type="button" class="gsheet-btn gsheet-btn-cancel" id="gs-btn-cancel">Cancel</button>
                <button type="button" class="gsheet-btn gsheet-btn-ok" id="gs-btn-ok">OK</button>
            </div>
        `;

        document.body.appendChild(dropdown);
        this.activeDropdown = dropdown;

        const itemsBox = dropdown.querySelector('#gs-items-box');
        const searchInput = dropdown.querySelector('.gsheet-search-input');
        const selectAllLink = dropdown.querySelector('#gs-select-all');
        const clearAllLink = dropdown.querySelector('#gs-clear-all');
        const btnOk = dropdown.querySelector('#gs-btn-ok');
        const btnCancel = dropdown.querySelector('#gs-btn-cancel');

        // Render checklist item berdasarkan pencarian (normalized case)
        const renderCheckboxes = (keyword = '') => {
            const normalized = keyword.toLowerCase().trim();
            const filteredOptions = allAvailableOptions.filter(opt => opt.toLowerCase().includes(normalized));

            if (filteredOptions.length === 0) {
                itemsBox.innerHTML = `<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:0.75rem;">No matching values</div>`;
                return;
            }

            itemsBox.innerHTML = filteredOptions.map(opt => {
                const isChecked = currentSelectedSet.has(opt);
                return `
                    <label class="gsheet-item">
                        <input type="checkbox" value="${opt}" ${isChecked ? 'checked' : ''}>
                        <span class="gsheet-item-label" title="${opt}">${opt}</span>
                    </label>
                `;
            }).join('');

            // Event listener toggle individual checkbox
            itemsBox.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                chk.addEventListener('change', () => {
                    if (chk.checked) currentSelectedSet.add(chk.value);
                    else currentSelectedSet.delete(chk.value);
                });
            });
        };

        renderCheckboxes();

        // Search event (Normalized Case)
        searchInput.addEventListener('input', (e) => {
            renderCheckboxes(e.target.value);
        });

        // Quick Actions
        selectAllLink.addEventListener('click', () => {
            allAvailableOptions.forEach(opt => currentSelectedSet.add(opt));
            renderCheckboxes(searchInput.value);
        });

        clearAllLink.addEventListener('click', () => {
            currentSelectedSet.clear();
            renderCheckboxes(searchInput.value);
        });

        // Cancel
        btnCancel.addEventListener('click', () => this.closeDropdown());

        // OK (Terapkan Filter)
        btnOk.addEventListener('click', () => {
            if (currentSelectedSet.size === allAvailableOptions.length) {
                // Semua dipilih = Tidak ada filter aktif pada kolom ini
                delete this.activeFilters[colKey];
            } else {
                this.activeFilters[colKey] = new Set(currentSelectedSet);
            }

            this.closeDropdown();
            triggerBtn.classList.toggle('filtered', Boolean(this.activeFilters[colKey]));
            
            if (this.onFilterApplied) {
                this.onFilterApplied(this.getFilteredData());
            }
        });
    }
}
