class SubscribeManager {
    constructor() {
        this.subscribers = [];
    }
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }
    unsubscribe(subscriber) {
        this.subscribers = this.subscribers.filter((s) => s.id !== subscriber);
    }
    notify(data) {
        this.subscribers.forEach((s) => s.update(data));
    }
}

export default SubscribeManager;