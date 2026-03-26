export function demoInheritance() {
    if (typeof User === 'undefined' || typeof AdminUser === 'undefined') {
        console.error("КРИТИЧЕСКАЯ ОШИБКА: Классы User или AdminUser не найдены!");
        return;
    }

    console.log("Кнопка нажата, запускаю демо...");
    let user = new User(1, 'Michael');
    const admin = window.masterAdmin;

    if (!admin) {
        console.error("Админ не инициализирован!");
        return;
    }

    console.log(user.getInfo());
    console.log(admin.getInfo());

    admin.grantPermission('manage_users');
    console.log(admin.getPermissions());

    console.log("Список прав:", admin.getPermissions());

    if (admin.canManageUsers()) {
        admin.banUser(user.id, "Нарушение правил сообщества");
    }
    for(let i = 0; i < 6; i++) admin.grantPermission(`rule_${i}`);

    console.table(admin.getLogs());
}


export function demoButton() {
    const oldBtn = document.getElementById('demoBtn');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.id = 'demoBtn';
    btn.innerHTML = 'Запустить Демо ООП';

    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '10000', 
        padding: '15px 25px',
        backgroundColor: '#ff4757',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        display: 'block'
    });

    btn.onclick = demoInheritance;

    document.body.appendChild(btn);
    console.log("Кнопка создана программно и добавлена в body");
}


export function initDemo() {
    console.log("Попытка создания кнопки...");
    const btnId = 'demoBtn';
    if (document.getElementById(btnId)) return;

    const btn = document.createElement('button');
    btn.id = btnId;
    btn.textContent = 'ЗАПУСТИТЬ ДЕМО ООП';

    btn.setAttribute('style', `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 99999 !important;
        padding: 20px !important;
        background: red !important;
        color: white !important;
        display: block !important;
        cursor: pointer !important;
    `);

    btn.onclick = () => {
        console.log("Кнопка нажата!");
        demoInheritance();
    };

    document.body.appendChild(btn);
}