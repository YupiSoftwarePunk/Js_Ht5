import AdminUser from '../core/AdminUser.js';
import { SaveData } from '../SaveData.js';

const blogStorage = new SaveData('Blog_');

export const masterAdmin = new AdminUser(99, "Денис", blogStorage);
masterAdmin.grantPermission('manage_users');

let initialUsers = [
    { id: 1, name: "Иван Иванов", role: "user", permissions: [] },
    { id: 2, name: "Мария Смирнова", role: "user", permissions: ["editor"] },
    { id: 3, name: "Петр Техник", role: "user", permissions: [] }
];

let users = blogStorage.get('user-list') || initialUsers;

function saveUsers() {
    blogStorage.set('users_list', users);
}

document.addEventListener('DOMContentLoaded', () => {
    const adminBtn = document.getElementById('admin-login-btn');
    const adminModal = document.getElementById('admin-modal');
    const adminOverlay = document.getElementById('admin-overlay');
    const closeBtn = document.getElementById('admin-close-btn');

    function openAdminPanel() {
        adminModal.style.display = 'block';
        adminOverlay.style.display = 'block';
        renderUserList();
        syncLogsWithUI();
    }

    adminBtn.addEventListener('click', () => {
        const isAuth = blogStorage.get('is_authenticated', false);

        if (isAuth === true) {
            openAdminPanel();
            addLog("Автоматический вход (сессия сохранена)");
        } else {
            const password = prompt("Введите пароль администратора:");
            
            if (password === "admin123") {
                blogStorage.set('is_authenticated', true);
                
                openAdminPanel();
                addLog("Первичный вход выполнен успешно");
            } else {
                alert("Доступ запрещен!");
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        adminModal.style.display = 'none';
        adminOverlay.style.display = 'none';
    });

    function renderUserList() {
        const tbody = document.getElementById('user-list-body');
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.insertAdjacentHTML('afterbegin',  `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td><span class="tag">${user.role}</span></td>
                <td>${user.permissions.join(', ') || 'нет'}</td>
                <td>
                    <button class="btn-grant" onclick="handleGrant(${user.id})">Дать права</button>
                    <button class="btn-ban" onclick="handleBan(${user.id})">Бан</button>
                </td>`);
            tbody.appendChild(tr);
        });
    }

    function syncLogsWithUI() {
        const logContainer = document.getElementById('admin-log');
        logContainer.innerHTML = ''; 
        
        const history = masterAdmin.getLogs();
        history.forEach(entry => {
            const div = document.createElement('div');
            div.textContent = `[${entry.timestamp}] ${entry.action}`;
            logContainer.prepend(div); 
        });
    }

    window.handleGrant = (userId) => {
        const perm = prompt("Введите название права (например, editor, moderator):");
        if (perm && masterAdmin.grantPermission(perm)) {
            const user = users.find(u => u.id === userId);
            if (user && !user.permissions.includes(perm)) {
                user.permissions.push(perm);
                saveUsers();
                addLog(`Выдано право "${perm}" пользователю ID:${userId}`);
                renderUserList();
            }
        }
        else {
            console.log("Не удалось выдать право (возможно достигнут лимит в классе AdminUser)");
        }
    };

    window.handleBan = (userId) => {
        const reason = prompt("Причина блокировки:");
        if (reason) {
            masterAdmin.banUser(userId, reason);
            users = users.filter(u => u.id !== userId); 
            saveUsers();
            addLog(`Заблокирован пользователь ID:${userId}. Причина: ${reason}`);
            renderUserList();
        }
    };

    function addLog(message) {
        const log = document.getElementById('admin-log');
        const entry = document.createElement('div');
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        log.prepend(entry);

        if (masterAdmin && typeof masterAdmin.externalLog === 'function') {
            masterAdmin.externalLog(message);
        }
    }
});