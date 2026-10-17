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

    // 5. Atur Lebar Kolom Otomatis agar tidak terpotong
    ws['!cols'] = rawColumns.map(col => ({ 
        wch: Math.max(col.title.length, col.sub.length) + 4 
    }));

    // 6. Buat Workbook dan Eksekusi Download File Excel
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail");

    const fileName = `Existing New PN Ticket No. ${ticket.ticketNo}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
