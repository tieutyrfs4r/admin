import { createApp } from 'vue';
import NotifyComponent from '../vue/NotifyComponent.vue';

const NotifyApp = createApp(NotifyComponent);
const notifyContainer = document.createElement('div');
document.body.appendChild(notifyContainer);
const notifyInstance = NotifyApp.mount(notifyContainer);

const Notify = {
    success(title, message) {
        notifyInstance.showNotify('success', title, message);
    },
    error(title, message) {
        notifyInstance.showNotify('error', title, message);
    }
};

export default Notify;