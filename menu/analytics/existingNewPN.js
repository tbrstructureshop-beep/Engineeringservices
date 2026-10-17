// File: menu/analytics/existingNewPN.js
import { fetchAllTickets } from '../../config/Transaction/existingPN.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/auto/+esm';

export async function render(container) {
    container.innerHTML = `
        <style>
            .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px; }
            .kpi-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .kpi-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0; }
            .kpi-val { font-size: 1.6rem; font-weight: 700; color: var(--text-main); line-height: 1.1; margin-top: 4px; }
            .kpi-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 600; color: var(--text-muted); }
            
            .chart-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 20px; margin-bottom: 20px; }
            .chart-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
            .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
            .chart-title { font-size: 0.95rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px; margin: 0; }
            .chart-box { position: relative; flex: 1; min-height: 280px; width: 100%; display: flex; align-items: center; justify-content: center; }
            
            .btn-chart-toggle { background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
            .btn-chart-toggle:hover { border-color: var(--primary); color: var(--primary); }
            
            .filter-panel { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end; }
            .filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 150px; flex: 1; }
            .filter-field label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
            .filter-input { height: 38px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-main); color: var(--text-main); font-family: inherit; font-size: 0.85rem; outline: none; }
            .filter-input:focus { border-color: var(--primary); }
        </style>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
            <div>
                <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-main); margin: 0;"><i class="ph ph-chart-pie-slice" style="color:var(--primary);"></i> Existing PN Statistics & Analytics</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Analisis volumetri material, performa approval SAP, dan komparasi antar unit pengaju.</p>
            </div>
            <button id="btn-back-to-table" class="btn-submit" style="margin: 0; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main);">
                <i class="ph ph-table"></i> Back to Dashboard
            </button>
        </div>

        <!-- PANEL FILTER ANALITIK -->
        <div class="filter-panel">
            <div class="filter-field">
                <label><i class="ph ph-calendar"></i> Date From</label>
                <input type="date" id="filter-date-from" class="filter-input">
            </div>
            <div class="filter-field">
                <label><i class="ph ph-calendar"></i> Date To</label>
                <input type="date" id="filter-date-to" class="filter-input">
            </div>
            <div class="filter-field">
                <label><i class="ph ph-buildings"></i> Unit / Department</label>
                <select id="filter-unit" class="filter-input">
                    <option value="">All Units</option>
                </select>
            </div>
            <div class="filter-field">
                <label><i class="ph ph-tag"></i> Status</label>
                <select id="filter-status" class="filter-input">
                    <option value="">All Statuses</option>
                    <option value="Received">Received</option>
                    <option value="Under Evaluation">Under Evaluation</option>
                    <option value="Created">Created</option>
                </select>
            </div>
            <button type="button" id="btn-reset-analytics-filter" class="btn-submit" style="margin:0; height:38px; background:none; border:1px solid var(--border-color); color:#ef4444;">
                <i class="ph ph-arrow-counter-clockwise"></i> Reset
            </button>
        </div>

        <!-- KPI SUMMARY CARDS -->
        <div class="analytics-grid">
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#eff6ff; color:#2563eb;"><i class="ph ph-ticket"></i></div>
                <div>
                    <div class="kpi-label">Total Tiket Masuk</div>
                    <div class="kpi-val" id="kpi-total-tickets">0</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#ecfdf5; color:#059669;"><i class="ph ph-hard-drives"></i></div>
                <div>
                    <div class="kpi-label">Total Part Numbers (PN)</div>
                    <div class="kpi-val" id="kpi-total-pns">0</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#fef3c7; color:#d97706;"><i class="ph ph-clock-countdown"></i></div>
                <div>
                    <div class="kpi-label">In-Progress (Evaluation)</div>
                    <div class="kpi-val" id="kpi-in-progress">0</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#f3e8ff; color:#9333ea;"><i class="ph ph-check-circle"></i></div>
                <div>
                    <div class="kpi-label">Created on SAP (Success)</div>
                    <div class="kpi-val" id="kpi-completed">0</div>
                </div>
            </div>
        </div>

        <!-- CHART ROWS -->
        <div class="chart-row">
            <!-- Chart 1: Status Distribution -->
            <div class="chart-card">
                <div class="chart-header">
                    <h4 class="chart-title"><i class="ph ph-chart-pie"></i> Status Distribution</h4>
                    <button type="button" class="btn-chart-toggle" id="toggle-chart-status">
                        <i class="ph ph-arrows-left-right"></i> Toggle Doughnut/Pie
                    </button>
                </div>
                <div class="chart-box"><canvas id="canvas-status"></canvas></div>
            </div>

            <!-- Chart 2: Volume per Unit -->
            <div class="chart-card">
                <div class="chart-header">
                    <h4 class="chart-title"><i class="ph ph-chart-bar"></i> Total Request per Unit</h4>
                    <button type="button" class="btn-chart-toggle" id="toggle-chart-unit">
                        <i class="ph ph-arrows-left-right"></i> Toggle Horiz/Vert
                    </button>
                </div>
                <div class="chart-box"><canvas id="canvas-unit"></canvas></div>
            </div>
        </div>

        <div class="chart-row">
            <!-- Chart 3: Unit vs Status Comparison Matrix -->
            <div class="chart-card" style="grid-column: span 2;">
                <div class="chart-header">
                    <h4 class="chart-title"><i class="ph ph-sliders"></i> Unit vs Status Comparison (Stacked Matrix)</h4>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Membandingkan progress tiket tiap unit</span>
                </div>
                <div class="chart-box" style="min-height:320px;"><canvas id="canvas-comparison"></canvas></div>
            </div>
        </div>
    `;

    // 1. Ambil data asli dari Supabase
    let rawTickets = [];
    try {
        rawTickets = await fetchAllTickets();
    } catch (e) {
        console.error("Gagal mengambil data untuk analitik:", e);
    }

    // Populate opsi dropdown Unit secara dinamis
    const unitSelect = document.getElementById('filter-unit');
    const uniqueUnits = Array.from(new Set(rawTickets.map(t => t.dept).filter(Boolean))).sort();
    uniqueUnits.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = u;
        unitSelect.appendChild(opt);
    });

    // Chart instances holder
    let chartStatusInstance = null;
    let chartUnitInstance = null;
    let chartComparisonInstance = null;

    let statusChartType = 'doughnut'; // 'doughnut' atau 'pie'
    let unitChartAxis = 'y'; // 'y' (horizontal) atau 'x' (vertical)

    // Helper warna tema
    function isDarkMode() {
        return localStorage.getItem('darkMode') === 'true';
    }
    function getTextColor() {
        return isDarkMode() ? '#94a3b8' : '#64748b';
    }
    function getGridColor() {
        return isDarkMode() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    }

    // 2. Fungsi Utama Filter & Update Visualisasi
    function updateAnalytics() {
        const dateFrom = document.getElementById('filter-date-from').value;
        const dateTo = document.getElementById('filter-date-to').value;
        const selectedUnit = document.getElementById('filter-unit').value;
        const selectedStatus = document.getElementById('filter-status').value;

        // Filter Dataset
        const filtered = rawTickets.filter(t => {
            if (selectedUnit && t.dept !== selectedUnit) return false;
            if (selectedStatus && t.status !== selectedStatus) return false;

            if (dateFrom || dateTo) {
                const tDate = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : null;
                if (dateFrom && (!tDate || tDate < dateFrom)) return false;
                if (dateTo && (!tDate || tDate > dateTo)) return false;
            }
            return true;
        });

        // Update KPI Cards
        const totalTickets = filtered.length;
        const totalPns = filtered.reduce((acc, t) => acc + (t.pns ? t.pns.length : 0), 0);
        const inProgress = filtered.filter(t => t.status === 'Received' || t.status === 'Under Evaluation').length;
        const completed = filtered.filter(t => t.status === 'Created').length;

        document.getElementById('kpi-total-tickets').textContent = totalTickets;
        document.getElementById('kpi-total-pns').textContent = totalPns;
        document.getElementById('kpi-in-progress').textContent = inProgress;
        document.getElementById('kpi-completed').textContent = completed;

        // Render Ulang Ketiga Chart
        renderStatusChart(filtered);
        renderUnitChart(filtered);
        renderComparisonChart(filtered);
    }

    // Chart 1: Status Distribution
    function renderStatusChart(data) {
        const counts = { 'Received': 0, 'Under Evaluation': 0, 'Created': 0 };
        data.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });

        const ctx = document.getElementById('canvas-status').getContext('2d');
        if (chartStatusInstance) chartStatusInstance.destroy();

        chartStatusInstance = new Chart(ctx, {
            type: statusChartType,
            data: {
                labels: ['Received', 'Under Evaluation', 'Created on SAP'],
                datasets: [{
                    data: [counts['Received'], counts['Under Evaluation'], counts['Created']],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
                    borderWidth: 2,
                    borderColor: isDarkMode() ? '#1e293b' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: getTextColor(), boxWidth: 12, padding: 15, font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    }

    // Chart 2: Total Request per Unit
    function renderUnitChart(data) {
        const unitMap = {};
        data.forEach(t => {
            const u = t.dept || 'Unknown';
            unitMap[u] = (unitMap[u] || 0) + 1;
        });

        const labels = Object.keys(unitMap);
        const values = Object.values(unitMap);

        const ctx = document.getElementById('canvas-unit').getContext('2d');
        if (chartUnitInstance) chartUnitInstance.destroy();

        chartUnitInstance = new Chart(ctx, {
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
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: getTextColor(), font: { family: 'Inter', size: 10 } },
                        grid: { color: getGridColor() }
                    },
                    y: {
                        ticks: { color: getTextColor(), font: { family: 'Inter', size: 10 } },
                        grid: { color: getGridColor() }
                    }
                }
            }
        });
    }

    // Chart 3: Comparison Matrix (Stacked Bar)
    function renderComparisonChart(data) {
        const allUnits = Array.from(new Set(data.map(t => t.dept || 'Unknown'))).sort();
        const receivedData = [];
        const underEvalData = [];
        const createdData = [];

        allUnits.forEach(u => {
            const unitTickets = data.filter(t => (t.dept || 'Unknown') === u);
            receivedData.push(unitTickets.filter(t => t.status === 'Received').length);
            underEvalData.push(unitTickets.filter(t => t.status === 'Under Evaluation').length);
            createdData.push(unitTickets.filter(t => t.status === 'Created').length);
        });

        const ctx = document.getElementById('canvas-comparison').getContext('2d');
        if (chartComparisonInstance) chartComparisonInstance.destroy();

        chartComparisonInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: allUnits,
                datasets: [
                    { label: 'Received', data: receivedData, backgroundColor: '#3b82f6', borderRadius: 4 },
                    { label: 'Under Evaluation', data: underEvalData, backgroundColor: '#f59e0b', borderRadius: 4 },
                    { label: 'Created (Closed)', data: createdData, backgroundColor: '#10b981', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: getTextColor(), boxWidth: 12, padding: 12, font: { family: 'Inter', size: 11 } }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: getTextColor(), font: { family: 'Inter', size: 11 } },
                        grid: { color: getGridColor() }
                    },
                    y: {
                        stacked: true,
                        ticks: { color: getTextColor(), font: { family: 'Inter', size: 11 }, stepSize: 1 },
                        grid: { color: getGridColor() }
                    }
                }
            }
        });
    }

    // Event Listener Filter Inputs
    ['filter-date-from', 'filter-date-to', 'filter-unit', 'filter-status'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateAnalytics);
    });

    // Reset Button
    document.getElementById('btn-reset-analytics-filter').addEventListener('click', () => {
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        document.getElementById('filter-unit').value = '';
        document.getElementById('filter-status').value = '';
        updateAnalytics();
    });

    // Tombol Toggle Chart Status (Doughnut <-> Pie)
    document.getElementById('toggle-chart-status').addEventListener('click', () => {
        statusChartType = (statusChartType === 'doughnut') ? 'pie' : 'doughnut';
        updateAnalytics();
    });

    // Tombol Toggle Chart Unit (Vertical <-> Horizontal)
    document.getElementById('toggle-chart-unit').addEventListener('click', () => {
        unitChartAxis = (unitChartAxis === 'y') ? 'x' : 'y';
        updateAnalytics();
    });

    // Tombol Back to Dashboard
    document.getElementById('btn-back-to-table').addEventListener('click', () => {
        const navExisting = document.querySelector('[data-menu="existingPartNumber"]');
        if (navExisting) navExisting.click();
    });

    // Render Awal
    updateAnalytics();
}
