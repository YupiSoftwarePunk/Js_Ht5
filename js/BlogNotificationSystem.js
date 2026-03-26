class BlogNotificationSystem {
    constructor() {
        this.subscribers = [];
    }

    subscribe(user) {
        this.subscribers.push(user);
    }

    notify(message) {
        this.subscribers.forEach(user => {
            console.log(`Уведомление для ${user.name}: ${message}`);
        });
    }
}