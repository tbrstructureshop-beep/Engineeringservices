// File: config/Transaction/commentExistingPN.js
import { supabase } from '../user/supabaseClient.js';
import { createNotification } from '../notification.js';

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

export async function addComment({ ticketNo, user }) {
    const isTed = (user.role && user.role.toUpperCase().includes('TED')) || 
                  (user.unit && user.unit.toUpperCase().includes('TED'));

    // 1. Simpan Komentar ke Database
    const { data, error } = await supabase
        .from('existing_pn_comments')
        .insert([{
            ticket_no: ticketNo,
            user_emp_id: user.empId || null,
            user_name: user.name || 'User',
            user_role: user.role || 'Requester',
            user_unit: user.unit || '-',
            comment_text: user.text,
            read_by_ted: isTed ? true : false,
            read_by_requester: isTed ? false : true
        }])
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        throw error;
    }

    // 2. Tentukan Penerima Notifikasi Secara Otomatis & Dinamis
    try {
        let targetUnitNotif = 'TED-2'; // Default: jika pengirim adalah Requester, dikirim ke Admin TED-2

        if (isTed) {
            // Jika yang berkomentar adalah TED-2, cari siapa unit asli pembuat tiket ini dari database
            const { data: ticketData } = await supabase
                .from('existing_pn_tickets')
                .select('department')
                .eq('ticket_no', ticketNo)
                .single();

            if (ticketData && ticketData.department) {
                targetUnitNotif = ticketData.department; // Otomatis terisi unit pengaju asli (e.g. TCP-12, TCR-1, dll)
            }
        }

        // 3. Kirim Notifikasi
        await createNotification({
            serviceType: 'EXISTING_PN',
            ticketNo: ticketNo,
            senderName: user.name || 'User',
            senderUnit: user.unit || '-',
            targetUnit: targetUnitNotif,
            title: 'New Comment Added',
            message: `${user.unit || 'User'} (${user.name || 'User'}) Sent Comment related to Ticket #${ticketNo}. See for Detail.`
        });
    } catch (notifErr) {
        console.warn('Gagal memicu notifikasi komentar:', notifErr);
    }

    return data;
}

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
    if (error) return 0;
    return count || 0;
}

export async function markCommentsAsRead(ticketNo, userRole = '', userUnit = '') {
    const isTed = userRole.toUpperCase().includes('TED') || userUnit.toUpperCase().includes('TED');
    const updatePayload = isTed ? { read_by_ted: true } : { read_by_requester: true };
    const filterColumn = isTed ? 'read_by_ted' : 'read_by_requester';

    const { error } = await supabase
        .from('existing_pn_comments')
        .update(updatePayload)
        .eq('ticket_no', ticketNo)
        .eq(filterColumn, false);

    if (error) console.error('Error marking comments as read:', error);
}
