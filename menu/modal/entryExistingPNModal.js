// File: menu/modal/entryExistingPNModal.js

export function openEntryModal(config) {
    // 1. Generate Header Info (Ticket, Requester, Dept)
    let htmlForm = `
        <div style="display: flex; justify-content: space-between; background: var(--bg-main); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 10px; font-size: 0.85rem; text-align: left;">
            <div>
                <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Ticket No</div>
                <div style="font-weight: 700; color: var(--primary); font-size: 1rem;">${config.headerData.ticketNo}</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Requester</div>
                <div style="font-weight: 600; color: var(--text-main);">${config.headerData.requester}</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Department</div>
                <div style="font-weight: 600; color: var(--text-main);">${config.headerData.department}</div>
            </div>
        </div>

        <div style="margin-top: 15px; max-height: 55vh; overflow-y: auto; overflow-x: hidden; padding: 5px; text-align: left; display: flex; flex-direction: column; gap: 10px;">
    `;
    
    // 2. Generate Accordion Form
    config.sections.forEach((sec, index) => {
        const isOpen = index === 0 ? 'open' : ''; 
        htmlForm += `
            <details ${isOpen} style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;">
                <summary style="font-weight: 600; cursor: pointer; color: var(--text-main); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                    <i class="ph ph-caret-down"></i> ${sec.title}
                </summary>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-color);">
        `;
        
        sec.fields.forEach(f => {
            htmlForm += `
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">${f.label}</label>
            `;
            
            if (f.type === 'select') {
                htmlForm += `<select id="swal-input-${f.id}" class="swal2-input" style="margin: 0; width: 100%; height: 42px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);">`;
                f.options.forEach(opt => htmlForm += `<option value="${opt.value || opt}">${opt.label || opt}</option>`);
                htmlForm += `</select>`;
            } else {
                htmlForm += `<input id="swal-input-${f.id}" type="${f.type || 'text'}" class="swal2-input" placeholder="${f.placeholder || ''}" style="margin: 0; width: 100%; height: 42px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);">`;
            }
            
            htmlForm += `</div>`;
        });
        
        htmlForm += `</div></details>`; 
    });
    
    // 3. Add Another Checkbox
    htmlForm += `
        <div style="margin-top: 15px; padding: 10px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe; display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="swal-add-more" style="width: 18px; height: 18px; cursor: pointer;">
            <label for="swal-add-more" style="font-size: 0.85rem; color: #1e3a8a; font-weight: 500; cursor: pointer;">
                Submit & Add Another PN into Ticket <b>${config.headerData.ticketNo}</b>
            </label>
        </div>
    </div>`;

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
        preConfirm: () => {
            const result = {};
            for (const sec of config.sections) {
                for (const f of sec.fields) {
                    const el = document.getElementById(`swal-input-${f.id}`);
                    const val = el ? el.value.trim() : '';
                    if (f.required && !val) {
                        Swal.showValidationMessage(`Kolom <b>${f.label}</b> tidak boleh kosong!`);
                        return false;
                    }
                    result[f.id] = f.uppercase ? val.toUpperCase() : val;
                }
            }
            result._addMore = document.getElementById('swal-add-more').checked;
            return result;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            config.onSubmit(result.value, config.headerData);
            
            if (result.value._addMore) {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Saved! Add next PN.', showConfirmButton: false, timer: 1500 });
                // Looping dengan mempertahankan Header (Nomor Tiket Tetap Sama)
                setTimeout(() => openEntryModal(config), 500); 
            } else {
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data tersimpan.', background: 'var(--bg-card)', color: 'var(--text-main)', timer: 2000, showConfirmButton: false });
            }
        }
    });
}
