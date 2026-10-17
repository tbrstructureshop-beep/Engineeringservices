// File: menu/getExcelFile/existingNewPN.js

export function exportTicketToExcel(ticket) {
    if (!ticket || !ticket.pns) {
        alert('Data tiket tidak valid untuk diexport.');
        return;
    }

    // 1. Definisikan Header 2 Baris (Baris Utama & Sub-judul Kurung) - Tanpa Kolom ACT
    const rawColumns = [
        { title: "Request", sub: "" },
        { title: "Dangerous Good", sub: "" },
        { title: "Shelf Life", sub: "" },
        { title: "Requester", sub: "" }, // Sisipan di antara Shelf Life & NO
        { title: "NO", sub: "" },
        { title: "MATERIAL TYPE", sub: "MATL_TYPE" },
        { title: "MATERIAL DESCRIPTION (SHORT TEXT)", sub: "MATL_DESC" },
        { title: "BASE UNIT OF MEASURE", sub: "BASE_OUM" },
        { title: "MANUFACTURER PART NUMBER", sub: "MANU_MAT (PN)" },
        { title: "NUMBER OF A MANUFACTURER", sub: "MFR NO (CAGE CODE)" },
        { title: "DOCUMENT NUMBER", sub: "DOCUMENT" },
        { title: "UNSERVICEABLE PLANT", sub: "ZZUWERKS" },
        { title: "UNSERSABLE STORAGE LOCATION", sub: "ZZULGORT" },
        { title: "REFURBISHMENT PLANT", sub: "ZZRWERKS" },
        { title: "REFURBISHMENT ISSUE STORAGE LOCATION", sub: "ZZRILGORT" },
        { title: "REFURBISHMENT RECEIPT STORAGE LOCATION", sub: "ZZRRLGORT" },
        { title: "PARENT SHOP", sub: "ZZRARBPL" },
        { title: "PARENT SHOP PLANT", sub: "ZZPWERKS" },
        { title: "SERVICEABLE STORE LOCATION", sub: "ZZSLGORT" },
        { title: "TYPE OF TECHNICAL OBJECT (A/C TYPE)", sub: "ZZEQART" },
        { title: "PURCHASING GROUP", sub: "EKGRP" },
        { title: "AIRCRAFT REGISTRATION", sub: "Reg" }
    ];

    const headerRow1 = [];
    const headerRow2 = [];

    rawColumns.forEach(col => {
        if (col.sub) {
            headerRow1.push(col.title);
            headerRow2.push(col.sub);
        } else {
            headerRow1.push(col.title);
            headerRow2.push("");
        }
    });

    // 2. Susun Data Body Baris per Baris
    const rows = ticket.pns.map((p, idx) => {
        let docCell = p.doc || '';
        if (p.gdriveUrl) {
            docCell = { t: 's', v: p.doc || 'VIEW DOCUMENT', l: { Target: p.gdriveUrl, Tooltip: 'Klik untuk membuka dokumen di Google Drive' } };
        }

        return [
            p.request || "EXISTING PN",   // Request
            p.dangerous || "NO",          // Dangerous Good
            p.shelf || "NO",              // Shelf Life
            ticket.requester || "-",      // Requester
            p.no || (idx + 1),            // NO
            p.type || "",                 // MATL_TYPE
            p.desc || "",                 // MATL_DESC
            p.uom || "",                  // BASE_OUM
            p.pn || "",                   // MANU_MAT (PN)
            p.mfr || "",                  // MFR NO
            docCell,                      // DOCUMENT (Hyperlink aktif)
            p.uplant || "",               // ZZUWERKS
            p.uloc || "",                 // ZZULGORT
            p.rplant || "",               // ZZRWERKS
            p.riss || "",                 // ZZRILGORT
            p.rrec || "",                 // ZZRRLGORT
            p.pshop || "",                // ZZRARBPL
            p.pplant || "",               // ZZPWERKS
            p.sloc || "",                 // ZZSLGORT
            p.ac || "",                   // ZZEQART
            p.pur || "",                  // EKGRP
            p.reg || ""                   // Reg
        ];
    });

    // 3. Gabungkan struktur data sheet
    const sheetData = [headerRow1, headerRow2, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 4. Konfigurasi Merge Vertikal untuk Header Utama (Kolom Tanpa Sub)
    ws['!merges'] = [];
    rawColumns.forEach((col, idx) => {
        if (!col.sub) {
            ws['!merges'].push({ s: { r: 0, c: idx }, e: { r: 1, c: idx } });
        }
    });

    // 5. Definisi Standar Styling untuk xlsx-js-style
    const borderThin = {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } }
    };

    const styleHeader = {
        fill: { patternType: "solid", fgColor: { rgb: "203D6B" } }, // Navy #203D6B
        font: { color: { rgb: "FFFFFF" }, bold: true, name: "Calibri", sz: 10 },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: borderThin
    };

    const styleWhiteData = {
        fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
        font: { color: { rgb: "000000" }, name: "Calibri", sz: 10 },
        alignment: { vertical: "center" },
        border: borderThin
    };

    const styleZebraData = {
        fill: { patternType: "solid", fgColor: { rgb: "DEE0E3" } }, // Zebra #DEE0E3
        font: { color: { rgb: "000000" }, name: "Calibri", sz: 10 },
        alignment: { vertical: "center" },
        border: borderThin
    };

    // 6. Terapkan Styling ke Seluruh Cell Secara Otomatis
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) {
                ws[cellAddress] = { t: 's', v: '' };
            }

            // Tentukan style berdasarkan baris (Header vs Body)
            if (R === 0 || R === 1) {
                ws[cellAddress].s = styleHeader;
            } else {
                const isEvenRow = R % 2 === 0;
                const isCenteredCol = [0, 1, 2, 4].includes(C); // Request, DG, Shelf, NO

                // Clone style agar alignment horizontal bisa dicustom per kolom tanpa merusak objek utama
                ws[cellAddress].s = JSON.parse(JSON.stringify(isEvenRow ? styleZebraData : styleWhiteData));
                if (isCenteredCol) {
                    ws[cellAddress].s.alignment.horizontal = "center";
                }
            }
        }
    }

    // 7. Atur Tinggi Baris Header & Lebar Kolom
    ws['!rows'] = [
        { hpt: 26 }, // Tinggi Baris 1 Header
        { hpt: 22 }  // Tinggi Baris 2 Header
    ];

    ws['!cols'] = rawColumns.map(col => ({ 
        wch: Math.max(col.title.length, col.sub.length) + 4 
    }));

    // 8. Buat Workbook dan Eksekusi Download File Excel
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail");

    const fileName = `Existing New PN Ticket No. ${ticket.ticketNo}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
