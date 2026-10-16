// File: menu/modal/commentExistingPN.js
import { fetchComments, addComment, markCommentsAsRead } from '../../config/Transaction/commentExistingPN.js';

export async function openCommentModal(config) {
    const ticketNo = config.ticketNo;
    const currentUser = config.currentUser || { name: 'User', role: 'Requester', unit: '-' };

    // Format Tanggal: DD MMM YYYY, HH:mm
    function formatCommentDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        return `${datePart}, ${timePart}`;
    }

    // 1. Tandai langsung sebagai dibaca saat modal dibuka (Notifikasi otomatis hilang)
    await markCommentsAsRead(ticketNo, currentUser.role, currentUser.unit);

    const modalHTML = `
        <style>
            .comment-container { display: flex; flex-direction: column; gap: 12px; max-height: 48vh; overflow-y: auto; padding: 10px 4px; text-align: left; }
            .comment-item { background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; }
            .comment-item.is-ted { border-left: 4px solid var(--primary); background: #f8faff; }
            .comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
            .comment-author { font-weight: 600; font-size: 0.85rem; color: var(--text-main); display: flex; align-items: center; gap: 6px; }
            .badge-role { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
            .badge-ted { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
            .badge-unit { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
            .comment-date { font-size: 0.72rem; color: var(--text-muted); }
            .comment-body { font-size: 0.82rem; color: var(--text-main); white-space: pre-wrap; line-height: 1.4; word-break: break-word; }
            .comment-input-area { margin-top: 15px; display: flex; flex-direction: column; gap: 8px; text-align: left; }
            .comment-textarea { width: 100%; min-height: 75px; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); outline: none; resize: vertical; }
            .comment-textarea:focus { border-color: var(--primary); }
        </style>

        <div style="background: var(--bg-main); padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 12px; font-size: 0.8rem; text-align: left; display: flex; justify-content: space-between;">
            <div>Ticket: <b style="color:var(--primary);">${ticketNo}</b></div>
            <div>User: <b>${currentUser.name}</b> (${currentUser.unit})</div>
        </div>

        <div class="comment-container" id="comment-list-box">
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                <i class="ph ph-spinner ph-spin" style="font-size: 1.3rem;"></i> Memuat diskusi...
            </div>
        </div>

        <div class="comment-input-area">
            <textarea id="txt-new-comment" class="comment-textarea" placeholder="Tulis komentar atau tanggapan terkait tiket ini..."></textarea>
            <div style="display:flex; justify-content: flex-end;">
                <button type="button" id="btn-submit-comment" class="btn-submit" style="margin-top:0; padding: 8px 16px; font-size:0.85rem;">
                    <i class="ph ph-paper-plane-tilt"></i> Kirim Komentar
                </button>
            </div>
        </div>
    `;

    Swal.fire({
        title: `<span style="font-size: 1.15rem; color: var(--text-main);"><i class="ph ph-chats-circle"></i> Diskusi & Komentar Tiket</span>`,
        html: modalHTML,
        width: '650px',
        background: 'var(--bg-card)',
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: async () => {
            const listBox = document.getElementById('comment-list-box');
            const txtComment = document.getElementById('txt-new-comment');
            const btnSubmit = document.getElementById('btn-submit-comment');

            async function renderComments() {
                try {
                    const comments = await fetchComments(ticketNo);
                    if (comments.length === 0) {
                        listBox.innerHTML = `
                            <div style="text-align:center; padding: 30px; color: var(--text-muted); font-size: 0.85rem;">
                                <i class="ph ph-chat-teardrop-dots" style="font-size: 2rem; display:block; margin-bottom:6px;"></i>
                                Belum ada komentar pada tiket ini. Tulis tanggapan pertama di bawah!
                            </div>
                        `;
                        return;
                    }

                    listBox.innerHTML = comments.map(c => {
                        const isTed = c.user_role.toUpperCase().includes('TED') || c.user_unit.toUpperCase().includes('TED');
                        return `
                            <div class="comment-item ${isTed ? 'is-ted' : ''}">
                                <div class="comment-header">
                                    <div class="comment-author">
                                        <i class="ph ${isTed ? 'ph-shield-check' : 'ph-user'}"></i> ${c.user_name}
                                        <span class="badge-role ${isTed ? 'badge-ted' : 'badge-unit'}">${c.user_unit} (${c.user_role})</span>
                                    </div>
                                    <div class="comment-date"><i class="ph ph-clock"></i> ${formatCommentDate(c.created_at)}</div>
                                </div>
                                <div class="comment-body">${c.comment_text}</div>
                            </div>
                        `;
                    }).join('');
                } catch (err) {
                    listBox.innerHTML = `<div style="color:#ef4444; text-align:center;">Gagal memuat komentar.</div>`;
                }
            }

            // Muat komentar awal
            await renderComments();

            // Kirim Komentar Baru
            btnSubmit.addEventListener('click', async () => {
                const text = txtComment.value.trim();
                if (!text) return;

                btnSubmit.disabled = true;
                btnSubmit.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Mengirim...`;

                try {
                    await addComment({
                        ticketNo: ticketNo,
                        user: {
                            empId: currentUser.empId,
                            name: currentUser.name,
                            role: currentUser.role,
                            unit: currentUser.unit,
                            text: text
                        }
                    });

                    txtComment.value = '';
                    await renderComments();
                    
                    if (config.onCommentAdded) {
                        config.onCommentAdded();
                    }
                } catch (err) {
                    Swal.showValidationMessage('Gagal mengirim komentar: ' + err.message);
                } finally {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = `<i class="ph ph-paper-plane-tilt"></i> Kirim Komentar`;
                }
            });
        }
    });
}
