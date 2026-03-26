import User from './User.js';

export default class AdminUser extends User {
    #permissions = new Set();
    static MAX_PERMISSIONS = 50;
    #storage;
    #logs = [];


    constructor(id, name, storage)
    {
        super(id, name, 'admin');
        this.#storage = storage;

        if (this.#storage) {
            const saved = this.#storage.get(`admin_${this.id}`);
            if (saved) {
                if (saved.permissions) {
                    saved.permissions.forEach(p => this.#permissions.add(p));
                }
                if (saved.logs) {
                    this.#logs = saved.logs;
                }
            }
        }
    }

    grantPermission(permission)
    {
        if (permission === 'admin') {
            console.log("Попытка выдать права 'admin' обычным способом отклонена.");
            this.#addLog(`Ошибка: Лимит прав достигнут при попытке добавить ${permission}`);
            return false;
        }
        
        if (this.#permissions.size >= AdminUser.MAX_PERMISSIONS) {
            console.log("Достигнут лимит прав!");
            this.#addLog(`Достигнут лимит прав!`);
            return false;
        }

        if (!this.#permissions.has(permission)) {
            this.#permissions.add(permission);
            console.log(`[LOG]: Администратор ${this.name} выдал право: ${permission}`);
            this.#addLog(`Администратор ${this.name} выдал право: ${permission}`);
            this.saveState();
            return true;
        }
    }

    revokePermission(permission)
    {
        if (this.#permissions.delete(permission)) {
            this.saveState();
            console.log(`[LOG]: Администратор ${this.name} отозвал право: ${permission}`);
            this.#addLog(`[LOG]: Администратор ${this.name} отозвал право: ${permission}`);
        }
    }

    hasRole(role)
    {
        if (role === 'admin') {
            console.log('Вы уже админ');
            this.#addLog(`Вы уже админ`);
            return true;
        }
        else {
            console.log(`у вас есть роль: ${role}`);
            this.#addLog(`у вас есть роль: ${role}`);
            return this.#permissions.has(role);
        }
    }

    getPermissions()
    {
        console.log(`У вас есть разрешения: ${Array.from(this.#permissions)}`);
        this.#addLog(`У вас есть разрешения: ${Array.from(this.#permissions)}`);
        return Array.from(this.#permissions);
    }

    canManageUsers()
    {
        return this.#permissions.has('manage_users');
    }

    banUser(userId, reason)
    {
        if (!this.canManageUsers()) {
            console.error("Недостаточно прав для блокировки пользователей!");
            this.#addLog("Недостаточно прав для блокировки пользователей!");
            return;
        }
        this.#addLog(`[LOG]: Пользователь ${userId} заблокирован админом ${this.name}. Причина: ${reason}`);
        console.log(`[LOG]: Пользователь ${userId} заблокирован админом ${this.name}. Причина: ${reason}`);
    }

    saveState() {
    if (!this.#storage) {
        return
    };

    const dataToSave = {
        id: this.id,
        name: this.name,
        permissions: Array.from(this.#permissions),
        logs: this.#logs
    };
    this.#storage.set(`admin_${this.id}`, dataToSave);
    }

    #addLog(message) {
        const entry = {
            timestamp: new Date().toLocaleString(),
            action: message
        };
        this.#logs.push(entry);
        console.log(`[INTERNAL LOG]: ${message}`);
        this.saveState();
    }

    getLogs() {
        return [...this.#logs];
    }

    clearHistory() {
        this.#logs = [];
        this.saveState();
    }

    externalLog(message) {
        this.#addLog(message);
    }
}