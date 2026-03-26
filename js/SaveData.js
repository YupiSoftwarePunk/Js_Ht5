export class SaveData {
    #prefix;

    constructor(prefix = 'app_') {
        this.#prefix = prefix;
    }

    set(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(`${this.#prefix}${key}`, serializedValue);
        } 
        catch (error) {
            console.error('LocalStorage Write Error:', error);
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`${this.#prefix}${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } 
        catch (error) {
            console.error('LocalStorage Read Error:', error);
            return defaultValue;
        }
    }

    remove(key) {
        localStorage.removeItem(`${this.#prefix}${key}`);
    }

    clear() {
        Object.keys(localStorage)
            .filter(k => k.startsWith(this.#prefix))
            .forEach(k => localStorage.removeItem(k));
    }

    has(key) {
        return localStorage.getItem(`${this.#prefix}${key}`) !== null;
    }
}