// File: config/notification.js
import { supabase } from './user/supabaseClient.js';

/**
 * Buat notifikasi baru
 */
export async function createNotification({
    serviceType = 'EXISTING_PN',
    ticketNo,
    senderName,
    senderUnit,
    targetUnit,
    title,
    message
}) {
    try {
        const { error } = await supabase
            .from('app_notifications')
            .insert([{
                service_type: serviceType,
                ticket_no: ticketNo,
                sender_name: senderName || 'System',
                sender_unit: senderUnit,
                target_unit: targetUnit,
                title: title,
                message: message,
                read_by: []
            }]);

        if (error) console.error('Gagal mencatat notifikasi:', error);
    } catch (err) {
        console.error('Error createNotification:', err);
    }
}

/**
 * Mengambil riwayat notifikasi terkait (FROM / TO unit bersangkutan)
 */
export async function fetchUserNotifications(userUnit) {
    if (!userUnit) return [];

    // Filter: Tampilkan notifikasi jika unit user adalah TARGET penerima ATAU SENDER pengirim
    const { data, error } = await supabase
        .from('app_notifications')
        .select('*')
        .or(`target_unit.eq.${userUnit},sender_unit.eq.${userUnit}`)
        .order('created_at', { ascending: false })
        .limit(40);

    if (error) {
        console.error('Error fetchUserNotifications:', error);
        return [];
    }
    return data || [];
}

/**
 * Menghitung jumlah notifikasi yang BELUM dibaca oleh empId ini
 */
export async function getUnreadNotificationCount(userUnit, userEmpId) {
    if (!userUnit || !userEmpId) return 0;

    // Notifikasi yang ditujukan ke unit user dan belum dibaca oleh user ini
    const { data, error } = await supabase
        .from('app_notifications')
        .select('read_by')
        .eq('target_unit', userUnit);

    if (error || !data) return 0;

    // Filter yang belum memasukkan empId ke array read_by
    const unread = data.filter(n => !n.read_by || !n.read_by.includes(userEmpId));
    return unread.length;
}

/**
 * Tandai satu notifikasi sebagai telah dibaca
 */
export async function markNotificationAsRead(notifId, userEmpId) {
    if (!notifId || !userEmpId) return;

    // Ambil data lama lalu append empId
    const { data } = await supabase
        .from('app_notifications')
        .select('read_by')
        .eq('id', notifId)
        .single();

    const currentReadBy = data && Array.isArray(data.read_by) ? data.read_by : [];
    if (!currentReadBy.includes(userEmpId)) {
        currentReadBy.push(userEmpId);
        await supabase
            .from('app_notifications')
            .update({ read_by: currentReadBy })
            .eq('id', notifId);
    }
}

/**
 * Tandai semua notifikasi unit sebagai telah dibaca
 */
export async function markAllNotificationsAsRead(userUnit, userEmpId) {
    if (!userUnit || !userEmpId) return;

    const { data } = await supabase
        .from('app_notifications')
        .select('id, read_by')
        .eq('target_unit', userUnit);

    if (!data) return;

    for (const item of data) {
        const currentReadBy = item.read_by || [];
        if (!currentReadBy.includes(userEmpId)) {
            currentReadBy.push(userEmpId);
            await supabase
                .from('app_notifications')
                .update({ read_by: currentReadBy })
                .eq('id', item.id);
        }
    }
}
