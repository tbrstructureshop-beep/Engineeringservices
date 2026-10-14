// File: menu/entryModal.js

export function openEntryModal(config) {
    // 1. Generate HTML untuk Form Inputs berdasarkan config
    let htmlForm = `<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">`;
    
    config.fields.forEach(f => {
        htmlForm += `
            <div style="display: flex; flex-direction: column; text-align: left; gap: 5px;">
                <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">
                    ${f.label}
                </label>
        `;
        
        if (f.type === 'select') {
            htmlForm += `<select id="swal-input-${f.id}" class="swal2-input" style="margin: 0; width: 100%; font-size: 0.9rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);">`;
            f.options.forEach(opt => {
                htmlForm += `<option value="${opt}">${opt}</option>`;
            });
            htmlForm += `</select>`;
        } else {
            htmlForm += `<input id="swal-input-${f.id}" type="text" class="swal2-input" placeholder="${f.placeholder || ''}" style="margin: 0; width: 100%; font-size: 0.9rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);">`;
        }
        
        htmlForm += `</div>`;
    });
    
    htmlForm += `</div>`;

    // 2. Panggil SweetAlert2
    Swal.fire({
        title: `<span style="color: var(--text-main)">${config.title}</span>`,
        html: htmlForm,
        background: 'var(--bg-card)', // Supaya support Dark Mode
        showCancelButton: true,
        confirmButtonText: 'Submit Request',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: '#64748b',
        focusConfirm: false,
        preConfirm: () => {
            const result = {};
            // Ambil semua value dari input
            for (const f of config.fields) {
                const val = document.getElementById(`swal-input-${f.id}`).value.trim();
                if (f.required && !val) {
                    Swal.showValidationMessage(`Field "${f.label}" tidak boleh kosong!`);
                    return false;
                }
                result[f.id] = val;
            }
            return result;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Lempar data ke menu yang memanggil
            config.onSubmit(result.value);
            
            // Sweet Listener: Notifikasi Sukses
            Swal.fire({
                icon: 'success',
                title: 'Data Terkirim!',
                text: 'Material request berhasil ditambahkan ke tracker.',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}
