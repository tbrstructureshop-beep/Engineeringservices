// File: menu/notification.js
import { 
    fetchUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
} from '../config/notification.js';

export async function openNotificationModal(currentUser, onUpdateBadge) {
    function formatTime(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        return `${datePart}, ${timePart}`;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); z-index: 99999; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(3px);
    `;

    const modalBox = document.createElement('div');
    modalBox.style.cssText = `
        width: 580px; max-width: 95vw; background: var(--bg-card);
        border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        display: flex; flex-direction: column; overflow: hidden;
        border: 1px solid var(--border-color); animation: fadeIn 0.2s ease-out;
    `;

    modalBox.innerHTML = `
        <style>
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--bg-main); border-bottom: 1px solid var(--border-color); }
            .notif-title { font-size: 1.1rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px; margin: 0; }
            .notif-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted); }
            .notif-close:hover { color: #ef4444; }
            .notif-body { padding: 15px 20px; max-height: 55vh; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: var(--bg-card); }
            .notif-item { display: flex; gap: 12px; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-main); cursor: pointer; transition: 0.2s; position: relative; }
            .notif-item:hover { border-color: var(--primary); }
            .notif-item.unread { border-left: 4px solid var(--primary); background: rgba(37, 99, 235, 0.04); }
            .notif-icon-box { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
            .icon-req { background: #dbeafe; color: #1e40af; }
            .icon-upd { background: #fef3c7; color: #b45309; }
            .icon-done { background: #dcfce7; color: #15803d; }
            .icon-cmt { background: #ede9fe; color: #6d28d9; }
            .notif-content { flex: 1; min-width: 0; text-align: left; }
            .notif-heading { font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 3px; display: flex; justify-content: space-between; gap: 8px; }
            .notif-msg { font-size: 0.8rem; color: var(--text-main); line-height: 1.4; word-break: break-word; }
            .notif-time { font-size: 0.72rem; color: var(--text-muted); margin-top: 5px; }
            .notif-footer { padding: 12px 20px; background: var(--bg-main); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
            .btn-mark-all { background: none; border: none; color: var(--primary); font-size: 0.82rem; font-weight: 600; cursor: pointer; }
            .btn-mark-all:hover { text-decoration: underline; }
        </style>
        <div class="notif-header">
            <h3 class="notif-title"><i class="ph ph-bell"></i> Notifications & Activity</h3>
            <button class="notif-close" id="btn-close-notif"><i class="ph ph-x"></i></button>
        </div>
        <div class="notif-body" id="notif-list-box">
            <div style="text-align: center; padding: 30px; color: var(--text-muted);">
                <i class="ph ph-spinner ph-spin" style="font-size: 1.5rem;"></i> Memuat notifikasi...
            </div>
        </div>
        <div class="notif-footer">
            <span style="font-size: 0.75rem; color: var(--text-muted);">Showing notifications for <b>${currentUser.unit}</b></span>
            <button type="button" class="btn-mark-all" id="btn-mark-all"><i class="ph ph-check-double"></i> Mark all as read</button>
        </div>
    `;

    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);

    const listBox = modalBox.querySelector('#notif-list-box');
    const btnClose = modalBox.querySelector('#btn-close-notif');
    const btnMarkAll = modalBox.querySelector('#btn-mark-all');

    btnClose.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onUpdateBadge) onUpdateBadge();
    });

    function getIconConfig(title, msg) {
        if (title.includes('Completed') || msg.includes('SAP')) {
            return { class: 'icon-done', icon: 'ph-check-circle' };
        }
        if (title.includes('Status') || msg.includes('Updated')) {
            return { class: 'icon-upd', icon: 'ph-clock-clockwise' };
        }
        if (title.includes('Comment') || msg.includes('Comment')) {
            return { class: 'icon-cmt', icon: 'ph-chat-circle-dots' };
        }
        return { class: 'icon-req', icon: 'ph-file-plus' };
    }

    async function renderNotifications() {
        const notifs = await fetchUserNotifications(currentUser.unit);
        if (notifs.length === 0) {
            listBox.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <i class="ph ph-bell-slash" style="font-size: 2.2rem; display: block; margin-bottom: 8px;"></i>
                    Belum ada riwayat notifikasi untuk unit ${currentUser.unit}.
                </div>
            `;
            return;
        }

        listBox.innerHTML = notifs.map(n => {
            const isUnread = n.target_unit === currentUser.unit && (!n.read_by || !n.read_by.includes(currentUser.empId));
            const iconCfg = getIconConfig(n.title, n.message);
            return `
                <div class="notif-item ${isUnread ? 'unread' : ''}" data-id="${n.id}">
                    <div class="notif-icon-box ${iconCfg.class}">
                        <i class="ph ${iconCfg.icon}"></i>
                    </div>
                    <div class="notif-content">
                        <div class="notif-heading">
                            <span>${n.title}</span>
                            <span style="font-size: 0.7rem; font-weight: 600; color: var(--primary);">#${n.ticket_no}</span>
                        </div>
                        <div class="notif-msg">${n.message}</div>
                        <div class="notif-time"><i class="ph ph-clock"></i> ${formatTime(n.created_at)}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Klik salah satu notifikasi untuk tandai sudah dibaca
        listBox.querySelectorAll('.notif-item').forEach(el => {
            el.addEventListener('click', async () => {
                const notifId = el.getAttribute('data-id');
                await markNotificationAsRead(notifId, currentUser.empId);
                el.classList.remove('unread');
                if (onUpdateBadge) onUpdateBadge();
            });
        });
    }

    await renderNotifications();

    btnMarkAll.addEventListener('click', async () => {
        await markAllNotificationsAsRead(currentUser.unit, currentUser.empId);
        listBox.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread'));
        if (onUpdateBadge) onUpdateBadge();
    });
}
