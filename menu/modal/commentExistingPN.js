// File: menu/modal/commentExistingPN.js
import { fetchComments, addComment, markCommentsAsRead } from '../../config/Transaction/commentExistingPN.js';

export async function openCommentModal(config) {
    const ticketNo = config.ticketNo;
    const currentUser = config.currentUser || { name: 'User', role: 'Requester', unit: '-', empId: '' };

    // Format Tanggal: DD MMM YYYY, HH:mm
    function formatCommentDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        return `${datePart}, ${timePart}`;
    }

    // Tandai sudah dibaca
    await markCommentsAsRead(ticketNo, currentUser.role, currentUser.unit);

    // Buat DOM Overlay Custom (Agar tidak bentrok dengan SweetAlert tiket utama)
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); z-index: 99999; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(3px);
    `;

    const modalBox = document.createElement('div');
    modalBox.style.cssText = `
        width: 600px; max-width: 95vw; background: var(--bg-card);
        border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        display: flex; flex-direction: column; overflow: hidden;
        border: 1px solid var(--border-color); animation: fadeIn 0.2s ease-out;
    `;

    modalBox.innerHTML = `
        <style>
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .cmt-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: var(--bg-main); border-bottom: 1px solid var(--border-color); }
            .cmt-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); }
            .cmt-close:hover { color: #ef4444; }
            .cmt-list { padding: 15px 20px; max-height: 50vh; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: var(--bg-card); }
            .cmt-item { border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: var(--bg-main); }
            .cmt-item.is-ted { border-left: 4px solid var(--primary); background: #eff6ff; }
            .cmt-author { font-weight: 600; font-size: 0.85rem; color: var(--text-main); display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
            .cmt-badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; }
            .cmt-badge.ted { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
            .cmt-badge.unit { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
            .cmt-date { font-size: 0.72rem; color: var(--text-muted); }
            .cmt-body { font-size: 0.85rem; color: var(--text-main); line-height: 1.4; white-space: pre-wrap; margin-top: 5px; }
            .cmt-input-area { padding: 15px 20px; background: var(--bg-main); border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 10px; }
            .cmt-textarea { width: 100%; min-height: 70px; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); outline: none; resize: vertical; }
            .cmt-textarea:focus { border-color: var(--primary); }
            .cmt-btn { align-self: flex-end; background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
            .cmt-btn:hover { background: #1d4ed8; }
            .cmt-btn:disabled { background: #94a3b8; cursor: not-allowed; }
        </style>
        <div class="cmt-header">
            <div>
                <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-main);"><i class="ph ph-chats-circle"></i> Discussion: ${ticketNo}</h3>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">User: <b>${currentUser.name}</b> (${currentUser.unit})</div>
            </div>
            <button class="cmt-close" id="btn-close-cmt"><i class="ph ph-x"></i></button>
        </div>
        <div class="cmt-list" id="cmt-list-box">
            <div style="text-align: center; padding: 20px; color: var(--text-muted);"><i class="ph ph-spinner ph-spin"></i> Loading...</div>
        </div>
        <div class="cmt-input-area">
            <textarea id="txt-new-comment" class="cmt-textarea" placeholder="Tulis komentar, update, atau balasan di sini..."></textarea>
            <button type="button" class="cmt-btn" id="btn-submit-cmt"><i class="ph ph-paper-plane-tilt"></i> Kirim</button>
        </div>
    `;

    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);

    const listBox = modalBox.querySelector('#cmt-list-box');
    const txtComment = modalBox.querySelector('#txt-new-comment');
    const btnSubmit = modalBox.querySelector('#btn-submit-cmt');
    const btnClose = modalBox.querySelector('#btn-close-cmt');

    btnClose.addEventListener('click', () => { document.body.removeChild(overlay); });

    async function renderComments() {
        try {
            const comments = await fetchComments(ticketNo);
            if (comments.length === 0) {
                listBox.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-muted); font-size: 0.85rem;">Belum ada komentar. Jadilah yang pertama!</div>`;
                return;
            }
            listBox.innerHTML = comments.map(c => {
                const isTed = c.user_role.toUpperCase().includes('TED') || c.user_unit.toUpperCase().includes('TED');
                return `
                    <div class="cmt-item ${isTed ? 'is-ted' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div class="cmt-author">
                                <i class="ph ${isTed ? 'ph-shield-check' : 'ph-user'}"></i> ${c.user_name}
                                <span class="cmt-badge ${isTed ? 'ted' : 'unit'}">${c.user_unit}</span>
                            </div>
                            <div class="cmt-date">${formatCommentDate(c.created_at)}</div>
                        </div>
                        <div class="cmt-body">${c.comment_text}</div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            listBox.innerHTML = `<div style="color:#ef4444; text-align:center;">Gagal memuat komentar.</div>`;
        }
    }

    await renderComments();

    btnSubmit.addEventListener('click', async () => {
        const text = txtComment.value.trim();
        if (!text) return;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Sending...`;

        try {
            await addComment({ ticketNo, user: { empId: currentUser.empId, name: currentUser.name, role: currentUser.role, unit: currentUser.unit, text } });
            txtComment.value = '';
            await renderComments();
            if (config.onCommentAdded) config.onCommentAdded();
        } catch (err) {
            alert('Gagal mengirim komentar!');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="ph ph-paper-plane-tilt"></i> Kirim`;
        }
    });
}
