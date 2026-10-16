// File: config/Transaction/existingPN.js
import { supabase } from '../user/supabaseClient.js';

// ============================================================================
// 1. KONFIGURASI GOOGLE APPS SCRIPT WEB APP
// ============================================================================
// Ganti string di bawah ini dengan Web App URL hasil Deploy Google Apps Script Anda:
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz58OUamRApTP2uS9WWAfCyjZloE5w0HPqzJQ4A6JkNPB58bIBaVgu3qgFVk5Hv2Y1YzA/exec';

// Helper: Konversi File objek browser ke Base64 string
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
}

// ============================================================================
// 2. FUNGSI DRIVER GOOGLE DRIVE (UPLOAD / REPLACE / DELETE)
// ============================================================================

/**
 * Upload file baru ke Google Drive
 */
export async function uploadToGDrive(file) {
    if (!file || !(file instanceof File || file instanceof Blob)) return null;

    const base64Data = await fileToBase64(file);
    const payload = {
        action: 'upload',
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data: base64Data
    };

    // Menggunakan text/plain agar tidak memicu CORS Preflight browser
    const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    });

    const res = await response.json();
    if (!res.success) throw new Error(res.error || 'Gagal upload ke Google Drive');
    return res.data; // { fileId, fileName, viewUrl, downloadUrl }
}

/**
 * Ganti file lama di Google Drive dengan file baru
 */
export async function replaceInGDrive(oldFileId, newFile) {
    if (!newFile || !(newFile instanceof File || newFile instanceof Blob)) return null;

    const base64Data = await fileToBase64(newFile);
    const payload = {
        action: 'replace',
        oldFileId: oldFileId || null,
        fileName: newFile.name,
        mimeType: newFile.type || 'application/octet-stream',
        base64Data: base64Data
    };

    const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    });

    const res = await response.json();
    if (!res.success) throw new Error(res.error || 'Gagal mengganti file di Google Drive');
    return res.data;
}

/**
 * Hapus file dari Google Drive
 */
export async function deleteFromGDrive(fileId) {
    if (!fileId) return true;

    const payload = {
        action: 'delete',
        fileId: fileId
    };

    const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    });

    const res = await response.json();
    return res.success;
}

// ============================================================================
// 3. FUNGSI CRUD DATABASE SUPABASE (HEADER + DETAIL + GDRIVE)
// ============================================================================

/**
 * Mengambil semua tiket beserta part numbers dari Supabase
 */
