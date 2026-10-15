// File: menu/modal/notifExistingPNModal.js

export function openNotifModal(ticket) {
    // 1. Tentukan status wording untuk Admin
    let adminStatusNote = "Telah Kami Terima";
    if (ticket.status === 'Under Evaluation') {
        adminStatusNote = "Sedang Dalam Evaluasi";
    } else if (ticket.status === 'Created') {
        adminStatusNote = "Telah Di-create di SAP";
    }

    // 2. Format list PN
    const formattedPNList = ticket.pns.map((p, idx) => {
        return `   ${idx + 1}. [${p.pn}] ${p.desc} (Type: ${p.type || '-'}, Qty: ${p.uom || '-'})`;
    }).join('\n');

    // 3. Template Generator
    function generateTemplates() {
        return {
            requester: {
                subject: `[Request Existing PN] Mohon Proses Tiket #${ticket.ticketNo} - ${ticket.requester}`,
                body: `Dear Tim TED-2 (Engineering Support),\n\nMohon bantuannya untuk memproses pengajuan Existing Material dengan Nomor Tiket: #${ticket.ticketNo}\n\nListed PN:\n${formattedPNList}\n\nAdapun info lebih lanjut dan detail data dapat diakses di:\nhttps://gmfengineeringservices.netlify.app/\n\nTerima kasih atas bantuan dan kerja samanya.\n\nSalam,\n${ticket.requester}\nDepartment: ${ticket.dept || '-'}`
            },
            admin: {
                subject: `[Update Status: ${ticket.status.toUpperCase()}] Tiket Existing PN #${ticket.ticketNo}`,
                body: `Dear ${ticket.requester},\n\nPengajuan Existing PN Anda dengan Nomor Tiket: #${ticket.ticketNo} dan dengan list PN berikut:\n\n${formattedPNList}\n\nStatus saat ini: (${adminStatusNote}).\n\nSilakan untuk dilakukan pengecekan di SAP dan pantau pembaruan tiket di:\nhttps://gmfengineeringservices.netlify.app/\n\nTerima kasih.\n\nSalam,\nTim TED-2 (Engineering Support)`
            }
        };
    }

    const templates = generateTemplates();

    // Default tab: jika status 'Created', default ke Admin; jika masih Received/Under, default ke Requester
    let currentRole = (ticket.status === 'Created') ? 'admin' : 'requester';

    let htmlContent = `
        <style>
            .role-switch-container {
                display: flex; gap: 10px; margin-bottom: 15px; background: var(--bg-main); padding: 6px; border-radius: 8px; border: 1px solid var(--border-color);
            }
            .role-btn {
                flex: 1; padding: 10px 14px; border: none; background: transparent; color: var(--text-muted);
                font-size: 0.85rem; font-weight: 600; cursor: pointer; border-radius: 6px; transition: all 0.2s ease;
                display: flex; align-items: center; justify-content: center; gap: 8px;
            }
            .role-btn.active {
                background: var(--bg-card); color: var(--primary); box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .email-field-group { text-align: left; margin-bottom: 12px; }
            .email-field-group label {
                display: block; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;
            }
            .email-input-text {
                width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); background: var(--bg-main);
                color: var(--text-main); font-size: 0.85rem; border-radius: 6px; outline: none; font-family: inherit;
            }
            .email-textarea {
                width: 100%; height: 260px; padding: 12px; border: 1px solid var(--border-color); background: var(--bg-main);
                color: var(--text-main); font-size: 0.85rem; border-radius: 6px; outline: none; font-family: 'Consolas', 'Courier New', monospace;
                line-height: 1.5; resize: vertical; white-space: pre-wrap;
            }
            .email-textarea:focus, .email-input-text:focus {
                border-color: var(--primary);
            }
        </style>

        <!-- Role Selector Switch -->
        <div class="role-switch-container">
            <button type="button" class="role-btn ${currentRole === 'requester' ? 'active' : ''}" id="btn-role-requester">
                <i class="ph ph-user"></i> Send as Requester
            </button>
            <button type="button" class="role-btn ${currentRole === 'admin' ? 'active' : ''}" id="btn-role-admin">
                <i class="ph ph-shield-check"></i> Send as Admin (TED-2)
            </button>
        </div>

        <!-- Subject Field -->
        <div class="email-field-group">
            <label><i class="ph ph-tag"></i> Email Subject</label>
            <input type="text" id="email-subject" class="email-input-text" readonly value="${templates[currentRole].subject}">
        </div>

        <!-- Body Field -->
        <div class="email-field-group">
            <label><i class="ph ph-envelope-open"></i> Email Body (Preview)</label>
            <textarea id="email-body" class="email-textarea">${templates[currentRole].body}</textarea>
        </div>
    `;

    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;"><i class="ph ph-envelope-simple"></i> Outlook Notification Preview</span>`,
        html: htmlContent,
        width: '650px',
        background: 'var(--bg-card)',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '<i class="ph ph-copy"></i> Copy Body Text',
        confirmButtonColor: 'var(--primary)',
        denyButtonText: '<i class="ph ph-paper-plane-tilt"></i> Open Outlook App',
        denyButtonColor: '#0284c7', // Outlook Sky Blue
        cancelButtonText: '<i class="ph ph-x"></i> Close',
        cancelButtonColor: '#64748b',
        didOpen: () => {
            const btnRequester = document.getElementById('btn-role-requester');
            const btnAdmin = document.getElementById('btn-role-admin');
            const subjectInput = document.getElementById('email-subject');
            const bodyInput = document.getElementById('email-body');

            function updateUI(role) {
                currentRole = role;
                if (role === 'requester') {
                    btnRequester.classList.add('active');
                    btnAdmin.classList.remove('active');
                } else {
                    btnAdmin.classList.add('active');
                    btnRequester.classList.remove('active');
                }
                subjectInput.value = templates[role].subject;
                bodyInput.value = templates[role].body;
            }

            btnRequester.addEventListener('click', () => updateUI('requester'));
            btnAdmin.addEventListener('click', () => updateUI('admin'));
        },
        preConfirm: () => {
            const body = document.getElementById('email-body').value;
            navigator.clipboard.writeText(body);
            return 'copied';
        }
    }).then((result) => {
        // Tombol COPY diklik
        if (result.isConfirmed) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Email text copied to clipboard!',
                showConfirmButton: false,
                timer: 2000,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
            });
        } 
        // Tombol OPEN OUTLOOK diklik
        else if (result.isDenied) {
            const subject = document.getElementById('email-subject').value;
            const body = document.getElementById('email-body').value;
            
            // Format link mailto untuk membuka Outlook
            const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoUrl;
        }
    });
}
