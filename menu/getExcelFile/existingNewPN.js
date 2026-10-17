// File: menu/getExcelFile/existingNewPN.js

export function exportTicketToExcel(ticket) {
    if (!ticket || !ticket.pns) {
        alert('Data tiket tidak valid untuk diexport.');
        return;
    }

    // 1. Definisikan Header (Sama persis dengan urutan entryExistingPNModal, dengan sisipan Requester di antara Shelf Life & NO)
    const headers = [
        "ACT",
        "Request",
        "Dangerous Good",
        "Shelf Life",
        "Requester", // <-- Sisipan posisinya di sini
        "NO",
        "MATERIAL TYPE (MATL_TYPE)",
        "MATERIAL DESCRIPTION (SHORT TEXT) (MATL_DESC)",
        "BASE UNIT OF MEASURE (BASE_OUM)",
        "MANUFACTURER PART NUMBER (MANU_MAT (PN))",
        "NUMBER OF A MANUFACTURER (MFR NO (CAGE CODE))",
        "DOCUMENT NUMBER (DOCUMENT)",
        "UNSERVICEABLE PLANT (ZZUWERKS)",
        "UNSERSABLE STORAGE LOCATION (ZZULGORT)",
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
    const rows = ticket.pns.map((p, idx) => {
        // Format Hyperlink Excel untuk Google Drive jika gdriveUrl tersedia
        let docCell = p.doc || '';
        if (p.gdriveUrl) {
            docCell = { t: 's', v: p.doc || 'VIEW DOCUMENT', l: { Target: p.gdriveUrl, Tooltip: 'Klik untuk membuka dokumen di Google Drive' } };
        }

        return [
            "-",                          // ACT
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
            docCell,                      // DOCUMENT (Dengan Hyperlink)
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

    // Gabungkan Header dan Rows menjadi 1 array data worksheet
    const sheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 3. Styling Excel (Header Navy #203d6b Teks Putih, Body Zebra Putih & #dee0e3 Font Hitam)
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) continue;

            // Inisialisasi object s (style) jika belum ada
            ws[cellAddress].s = ws[cellAddress].s || {};

            if (R === 0) {
                // Styling Header
                ws[cellAddress].s = {
                    fill: { fgColor: { rgb: "203D6B" } }, // Navy #203d6b
                    font: { color: { rgb: "FFFFFF" }, bold: true, name: "Calibri", sz: 11 },
                    alignment: { horizontal: "center", vertical: "center", wrapText: true }
                };
            } else {
                // Styling Body Zebra (#dee0e3 untuk baris genap, putih untuk ganjil)
                const isEvenRow = R % 2 === 0;
                ws[cellAddress].s = {
                    fill: { fgColor: { rgb: isEvenRow ? "DEE0E3" : "FFFFFF" } },
                    font: { color: { rgb: "000000" }, name: "Calibri", sz: 10 },
                    alignment: { vertical: "center" }
                };
            }
        }
    }

    // Atur Lebar Kolom agar tidak terpotong (Auto-fit sederhana)
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 3, 15) }));

    // 4. Buat Workbook dan Export File
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail");

    // Nama File sesuai format permintaan: "Existing New PN Ticket No. [Nomor Tiket].xlsx"
    const fileName = `Existing New PN Ticket No. ${ticket.ticketNo}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
