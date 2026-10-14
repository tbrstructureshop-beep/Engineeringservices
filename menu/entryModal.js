// File: menu/entryModal.js

export function openEntryModal(config) {
    // 1. Generate HTML Grid Layout untuk menangani form puluhan input
    // Menggunakan Grid 2 kolom dengan max-height agar bisa discroll jika inputnya banyak
    let htmlForm = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; 
                    margin-top: 15px; max-height: 65vh; overflow-y: auto; overflow-x: hidden; padding: 5px; text-align: left;">
    `;
    
    config.fields.forEach(f => {
        htmlForm += `
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">
                    ${f.label}
                </label>
        `;
        
        if (f.type === 'select') {
            htmlForm += `<select id="swal-input-${f.id}" class="swal2-input" 
                style="margin: 0; width: 100%; height: 42px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);">`;
            
            // Generate Option
            f.options.forEach(opt => {
                htmlForm += `<option value="${opt.value || opt}">${opt.label || opt}</option>`;
            });
            htmlForm += `</select>`;
        } else {
            // Default ke input text
            htmlForm += `<input id="swal-input-${f.id}" type="${f.type || 'text'}" class="swal2-input" 
                placeholder="${f.placeholder || ''}" 
                style="margin: 0; width: 100%; height: 42px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);">`;
        }
        
        htmlForm += `</div>`;
    });
    
    htmlForm += `</div>`;

    // 2. Panggil SweetAlert2
    Swal.fire({
        title: `<span style="color: var(--text-main); font-size: 1.25rem;">${config.title}</span>`,
        html: htmlForm,
        width: '800px', // Diperlebar agar form 2 kolom proporsional
        background: 'var(--bg-card)', 
        showCancelButton: true,
        confirmButtonText: '<i class="ph ph-paper-plane-right"></i> Submit Data',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: '#64748b',
        focusConfirm: false,
        preConfirm: () => {
            const result = {};
            // 3. Auto-baca Semua Value Berdasarkan Array Fields
            for (const f of config.fields) {
                const val = document.getElementById(`swal-input-${f.id}`).value.trim();
                
                // Validasi Otomatis Jika Required
                if (f.required && !val) {
                    Swal.showValidationMessage(`Kolom <b>${f.label}</b> tidak boleh kosong!`);
                    return false;
                }
                
                // Ubah otomatis menjadi UPPERCASE jika diminta
                result[f.id] = f.uppercase ? val.toUpperCase() : val;
            }
            return result;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Lempar data ke menu pemanggil
            config.onSubmit(result.value);
            
            // Notifikasi Sukses
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data material berhasil masuk ke dalam tracker.',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}
