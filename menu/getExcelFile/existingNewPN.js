// File: menu/getExcelFile/existingNewPN.js
import { SheetJS } from 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.full.min.js';

export function exportExistingPNTicketToExcel(ticketData) {
    if (!ticketData || !ticketData.ticketNo) {
        alert('Data tiket tidak valid untuk diexport.');
        return;
    }

    const ticketNo = ticketData.ticketNo;
    const requesterName = ticketData.requester || '-';
    const items = ticketData.pns || [];

    // 1. Definisikan Header (Requester disisipkan di antara Shelf Life dan NO)
    const headers = [
        "ACT",
        "Request",
        "Dangerous Good",
        "Shelf Life",
        "Requester", // <-- Disisipkan di sini
        "NO",
        "MATERIAL TYPE (MATL_TYPE)",
        "MATERIAL DESCRIPTION (SHORT TEXT) (MATL_DESC)",
        "BASE UNIT OF MEASURE (BASE_OUM)",
        "MANUFACTURER PART NUMBER (MANU_MAT (PN))",
        "NUMBER OF A MANUFACTURER (MFR NO (CAGE CODE))",
        "DOCUMENT NUMBER (DOCUMENT)",
        "UNSERVICEABLE PLANT (ZZUWERKS)",
        "UNSERVICEABLE STORAGE LOCATION (ZZULGORT)",
        "REFURBISHMENT PLANT (ZZRWERKS)",
        "REFURBISHMENT ISSUE STORAGE LOCATION (ZZRILGORT)",
        "REFURBISHMENT RECEIPT STORAGE LOCATION (ZZRRLGORT)",
        "PARENT SHOP (ZZRARBPL)",
        "PARENT SHOP PLANT (ZZPWERKS)",
        "SERVICEABLE STORE LOCATION (ZZSLGORT)",
        "TYPE OF TECHNICAL OBJECT (A/C TYPE) (ZZEQART)",
        "PURCHASING GROUP (EKGRP)",
        "AIRCRAFT REGISTRATION (Reg)"
    ];

    // 2. Susun Data Body Baris per Baris
    const rows = items.map((item, index) => {
        const docName = item.doc || '';
        const docUrl = item.gdriveUrl || '';

        // Format Hyperlink Excel SheetJS (jika ada URL Google Drive)
        let docCell = docName;
        if (docUrl && docName) {
            docCell = { t: 's', v: docName, l: { Target: docUrl, Tooltip: 'Buka Dokumen di Google Drive' } };
        }

        return [
            "-", // ACT
            item.request || "EXISTING PN",
            item.dangerous || "NO",
            item.shelf || "NO",
            requesterName, // <-- Nilai Requester
            item.no || (index + 1),
            item.type || "",
            item.desc || "",
            item.uom || "",
            item.pn || "",
            item.mfr || "",
            docCell, // <-- Kolom Dokumen (Hyperlink)
            item.uplant || "",
            item.uloc || "",
            item.rplant || "",
            item.riss || "",
            item.rrec || "",
            item.pshop || "",
            item.pplant || "",
            item.sloc || "",
            item.ac || "",
            item.pur || "",
            item.reg || ""
        ];
    });

    // Gabungkan Header dan Rows ke Worksheet
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 3. Styling Excel (Header #203d6b Teks Putih & Zebra Body #dee0e3 / Putih)
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    ws['!rows'] = [{ hpt: 26 }]; // Tinggi baris header

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) continue;

            // Inisialisasi objek style jika belum ada
            if (!ws[cellAddress].s) ws[cellAddress].s = {};

            if (R === 0) {
                // Styling Header: Background #203d6b, Teks Putih Bold, Center Alignment
                ws[cellAddress].s = {
                    fill: { fgColor: { rgb: "203D6B" } },
                    font: { name: "Inter", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
                    alignment: { horizontal: "center", vertical: "center", wrapText: true }
                };
            } else {
                // Styling Body: Zebra Background (#dee0e3 dan putih), Teks Hitam
                const isEvenRow = (R % 2 === 0);
                ws[cellAddress].s = {
                    fill: { fgColor: { rgb: isEvenRow ? "DEE0E3" : "FFFFFF" } },
                    font: { name: "Inter", sz: 9, color: { rgb: "000000" } },
                    alignment: { vertical: "center" }
                };

                // Jika sel dokumen adalah hyperlink, beri warna biru dan underline tipis
                if (C === 11 && ws[cellAddress].l) {
                    ws[cellAddress].s.font.color = { rgb: "2563EB" };
                    ws[cellAddress].s.font.underline = true;
                }
            }
        }
    }

    // Auto-fit Lebar Kolom agar tidak terpotong (Truncated)
    const colWidths = headers.map((h, i) => {
        let maxLen = h.length;
        rows.forEach(r => {
            const val = r[i];
            const strVal = typeof val === 'object' && val !== null ? (val.v || '') : String(val || '');
            if (strVal.length > maxLen) maxLen = strVal.length;
        });
        return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
    });
    ws['!cols'] = colWidths;

    // 4. Buat Workbook dan Unduh File
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail");

    // Format nama file: "Existing New PN Ticket No. [Nomor Tiket].xlsx"
    const fileName = `Existing New PN Ticket No. ${ticketNo}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
