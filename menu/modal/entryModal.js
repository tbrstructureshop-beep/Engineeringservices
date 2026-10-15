// File: menu/entryModal.js

export function openEntryModal(config) {
    // 1. Generate HTML dengan Accordion (Details/Summary)
    let htmlForm = `
        <div style="margin-top: 15px; max-height: 65vh; overflow-y: auto; overflow-x: hidden; padding: 5px; text-align: left; display: flex; flex-direction: column; gap: 10px;">
    `;
    
    // Looping berdasarkan Section
    config.sections.forEach((sec, index) => {
        // Section pertama otomatis terbuka (open), sisanya tertutup
        const isOpen = index === 0 ? 'open' : ''; 
        
        htmlForm += `
            <details ${isOpen} style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;">
                <summary style="font-weight: 600; cursor: pointer; color: var(--text-main); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                    <i class="ph ph-caret-down"></i> ${sec.title}
                </summary>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-color);">
        `;
        
        // Looping field di dalam section tersebut
        sec.fields.forEach(f => {
            htmlForm += `
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">
                        ${f.label}
                    </label>
            `;
            
            if (f.type === 'select') {
                htmlForm += `<select id="swal-input-${f.id}" class="swal2-input" 
                    style="margin: 0; width: 100%; height: 42px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);">`;
                f.options.forEach(opt => {
                    htmlForm += `<option value="${opt.value || opt}">${opt.label || opt}</option>`;
                });
                htmlForm += `</select>`;
            } else {
                htmlForm += `<input id="swal-input-${f.id}" type="${f.type || 'text'}" class="swal2-input" 
                    placeholder="${f.placeholder || ''}" 
                    style="margin: 0; width: 100%; height: 42px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);">`;
            }
            
            htmlForm += `</div>`;
        });
        
        htmlForm += `</div></details>`; // Tutup grid & details
    });
    
    // Checkbox untuk "Tambah data lagi"
    htmlForm += `
        <div style="margin-top: 15px; padding: 10px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe; display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="swal-add-more" style="width: 18px; height: 18px; cursor: pointer;">
            <label for="swal-add-more" style="font-size: 0.85rem; color: #1e3a8a; font-weight: 500; cursor: pointer;">
                Submit and instantly add another Part Number
            </label>
        </div>
    </div>`; // Tutup container utama

    // 2. Panggil SweetAlert2
    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;">${config.title}</span>`,
        html: htmlForm,
        width: '800px',
        background: 'var(--bg-card)', 
        showCancelButton: true,
        confirmButtonText: '<i class="ph ph-paper-plane-right"></i> Submit Data',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: '#64748b',
        focusConfirm: false,
        didOpen: () => {
            // Animasi panah pada tag details (opsional)
            const details = document.querySelectorAll('details');
            details.forEach(det => {
                det.addEventListener('toggle', (e) => {
                    const icon = e.target.querySelector('summary i');
                    if(e.target.open) icon.classList.replace('ph-caret-right', 'ph-caret-down');
                    else icon.classList.replace('ph-caret-down', 'ph-caret-right');
                });
                if(!det.open) det.querySelector('summary i').classList.replace('ph-caret-down', 'ph-caret-right');
            });
        },
        preConfirm: () => {
            const result = {};
            // Looping baca semua value dari sections config
            for (const sec of config.sections) {
                for (const f of sec.fields) {
                    const val = document.getElementById(`swal-input-${f.id}`).value.trim();
                    if (f.required && !val) {
                        Swal.showValidationMessage(`Kolom <b>${f.label}</b> pada section <b>${sec.title}</b> tidak boleh kosong!`);
                        return false;
                    }
                    result[f.id] = f.uppercase ? val.toUpperCase() : val;
                }
            }
            // Baca status checkbox
            result._addMore = document.getElementById('swal-add-more').checked;
            return result;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Eksekusi fungsi simpan
            config.onSubmit(result.value);
            
            // Cek apakah checkbox dicentang?
            if (result.value._addMore) {
                // Notifikasi mini di pojok (Toast)
                Swal.fire({
                    toast: true, position: 'top-end', icon: 'success', title: 'Saved! Ready for next.', showConfirmButton: false, timer: 1500
                });
                // Buka form lagi secara otomatis
                setTimeout(() => openEntryModal(config), 500); 
            } else {
                // Notifikasi sukses normal
                Swal.fire({
                    icon: 'success', title: 'Berhasil!', text: 'Data material berhasil masuk tracker.', background: 'var(--bg-card)', color: 'var(--text-main)', timer: 2000, showConfirmButton: false
                });
            }
        }
    });
}
