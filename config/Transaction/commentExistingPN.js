// File: config/Transaction/commentExistingPN.js
import { supabase } from '../user/supabaseClient.js';

/**
 * Mengambil daftar komentar untuk suatu tiket (Diurutkan dari tanggal TERBARU)
 */
export async function fetchComments(ticketNo) {
    const { data, error } = await supabase
        .from('existing_pn_comments')
        .select('*')
        .eq('ticket_no', ticketNo)
        .order('created_at', { ascending: false }); // Teratas = Paling Baru

    if (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
    return data || [];
}

/**
 * Mengirim komentar baru
 */
export async function addComment({ ticketNo, user }) {
    const isTed = (user.role && user.role.toUpperCase().includes('TED')) || 
                  (user.unit && user.unit.toUpperCase().includes('TED'));

    const { data, error } = await supabase
        .from('existing_pn_comments')
        .insert([{
            ticket_no: ticketNo,
            user_emp_id: user.empId || null,
            user_name: user.name || 'User',
            user_role: user.role || 'Requester',
            user_unit: user.unit || '-',
            comment_text: user.text,
            // Jika TED yang berkomentar, otomatis sudah dibaca TED namun belum dibaca Requester
            read_by_ted: isTed ? true : false,
            // Jika Requester yang berkomentar, otomatis sudah dibaca Requester namun belum dibaca TED
            read_by_requester: isTed ? false : true
        }])
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
    return data;
}

/**
 * Menghitung jumlah komentar yang BELUM dibaca oleh user saat ini
 */
export async function getUnreadCommentCount(ticketNo, userRole = '', userUnit = '') {
    const isTed = userRole.toUpperCase().includes('TED') || userUnit.toUpperCase().includes('TED');
    
    let query = supabase
        .from('existing_pn_comments')
        .select('id', { count: 'exact', head: true })
        .eq('ticket_no', ticketNo);

    if (isTed) {
        query = query.eq('read_by_ted', false);
    } else {
        query = query.eq('read_by_requester', false);
    }

    const { count, error } = await query;
    if (error) {
        console.error('Error counting unread comments:', error);
        return 0;
    }
    return count || 0;
}

/**
 * Menandai semua komentar pada tiket ini sebagai SUDAH DIBACA (Notifikasi Hilang Otomatis)
 */
export async function markCommentsAsRead(ticketNo, userRole = '', userUnit = '') {
    const isTed = userRole.toUpperCase().includes('TED') || userUnit.toUpperCase().includes('TED');

    const updatePayload = isTed ? { read_by_ted: true } : { read_by_requester: true };
    const filterColumn = isTed ? 'read_by_ted' : 'read_by_requester';

    const { error } = await supabase
        .from('existing_pn_comments')
        .update(updatePayload)
        .eq('ticket_no', ticketNo)
        .eq(filterColumn, false);

    if (error) {
        console.error('Error marking comments as read:', error);
    }
}