export async function fetchAllTickets() {
    // Ganti query select di fetchAllTickets menjadi:
    const { data, error } = await supabase
        .from('existing_pn_tickets')
        .select(`
            ticket_no,
            status,
            request_type,
            requester_emp_id,
            requester_name,
            department,
            created_at,
            updated_at,
            closed_at,
            existing_pn_items (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }

    // Format data agar sesuai dengan struktur tabel frontend
    return (data || []).map(t => ({
        ticketNo: t.ticket_no,
        status: t.status,
        request: t.request_type,
        requester: t.requester_name,
        dept: t.department,
        empId: t.requester_emp_id,
        createdAt: t.created_at,   // <-- Tambahkan ini
        updatedAt: t.updated_at,   // <-- Tambahkan ini
        closedAt: t.closed_at,     // <-- Tambahkan ini
        pns: (t.existing_pn_items || []).sort((a, b) => a.item_no - b.item_no).map(item => ({
            id: item.id,
            no: item.item_no,
            request: item.request_label,
            dangerous: item.dangerous_good,
            shelf: item.shelf_life,
            type: item.matl_type,
            desc: item.matl_desc,
            uom: item.base_uom,
            pn: item.manu_mat_pn,
            mfr: item.mfr_no,
            doc: item.document_no,
            gdriveFileId: item.gdrive_file_id,
            gdriveUrl: item.gdrive_file_url,
            docFile: null, // File fisik asli ada di Google Drive (akses via gdriveUrl)
            uplant: item.zzuwerks,
            uloc: item.zzulgort,
            rplant: item.zzrwerks,
            riss: item.zzrilgort,
            rrec: item.zzrrlgort,
            pshop: item.zzrarbpl,
            pplant: item.zzpwerks,
            sloc: item.zzslgort,
            ac: item.zzeqart,
            pur: item.ekgrp,
            reg: item.aircraft_reg
        }))
    }));
}

/**
 * Simpan Tiket Baru (Header, File GDrive, & Detail Material)
 */
export async function createTicketWithItems(header, arrayOfPns) {
    // 1. Simpan Header Tiket
    const { error: headerErr } = await supabase
        .from('existing_pn_tickets')
        .insert([{
            ticket_no: header.ticketNo,
            request_type: 'EXISTING PN',
            status: 'Received',
            requester_emp_id: header.empId || null,
            requester_name: header.requester,
            department: header.department
        }]);

    if (headerErr) throw headerErr;

    // 2. Loop upload lampiran ke Google Drive & susun data baris
    const rowsToInsert = [];

    for (let i = 0; i < arrayOfPns.length; i++) {
        const item = arrayOfPns[i];
        let fileId = null;
        let fileUrl = null;

        // Jika user melampirkan file fisik di baris ini
        if (item.docFile instanceof File || item.docFile instanceof Blob) {
            const uploaded = await uploadToGDrive(item.docFile);
            if (uploaded) {
                fileId = uploaded.fileId;
                fileUrl = uploaded.viewUrl;
            }
        }

        rowsToInsert.push({
            ticket_no: header.ticketNo,
            item_no: parseInt(item.no) || (i + 1),
            request_label: item.request || 'EXISTING PN',
            dangerous_good: item.dangerous || 'NO',
            shelf_life: item.shelf || 'NO',
            matl_type: item.type,
            matl_desc: item.desc,
            base_uom: item.uom,
            manu_mat_pn: item.pn,
            mfr_no: item.mfr,
            document_no: item.doc || (item.docFile ? item.docFile.name.toUpperCase() : null),
            gdrive_file_id: fileId,
            gdrive_file_url: fileUrl,
            zzuwerks: item.uplant,
            zzulgort: item.uloc,
            zzrwerks: item.rplant,
            zzrilgort: item.riss,
            zzrrlgort: item.rrec,
            zzrarbpl: item.pshop,
            zzpwerks: item.pplant,
            zzslgort: item.sloc,
            zzeqart: item.ac,
            ekgrp: item.pur,
            aircraft_reg: item.reg
        });
    }

    // 3. Insert ke database Supabase
    const { error: itemsErr } = await supabase
        .from('existing_pn_items')
        .insert(rowsToInsert);

    if (itemsErr) throw itemsErr;
    return true;
}

/**
 * Update Tiket & PNs (Menghandle Pergantian Dokumen di GDrive)
 */
export async function updateTicketAndItems(ticketNo, updatedPns) {
    // 1. Ambil item lama untuk referensi file ID yang ada sebelumnya
    const { data: oldItems } = await supabase
        .from('existing_pn_items')
        .select('*')
        .eq('ticket_no', ticketNo);

    const oldItemsMap = new Map((oldItems || []).map(o => [o.item_no, o]));

    // 2. Olah perubahan data & file
    const itemsToInsert = [];

    for (let i = 0; i < updatedPns.length; i++) {
        const item = updatedPns[i];
        const itemIndex = parseInt(item.no) || (i + 1);
        const prevData = oldItemsMap.get(itemIndex);

        let fileId = prevData ? prevData.gdrive_file_id : null;
        let fileUrl = prevData ? prevData.gdrive_file_url : null;

        // Jika user memilih file baru (Replace)
        if (item.docFile instanceof File || item.docFile instanceof Blob) {
            const replaced = await replaceInGDrive(fileId, item.docFile);
            if (replaced) {
                fileId = replaced.fileId;
                fileUrl = replaced.viewUrl;
            }
        }

        itemsToInsert.push({
            ticket_no: ticketNo,
            item_no: itemIndex,
            request_label: item.request || 'EXISTING PN',
            dangerous_good: item.dangerous || 'NO',
            shelf_life: item.shelf || 'NO',
            matl_type: item.type,
            matl_desc: item.desc,
            base_uom: item.uom,
            manu_mat_pn: item.pn,
            mfr_no: item.mfr,
            document_no: item.doc,
            gdrive_file_id: fileId,
            gdrive_file_url: fileUrl,
            zzuwerks: item.uplant,
            zzulgort: item.uloc,
            zzrwerks: item.rplant,
            zzrilgort: item.riss,
            zzrrlgort: item.rrec,
            zzrarbpl: item.pshop,
            zzpwerks: item.pplant,
            zzslgort: item.sloc,
            zzeqart: item.ac,
            ekgrp: item.pur,
            aircraft_reg: item.reg
        });
    }

    // 3. Update waktu header tiket agar updated_at tercatat
    await supabase
        .from('existing_pn_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('ticket_no', ticketNo);

    // 4. Re-sync detail items (Hapus lama lalu masukkan yang baru diperbarui)
    await supabase.from('existing_pn_items').delete().eq('ticket_no', ticketNo);
    const { error } = await supabase.from('existing_pn_items').insert(itemsToInsert);

    if (error) throw error;
    return true;
}

/**
 * Hapus Tiket & Bersihkan File di Google Drive
 */
export async function deleteTicketCompletely(ticketNo) {
    // 1. Ambil daftar file ID yang terlampir di tiket ini
    const { data: items } = await supabase
        .from('existing_pn_items')
        .select('gdrive_file_id')
        .eq('ticket_no', ticketNo);

    // 2. Hapus file-file terkait di Google Drive
    if (items && items.length > 0) {
        for (const it of items) {
            if (it.gdrive_file_id) {
                try {
                    await deleteFromGDrive(it.gdrive_file_id);
                } catch (e) {
                    console.warn('Gagal menghapus file GDrive:', it.gdrive_file_id, e);
                }
            }
        }
    }

    // 3. Hapus tiket dari Supabase (Otomatis CASCADE ke existing_pn_items)
    const { error } = await supabase
        .from('existing_pn_tickets')
        .delete()
        .eq('ticket_no', ticketNo);

    if (error) throw error;
    return true;
}
