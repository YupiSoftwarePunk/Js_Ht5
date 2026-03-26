export function showConfirmDelete(postId, postElement, storage) {
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'delete-overlay';

    confirmOverlay.setAttribute('role', 'alertdialog');
    confirmOverlay.setAttribute('aria-modal', 'true');
    confirmOverlay.setAttribute('aria-labelledby', 'delete-title');

    confirmOverlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); display: flex; justify-content: center;
        align-items: center; z-index: 10000;
    `;

    const dialog = document.createElement('div');
    dialog.className = 'delete-post';
    dialog.style = "background: white; padding: 20px; border-radius: 8px; text-align: center; color: #333;";
    dialog.innerHTML = `
        <p>Удалить пост №${postId} навсегда?</p>
        <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
            <button id="confirm-yes" style="background: #ff4d4d; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px;">Да, удаляй</button>
            <button id="confirm-no" style="background: #ccc; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px;">Отмена</button>
        </div>
    `;

    confirmOverlay.appendChild(dialog);
    document.body.appendChild(confirmOverlay);

    setTimeout(() => confirmOverlay.querySelector('#confirm-yes').focus(), 10);

    dialog.querySelector('#confirm-no').onclick = () => confirmOverlay.remove();
    
    dialog.querySelector('#confirm-yes').onclick = () => {
        postElement.remove();

        const currentDynamic = storage.get('dynamic_posts') || [];
        const updatedDynamic = currentDynamic.filter(p => String(p.id) !== String(postId));
        storage.set('dynamic_posts', updatedDynamic);

        if (typeof initTags === 'function') initTags();

        confirmOverlay.remove();
        console.log(`Пост ${postId} удален`);
        postElement.focus();
    };
}