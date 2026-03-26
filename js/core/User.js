export default class User {
    id;
    name;
    role;

    constructor(id, name, role = 'user') {
        this.id = id;
        this.name = name;
        this.role = role;
    }

    hasRole(role) {
        return this.role === role;
    }

    getInfo() {
        return `Пользователь: ${this.name} (ID: ${this.id}), роль: ${this.role}`;
    }
}