import ObserverInterface from './ObserverInterface.js';

class PostObserver extends ObserverInterface {
    constructor(socket) {
        super();
        this.socket = socket;
        this.id = socket.id;
    }

    update(data){
        this.socket.emit("newComment", data);
    }
}

export default PostObserver;