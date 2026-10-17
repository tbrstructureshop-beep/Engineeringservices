// File: menu/getExcelFile/existingNewPN.js

export function exportTicketToExcel(ticket) {
    if (!ticket || !ticket.pns) {
        alert('Data tiket tidak valid untuk diexport.');
        return;
    }

    // 1. Definisikan mapping judul kolom mentah beserta sub-judulnya di dalam tanda kurung ()
    // Kolom 'ACT' sengaja di-exclude dari array ini.
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

    // 2. Susun Baris Header 1 dan Header 2
    const headerRow1 = [];
    const headerRow2 = [];

    rawColumns.forEach(col => {
        if (col.sub) {
            // Jika memiliki sub (artinya ada bagian kurung), pisahkan ke row 1 dan row 2
            headerRow1.push(col.title);
            headerRow2.push(col.sub);
        } else {
            // Jika tidak ada sub, row 1 diisi judul utama, row 2 dikosongkan (nanti di-merge vertikal)
            headerRow1.push(col.title);
            headerRow2.push("");
        }
    });

    // 3. Susun Data Body Baris per Baris (ACT di-exclude)
    const rows = ticket.pns.map((p, idx) => {
        let docCell = p.doc || '';
        if (p.gdriveUrl) {
            docCell = { t: 's', v: p.doc || 'VIEW DOCUMENT', l: { Target: p.gdriveUrl, Tooltip: 'Klik untuk membuka dokumen di Google Drive' } };
        }

        return [
            p.request || "EXISTING PN",   // Request
            p.dangerous || "NO",          // Dangerous Good
            p.shelf || "NO",              // Shelf Life
            ticket.requester || "-",      // Requester (Sisipan)
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

    // Gabungkan struktur sheet: Header 1, Header 2, lalu Data Body
    const sheetData = [headerRow1, headerRow2, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 4. Konfigurasi Merge Vertikal untuk Header yang tidak memiliki sub-judul
    ws['!merges'] = [];
    rawColumns.forEach((col, idx) => {
        if (!col.sub) {
            // Merge baris 0 (row 1) dan baris 1 (row 2) pada kolom index `idx`
            ws['!merges'].push({ s: { r: 0, c: idx }, e: { r: 1, c: idx } });
        }
    });

    // 5. Styling Layout, Pewarnaan, Border, dan Alignment secara Presisi
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) {
                // Pastikan sel kosong tetap memiliki struktur objek agar styling border/background merata
                ws[cellAddress] = { t: 's', v: '' };
            }

            ws[cellAddress].s = ws[cellAddress].s || {};

            if (R === 0 || R === 1) {
                // STYLING HEADER (Baris 1 & 2): Background Navy #203d6b, Font Putih, Bold, Center, Border Tipis
                ws[cellAddress].s = {
                    fill: { fgColor: { rgb: "203D6B" } },
                    font: { color: { rgb: "FFFFFF" }, bold: true, name: "Calibri", sz: 10 },
                    alignment: { horizontal: "center", vertical: "center", wrapText: true },
                    border: {
                        top: { style: "thin", color: { rgb: "152A4A" } },
                        bottom: { style: "thin", color: { rgb: "152A4A" } },
                        left: { style: "thin", color: { rgb: "152A4A" } },
                        right: { style: "thin", color: { rgb: "152A4A" } }
                    }
                };
            } else {
                // STYLING BODY: Zebra (#dee0e3 untuk baris genap, putih untuk ganjil), Font Hitam, Alignment Sesuai Jenis Data
                const isEvenRow = R % 2 === 0;
                
                // Kolom tertentu dibuat Center (seperti Request, DG, Shelf, NO), sisanya Left
                const isCenteredCol = [0, 1, 2, 4].includes(C); // Request, DG, Shelf, NO

                ws[cellAddress].s = {
                    fill: { fgColor: { rgb: isEvenRow ? "DEE0E3" : "FFFFFF" } },
                    font: { color: { rgb: "000000" }, name: "Calibri", sz: 10 },
                    alignment: { 
                        horizontal: isCenteredCol ? "center" : "left", 
                        vertical: "center" 
                    },
                    border: {
                        top: { style: "thin", color: { rgb: "D1D5DB" } },
                        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
                        left: { style: "thin", color: { rgb: "D1D5DB" } },
                        right: { style: "thin", color: { rgb: "D1D5DB" } }
                    }
                };
            }
        }
    }

    // Atur Tinggi Baris Header agar lega dan rapi
    ws['!rows'] = [
        { hpt: 24 }, // Tinggi Header Row 1
        { hpt: 20 }  // Tinggi Header Row 2
    ];

    // Atur Lebar Kolom (Auto-fit dinamis)
    ws['!cols'] = rawColumns.map(col => ({ 
        wch: Math.max(col.title.length, col.sub.length) + 4 
    }));

    // 6. Buat Workbook dan Export File
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail");

    const fileName = `Existing New PN Ticket No. ${ticket.ticketNo}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
