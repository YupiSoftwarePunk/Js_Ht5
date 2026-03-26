class UserFactory {
    static create(data) {
        if (data.role === 'admin') {
            const admin = new AdminUser(data.id, data.name);
            data.permissions?.forEach(p => admin.grantPermission(p));
            return admin;
        }
        return new User(data.id, data.name, data.role);
    }
}