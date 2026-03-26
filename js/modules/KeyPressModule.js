import { showConfirmDelete } from './deleteModule.js';

export function initKeyboardShortcuts(storage) {
    window.addEventListener('keydown', (e) => {
        const defaultShortcuts = {
            search: { key: '/', ctrl: true, alt: false },
            newPost: { key: 'n', ctrl: false, alt: true },
            editPost: { key: 'e', ctrl: false, alt: false },
            scrollUp: { key: 'w', ctrl: false, alt: false },
            scrollDown: { key: 's', ctrl: false, alt: false }
        };
        
        let rawData = storage.get('user_shortcuts_map') || storage.get('user_shortcuts');
        let userShortcuts = defaultShortcuts;

        if (rawData) {
            if (Array.isArray(rawData)) {
                userShortcuts = rawData.reduce((acc, curr) => {
                    acc[curr.id] = curr;
                    return acc;
                }, {});
            } else {
                userShortcuts = rawData;
            }
        }

        const isShortcut = (config) => {
            if (!config) return false;
            return e.key.toLowerCase() === config.key.toLowerCase() && 
                e.ctrlKey === !!config.ctrl && 
                e.altKey === !!config.alt;
        };

        const modalOverlay = document.getElementById('post-modal-overlay');
        const postForm = document.getElementById('new-post-form');
        const titleInput = document.getElementById('form-title');

        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

        const closeModal = () => {
            modalOverlay.style.display = 'none';
            if (postForm) postForm.reset();
        };

        if (e.key === 'Escape') {
            if (modalOverlay && modalOverlay.style.display === 'flex') closeModal();
            
            const adminModal = document.getElementById('admin-modal');
            if (adminModal && (adminModal.style.display === 'block' || adminModal.style.display === 'flex')) {
                document.getElementById('admin-close-btn')?.click();
            }

            const postModal = document.querySelector('#post-detail-modal');
            if (postModal && (postModal.style.display === 'block' || postModal.style.display === 'flex')) {
                document.querySelector('#detail-close-btn')?.click();
            }

            document.querySelector('.delete-overlay')?.remove();

            document.querySelector('#close-shortcuts-btn')?.click();
            return;
        }

        if (e.key === 'Enter') {
            const deleteOverlay = document.querySelector('.delete-overlay');
            if (deleteOverlay) {
                e.preventDefault();
                deleteOverlay.querySelector('#confirm-yes')?.click();
                return;
            }
        }

        if (isShortcut(userShortcuts.search)) {
            e.preventDefault(); 
            document.getElementById('search-input')?.focus();
            return;
        }

        if (isShortcut(userShortcuts.newPost)) {
            e.preventDefault();
            if (modalOverlay) {
                modalOverlay.style.display = 'flex';
                titleInput?.focus();
            }
            return;
        }

        if (!isTyping) {
            const scrollStep = 150;
            if (isShortcut(userShortcuts.scrollUp) || e.key.toLowerCase() === 'ц') {
                window.scrollBy({ top: -scrollStep, behavior: 'smooth' });
            }
            if (isShortcut(userShortcuts.scrollDown) || e.key.toLowerCase() === 'ы') {
                window.scrollBy({ top: scrollStep, behavior: 'smooth' });
            }
        }

        const activePost = document.activeElement.closest('.focusable-post');
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault(); 
            const allFocusable = Array.from(document.querySelectorAll('.focusable-post'));
            const currentIndex = allFocusable.indexOf(activePost);
            
            if (e.key === 'ArrowDown' && currentIndex < allFocusable.length - 1) {
                allFocusable[currentIndex + 1].focus();
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                allFocusable[currentIndex - 1].focus();
            }
        }

        if (activePost && !isTyping) {
            if (e.code === 'Space' || (e.code === 'Enter')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                activePost.querySelector('.post-like-container')?.click();
                return;
            }
            if (isShortcut(userShortcuts.editPost) || e.key.toLowerCase() === 'у') {
                if (!isTyping) activePost.click();
            }

            if (e.key === 'Delete') {
                showConfirmDelete(activePost.id, activePost, storage);
            }
        }
    }, true);
}


export function shortcutEditor(storage) {
    const body = document.getElementById('shortcuts-list-body');
    const saveBtn = document.getElementById('save-shortcuts-btn');

    let shortcuts = storage.get('user_shortcuts') || [
        { id: 'search', label: 'Поиск', key: '/', ctrl: true },
        { id: 'newPost', label: 'Создать пост', key: 'n', alt: true },
        { id: 'scrollUp', label: 'Скролл вверх', key: 'w', ctrl: false },
        { id: 'scrollDown', label: 'Скролл вниз', key: 's', ctrl: false }
    ];

    function render() {
        body.innerHTML = '';
        shortcuts.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.label}</td>
                <td>
                    <div class="shortcut-input-cell">
                        ${item.ctrl ? '<kbd>Ctrl</kbd> + ' : ''}
                        ${item.alt ? '<kbd>Alt</kbd> + ' : ''}
                        <button class="key-assign-btn" data-index="${index}">
                            <kbd>${item.key.toUpperCase()}</kbd>
                        </button>
                    </div>
                </td>
            `;
            body.appendChild(tr);
        });
        attachEditEvents();
    }

    function attachEditEvents() {
        document.querySelectorAll('.key-assign-btn').forEach(btn => {
            btn.onclick = (e) => {
                const index = e.currentTarget.dataset.index;
                const originalText = e.currentTarget.innerHTML;
                e.currentTarget.innerHTML = 'Нажмите клавишу...';
                e.currentTarget.classList.add('waiting');

                const captureKey = (event) => {
                    event.preventDefault();
                    if (!['Control', 'Alt', 'Shift'].includes(event.key)) {
                        shortcuts[index].key = event.key.toLowerCase();
                        shortcuts[index].ctrl = event.ctrlKey;
                        shortcuts[index].alt = event.altKey;
                        
                        window.removeEventListener('keydown', captureKey);
                        render();
                    }
                };
                window.addEventListener('keydown', captureKey);
            };
        });
    }

    saveBtn.onclick = () => {
        storage.set('user_shortcuts', shortcuts);
        alert('Горячие клавиши сохранены! Перезагрузите страницу для применения.');
        document.getElementById('shortcuts-modal').style.display = 'none';
    };

    render();
}