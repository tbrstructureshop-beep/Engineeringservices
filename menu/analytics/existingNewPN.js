// File: menu/analytics/existingNewPN.js
import { fetchAllTickets } from '../../config/Transaction/existingPN.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/auto/+esm';

export async function render(container) {
    container.innerHTML = `
        <style>
            .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
            .kpi-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
            .kpi-val { font-size: 1.5rem; font-weight: 700; color: var(--text-main); line-height: 1.1; margin-top: 3px; }
            .kpi-label { font-size: 0.72rem; text-transform: uppercase; font-weight: 600; color: var(--text-muted); }

            /* Filter Bar Bergaya Toolbar Google Spreadsheet */
            .filter-toolbar {
                background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px;
                padding: 14px 18px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
            }
            .filter-pill-btn {
                background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);
                height: 38px; padding: 0 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 600;
                cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; position: relative;
            }
            .filter-pill-btn:hover { border-color: var(--primary); }
            .filter-pill-btn.active { background: rgba(37, 99, 235, 0.1); border-color: var(--primary); color: var(--primary); }
            .filter-pill-btn .badge-count {
                background: var(--primary); color: white; font-size: 0.7rem; padding: 1px 6px; border-radius: 10px; font-weight: 700;
            }

            .date-input-group { display: inline-flex; align-items: center; gap: 6px; background: var(--bg-main); padding: 0 10px; height: 38px; border-radius: 8px; border: 1px solid var(--border-color); }
            .date-input-group input[type="date"] { border: none; background: transparent; color: var(--text-main); font-family: inherit; font-size: 0.82rem; outline: none; }

            /* Dropdown Checklist Ala Google Sheets */
            .gs-popover {
                position: absolute; z-index: 10000; width: 270px; background: var(--bg-card);
                border: 1px solid var(--border-color); border-radius: 10px; box-shadow: 0 12px 28px rgba(0,0,0,0.22);
                display: flex; flex-direction: column; overflow: hidden; animation: gsFade 0.15s ease-out; font-size: 0.82rem;
            }
            @keyframes gsFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            .gs-search-wrap { padding: 10px; background: var(--bg-main); border-bottom: 1px solid var(--border-color); }
            .gs-search-input { width: 100%; height: 32px; padding: 0 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card); color: var(--text-main); outline: none; font-size: 0.8rem; }
            .gs-search-input:focus { border-color: var(--primary); }
            .gs-actions { display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--border-color); font-size: 0.75rem; background: var(--bg-card); }
            .gs-link { color: var(--primary); font-weight: 600; cursor: pointer; user-select: none; }
            .gs-link:hover { text-decoration: underline; }
            .gs-list { max-height: 200px; overflow-y: auto; padding: 6px 8px; display: flex; flex-direction: column; gap: 3px; }
            .gs-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 5px; cursor: pointer; user-select: none; }
            .gs-item:hover { background: var(--bg-main); }
            .gs-item input[type="checkbox"] { cursor: pointer; }
            .gs-item-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main); }
            .gs-item-count { font-size: 0.7rem; color: var(--text-muted); background: var(--bg-main); padding: 1px 6px; border-radius: 8px; }
            .gs-footer { display: flex; justify-content: flex-end; gap: 6px; padding: 10px; background: var(--bg-main); border-top: 1px solid var(--border-color); }
            .gs-btn { padding: 6px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border-color); }
            .gs-btn-apply { background: var(--primary); color: white; border-color: var(--primary); }
            .gs-btn-cancel { background: var(--bg-card); color: var(--text-muted); }

            /* Charts Layout */
            .chart-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(440px, 1fr)); gap: 20px; margin-bottom: 20px; }
            .chart-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
            .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
            .chart-title { font-size: 0.95rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px; margin: 0; }
            .chart-controls { display: flex; align-items: center; gap: 6px; }
            .chart-box { position: relative; flex: 1; min-height: 290px; width: 100%; display: flex; align-items: center; justify-content: center; }

            .btn-mini-tool {
                background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);
                font-size: 0.72rem; font-weight: 600; padding: 4px 8px; border-radius: 5px; cursor: pointer;
            }
            .btn-mini-tool:hover, .btn-mini-tool.active { border-color: var(--primary); color: var(--primary); }
        </style>

        <!-- TOP BAR -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
            <div>
                <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-main); margin: 0;">
                    <i class="ph ph-chart-polar" style="color:var(--primary);"></i> Existing PN Analytics & Executive Intelligence
                </h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                    Statistik multi-parameter, perbandingan unit kerja, dan tracking kepatuhan status SAP.
                </p>
            </div>
            <button id="btn-back-to-table" class="btn-submit" style="margin: 0; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main);">
                <i class="ph ph-table"></i> Back to Dashboard
            </button>
        </div>

        <!-- GOOGLE SHEETS MULTI-FILTER TOOLBAR -->
        <div class="filter-toolbar">
            <!-- Date Filter -->
            <div class="date-input-group">
                <i class="ph ph-calendar" style="color:var(--text-muted);"></i>
                <input type="date" id="flt-date-from" title="Date From">
                <span style="color:var(--text-muted); font-size:0.75rem;">to</span>
                <input type="date" id="flt-date-to" title="Date To">
            </div>

            <!-- Unit Filter Button -->
            <button type="button" class="filter-pill-btn" id="btn-filter-unit">
                <i class="ph ph-buildings"></i> Unit / Dept: <span id="label-unit-status">All</span>
                <i class="ph ph-caret-down"></i>
            </button>

            <!-- Status Filter Button -->
            <button type="button" class="filter-pill-btn" id="btn-filter-status">
                <i class="ph ph-tag"></i> Status: <span id="label-status-status">All</span>
                <i class="ph ph-caret-down"></i>
            </button>

            <!-- Requester Filter Button -->
            <button type="button" class="filter-pill-btn" id="btn-filter-req">
                <i class="ph ph-user"></i> Requester: <span id="label-req-status">All</span>
                <i class="ph ph-caret-down"></i>
            </button>

            <button type="button" id="btn-reset-filters" class="btn-mini-tool" style="height: 38px; padding: 0 14px; border-color: #ef4444; color: #ef4444; margin-left: auto;">
                <i class="ph ph-arrow-counter-clockwise"></i> Reset Filters
            </button>
        </div>

        <!-- KPI SUMMARY CARDS -->
        <div class="analytics-grid">
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#eff6ff; color:#2563eb;"><i class="ph ph-ticket"></i></div>
                <div>
                    <div class="kpi-label">Total Tiket</div>
                    <div class="kpi-val" id="kpi-total-tickets">0</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#ecfdf5; color:#059669;"><i class="ph ph-package"></i></div>
                <div>
                    <div class="kpi-label">Total Material (PN)</div>
                    <div class="kpi-val" id="kpi-total-pns">0</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#fef3c7; color:#d97706;"><i class="ph ph-clock-countdown"></i></div>
                <div>
                    <div class="kpi-label">In-Progress</div>
                    <div class="kpi-val" id="kpi-in-progress">0</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#f3e8ff; color:#9333ea;"><i class="ph ph-check-circle"></i></div>
                <div>
                    <div class="kpi-label">Created on SAP</div>
                    <div class="kpi-val" id="kpi-completed">0</div>
                </div>
            </div>
        </div>

        <!-- CHARTS SECTION -->
        <div class="chart-row">
            <!-- Chart 1: Status Distribution -->
            <div class="chart-card">
                <div class="chart-header">
                    <h4 class="chart-title"><i class="ph ph-chart-pie"></i> Status Distribution</h4>
                    <button type="button" class="btn-mini-tool" id="btn-toggle-status-type">
                        <i class="ph ph-arrows-left-right"></i> <span id="label-status-chart-type">Pie Mode</span>
                    </button>
                </div>
                <div class="chart-box"><canvas id="canvas-status"></canvas></div>
            </div>

            <!-- Chart 2: Top Units by Request -->
            <div class="chart-card">
                <div class="chart-header">
                    <h4 class="chart-title"><i class="ph ph-chart-bar"></i> Total Request by Unit</h4>
                    <div class="chart-controls">
                        <!-- Smart Top-N Ranking agar tidak mepet jika unit sangat banyak -->
                        <select id="sel-top-unit" class="btn-mini-tool" style="outline:none; height:26px;">
                            <option value="5">Top 5 Units</option>
                            <option value="10" selected>Top 10 Units</option>
                            <option value="all">All Selected</option>
                        </select>
                        <button type="button" class="btn-mini-tool" id="btn-toggle-unit-axis">
                            <i class="ph ph-arrows-clockwise"></i> <span id="label-unit-axis">Horiz</span>
                        </button>
                    </div>
                </div>
                <div class="chart-box"><canvas id="canvas-unit"></canvas></div>
            </div>
        </div>

        <div class="chart-row">
            <!-- Chart 3: Comparison Matrix -->
            <div class="chart-card" style="grid-column: span 2;">
                <div class="chart-header">
                    <div>
                        <h4 class="chart-title"><i class="ph ph-sliders-horizontal"></i> Unit vs Status Comparison Matrix</h4>
                        <span style="font-size:0.75rem; color:var(--text-muted);">Analisis komparasi progres tiap unit (Mencegah grafik padat dengan batasan unit pilihan)</span>
                    </div>
                    <div class="chart-controls">
                        <button type="button" class="btn-mini-tool active" id="btn-comp-stacked">Stacked</button>
                        <button type="button" class="btn-mini-tool" id="btn-comp-grouped">Grouped</button>
                    </div>
                </div>
                <div class="chart-box" style="min-height:320px;"><canvas id="canvas-comparison"></canvas></div>
            </div>
        </div>
    `;

    // 1. Ambil data asli Supabase
    let rawTickets = [];
    try {
        rawTickets = await fetchAllTickets();
    } catch (e) {
        console.error("Gagal load analytics data:", e);
    }

    // 2. State Filter Spreadsheet
    const allUnits = Array.from(new Set(rawTickets.map(t => t.dept || 'Unknown'))).sort();
    const allStatuses = ['Received', 'Under Evaluation', 'Created'];
    const allRequesters = Array.from(new Set(rawTickets.map(t => t.requester || 'User'))).sort();

    let selectedUnits = new Set(allUnits);
    let selectedStatuses = new Set(allStatuses);
    let selectedRequesters = new Set(allRequesters);

    let statusChartType = 'doughnut';
    let unitChartAxis = 'y'; // horizontal
    let comparisonStacked = true;
    let topUnitLimit = 10;

    let chartStatusInst = null;
    let chartUnitInst = null;
    let chartComparisonInst = null;

    let activePopover = null;

    function isDark() { return localStorage.getItem('darkMode') === 'true'; }
    function textColor() { return isDark() ? '#94a3b8' : '#64748b'; }
    function gridColor() { return isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }

    // Helper: Buka Popover Checklist Google Sheets
    function openGoogleSheetFilter({ triggerBtn, title, allItems, selectedSet, onApply, getItemCount }) {
        if (activePopover) { activePopover.remove(); activePopover = null; }

        const rect = triggerBtn.getBoundingClientRect();
        const popover = document.createElement('div');
        popover.className = 'gs-popover';
        popover.style.top = `${rect.bottom + 6}px`;
        popover.style.left = `${Math.min(rect.left, window.innerWidth - 285)}px`;

        const workingSet = new Set(selectedSet);

        popover.innerHTML = `
            <div class="gs-search-wrap">
                <input type="text" class="gs-search-input" placeholder="Search ${title}..." autofocus>
            </div>
            <div class="gs-actions">
                <span class="gs-link" id="act-select-all">Select All</span>
                <span class="gs-link" id="act-clear-all">Clear</span>
            </div>
            <div class="gs-list" id="gs-items-container"></div>
            <div class="gs-footer">
                <button type="button" class="gs-btn gs-btn-cancel" id="act-cancel">Cancel</button>
                <button type="button" class="gs-btn gs-btn-apply" id="act-apply">Apply</button>
            </div>
        `;

        document.body.appendChild(popover);
        activePopover = popover;

        const listContainer = popover.querySelector('#gs-items-container');
        const searchInput = popover.querySelector('.gs-search-input');

        const renderItems = (kw = '') => {
            const normalized = kw.toLowerCase().trim();
            const filtered = allItems.filter(item => item.toLowerCase().includes(normalized));

            if (filtered.length === 0) {
                listContainer.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:0.75rem;">No matching ${title}</div>`;
                return;
            }

            listContainer.innerHTML = filtered.map(item => {
                const checked = workingSet.has(item);
                const count = getItemCount ? getItemCount(item) : '';
                return `
                    <label class="gs-item">
                        <input type="checkbox" value="${item}" ${checked ? 'checked' : ''}>
                        <span class="gs-item-text" title="${item}">${item}</span>
                        ${count !== '' ? `<span class="gs-item-count">${count}</span>` : ''}
                    </label>
                `;
            }).join('');

            listContainer.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                chk.addEventListener('change', () => {
                    if (chk.checked) workingSet.add(chk.value);
                    else workingSet.delete(chk.value);
                });
            });
        };

        renderItems();

        searchInput.addEventListener('input', (e) => renderItems(e.target.value));

        popover.querySelector('#act-select-all').addEventListener('click', () => {
            allItems.forEach(i => workingSet.add(i));
            renderItems(searchInput.value);
        });

        popover.querySelector('#act-clear-all').addEventListener('click', () => {
            workingSet.clear();
            renderItems(searchInput.value);
        });

        popover.querySelector('#act-cancel').addEventListener('click', () => {
            popover.remove(); activePopover = null;
        });

        popover.querySelector('#act-apply').addEventListener('click', () => {
            onApply(workingSet);
            popover.remove(); activePopover = null;
        });
    }

    // Klik di luar popover untuk menutup
    document.addEventListener('click', (e) => {
        if (activePopover && !activePopover.contains(e.target) && !e.target.closest('.filter-pill-btn')) {
            activePopover.remove(); activePopover = null;
        }
    });

    // 3. FUNGSI UTAMA KALKULASI DATA & RENDER GRAFIK
    function updateAnalytics() {
        const dFrom = document.getElementById('flt-date-from').value;
        const dTo = document.getElementById('flt-date-to').value;

        // Update Labels Toolbar
        const unitLbl = document.getElementById('label-unit-status');
        const statusLbl = document.getElementById('label-status-status');
        const reqLbl = document.getElementById('label-req-status');

        unitLbl.textContent = selectedUnits.size === allUnits.length ? 'All' : `${selectedUnits.size} Selected`;
        statusLbl.textContent = selectedStatuses.size === allStatuses.length ? 'All' : `${selectedStatuses.size} Selected`;
        reqLbl.textContent = selectedRequesters.size === allRequesters.length ? 'All' : `${selectedRequesters.size} Selected`;

        document.getElementById('btn-filter-unit').classList.toggle('active', selectedUnits.size !== allUnits.length);
        document.getElementById('btn-filter-status').classList.toggle('active', selectedStatuses.size !== allStatuses.length);
        document.getElementById('btn-filter-req').classList.toggle('active', selectedRequesters.size !== allRequesters.length);

        // Filter Dataset
        const filtered = rawTickets.filter(t => {
            const u = t.dept || 'Unknown';
            const s = t.status;
            const r = t.requester || 'User';

            if (!selectedUnits.has(u)) return false;
            if (!selectedStatuses.has(s)) return false;
            if (!selectedRequesters.has(r)) return false;

            if (dFrom || dTo) {
                const tDate = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : null;
                if (dFrom && (!tDate || tDate < dFrom)) return false;
                if (dTo && (!tDate || tDate > dTo)) return false;
            }
            return true;
        });

        // Update KPIs
        const totalTickets = filtered.length;
        const totalPns = filtered.reduce((acc, t) => acc + (t.pns ? t.pns.length : 0), 0);
        const inProgress = filtered.filter(t => t.status === 'Received' || t.status === 'Under Evaluation').length;
        const completed = filtered.filter(t => t.status === 'Created').length;

        document.getElementById('kpi-total-tickets').textContent = totalTickets;
        document.getElementById('kpi-total-pns').textContent = totalPns;
        document.getElementById('kpi-in-progress').textContent = inProgress;
        document.getElementById('kpi-completed').textContent = completed;

        // Render Grafik
        renderStatusChart(filtered);
        renderUnitChart(filtered);
        renderComparisonChart(filtered);
    }

    // Chart 1: Status Distribution
    function renderStatusChart(data) {
        const counts = { 'Received': 0, 'Under Evaluation': 0, 'Created': 0 };
        data.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });

        const ctx = document.getElementById('canvas-status').getContext('2d');
        if (chartStatusInst) chartStatusInst.destroy();

        chartStatusInst = new Chart(ctx, {
            type: statusChartType,
            data: {
                labels: ['Received', 'Under Evaluation', 'Created on SAP'],
                datasets: [{
                    data: [counts['Received'], counts['Under Evaluation'], counts['Created']],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
                    borderWidth: 2,
                    borderColor: isDark() ? '#1e293b' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor(), boxWidth: 12, padding: 15, font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    }

    // Chart 2: Volume by Unit (Smart Top-N Ranking)
    function renderUnitChart(data) {
        const unitMap = {};
        data.forEach(t => {
            const u = t.dept || 'Unknown';
            unitMap[u] = (unitMap[u] || 0) + 1;
        });

        // Urutkan dari yang terbesar (Descending)
        let sortedUnits = Object.entries(unitMap).sort((a, b) => b[1] - a[1]);

        // Terapkan batasan Top-N jika banyak unit
        if (topUnitLimit !== 'all') {
            const limitNum = parseInt(topUnitLimit);
            sortedUnits = sortedUnits.slice(0, limitNum);
        }

        const labels = sortedUnits.map(x => x[0]);
        const values = sortedUnits.map(x => x[1]);

        const ctx = document.getElementById('canvas-unit').getContext('2d');
        if (chartUnitInst) chartUnitInst.destroy();

        chartUnitInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tickets',
                    data: values,
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: unitChartAxis,
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: textColor(), font: { size: 10 } }, grid: { color: gridColor() } },
                    y: { ticks: { color: textColor(), font: { size: 10 } }, grid: { color: gridColor() } }
                }
            }
        });
    }

    // Chart 3: Comparison Matrix (Stacked / Grouped)
    function renderComparisonChart(data) {
        const unitMap = {};
        data.forEach(t => {
            const u = t.dept || 'Unknown';
            unitMap[u] = (unitMap[u] || 0) + 1;
        });

        // Urutkan unit agar grafik selalu rapi
        let targetUnits = Object.entries(unitMap).sort((a, b) => b[1] - a[1]).map(x => x[0]);
        if (topUnitLimit !== 'all') {
            targetUnits = targetUnits.slice(0, parseInt(topUnitLimit));
        }

        const receivedData = [];
        const underEvalData = [];
        const createdData = [];

        targetUnits.forEach(u => {
            const list = data.filter(t => (t.dept || 'Unknown') === u);
            receivedData.push(list.filter(t => t.status === 'Received').length);
            underEvalData.push(list.filter(t => t.status === 'Under Evaluation').length);
            createdData.push(list.filter(t => t.status === 'Created').length);
        });

        const ctx = document.getElementById('canvas-comparison').getContext('2d');
        if (chartComparisonInst) chartComparisonInst.destroy();

        chartComparisonInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: targetUnits,
                datasets: [
                    { label: 'Received', data: receivedData, backgroundColor: '#3b82f6', borderRadius: 4 },
                    { label: 'Under Evaluation', data: underEvalData, backgroundColor: '#f59e0b', borderRadius: 4 },
                    { label: 'Created (Done)', data: createdData, backgroundColor: '#10b981', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: textColor(), boxWidth: 12, padding: 12, font: { size: 11 } }
                    }
                },
                scales: {
                    x: {
                        stacked: comparisonStacked,
                        ticks: { color: textColor(), font: { size: 11 } },
                        grid: { color: gridColor() }
                    },
                    y: {
                        stacked: comparisonStacked,
                        ticks: { color: textColor(), font: { size: 11 }, stepSize: 1 },
                        grid: { color: gridColor() }
                    }
                }
            }
        });
    }

    // 4. EVENT LISTENERS FILTER GOOGLE SHEETS
    document.getElementById('btn-filter-unit').addEventListener('click', (e) => {
        openGoogleSheetFilter({
            triggerBtn: e.currentTarget,
            title: 'Unit',
            allItems: allUnits,
            selectedSet: selectedUnits,
            getItemCount: (u) => rawTickets.filter(t => (t.dept || 'Unknown') === u).length,
            onApply: (newSet) => {
                selectedUnits = new Set(newSet);
                updateAnalytics();
            }
        });
    });

    document.getElementById('btn-filter-status').addEventListener('click', (e) => {
        openGoogleSheetFilter({
            triggerBtn: e.currentTarget,
            title: 'Status',
            allItems: allStatuses,
            selectedSet: selectedStatuses,
            getItemCount: (s) => rawTickets.filter(t => t.status === s).length,
            onApply: (newSet) => {
                selectedStatuses = new Set(newSet);
                updateAnalytics();
            }
        });
    });

    document.getElementById('btn-filter-req').addEventListener('click', (e) => {
        openGoogleSheetFilter({
            triggerBtn: e.currentTarget,
            title: 'Requester',
            allItems: allRequesters,
            selectedSet: selectedRequesters,
            getItemCount: (r) => rawTickets.filter(t => (t.requester || 'User') === r).length,
            onApply: (newSet) => {
                selectedRequesters = new Set(newSet);
                updateAnalytics();
            }
        });
    });

    // Date range listeners
    document.getElementById('flt-date-from').addEventListener('change', updateAnalytics);
    document.getElementById('flt-date-to').addEventListener('change', updateAnalytics);

    // Reset Filters
    document.getElementById('btn-reset-filters').addEventListener('click', () => {
        selectedUnits = new Set(allUnits);
        selectedStatuses = new Set(allStatuses);
        selectedRequesters = new Set(allRequesters);
        document.getElementById('flt-date-from').value = '';
        document.getElementById('flt-date-to').value = '';
        updateAnalytics();
    });

    // Toggle Pie / Doughnut
    document.getElementById('btn-toggle-status-type').addEventListener('click', () => {
        statusChartType = (statusChartType === 'doughnut') ? 'pie' : 'doughnut';
        document.getElementById('label-status-chart-type').textContent = statusChartType === 'doughnut' ? 'Pie Mode' : 'Doughnut Mode';
        updateAnalytics();
    });

    // Toggle Axis Bar Unit
    document.getElementById('btn-toggle-unit-axis').addEventListener('click', () => {
        unitChartAxis = (unitChartAxis === 'y') ? 'x' : 'y';
        document.getElementById('label-unit-axis').textContent = unitChartAxis === 'y' ? 'Vert' : 'Horiz';
        updateAnalytics();
    });

    // Selector Top-N Units (Penyelamat jika unit sangat banyak di masa depan)
    document.getElementById('sel-top-unit').addEventListener('change', (e) => {
        topUnitLimit = e.target.value;
        updateAnalytics();
    });

    // Toggle Stacked vs Grouped Comparison
    document.getElementById('btn-comp-stacked').addEventListener('click', (e) => {
        comparisonStacked = true;
        e.target.classList.add('active');
        document.getElementById('btn-comp-grouped').classList.remove('active');
        updateAnalytics();
    });

    document.getElementById('btn-comp-grouped').addEventListener('click', (e) => {
        comparisonStacked = false;
        e.target.classList.add('active');
        document.getElementById('btn-comp-stacked').classList.remove('active');
        updateAnalytics();
    });

    // Back button
    document.getElementById('btn-back-to-table').addEventListener('click', () => {
        const navExisting = document.querySelector('[data-menu="existingPartNumber"]');
        if (navExisting) navExisting.click();
    });

    // Inisialisasi awal
    updateAnalytics();
}
