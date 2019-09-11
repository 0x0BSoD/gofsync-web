import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default {
    state: {
        socket: {
            globalWork: {
                run: false,
                current: null,
            },
            isConnected: false,
            message: '',
            reconnectError: false,
        }
    },
    mutations: {
        SOCKET_ONOPEN(state, event) {
            Vue.prototype.$socket = event.currentTarget;
            state.socket.isConnected = true;
        },
        SOCKET_ONCLOSE(state, event) {
            state.socket.isConnected = false;
        },
        SOCKET_ONERROR(state, event) {
            console.info(state, event)
        },
        SOCKET_ONMESSAGE(state, message) {
            try {
                let msg = JSON.parse(message.data);
                state.socket.message = msg;
                if (msg.broadcast) {
                    if (msg.data.state === "started") {
                        state.socket.globalWork.run = true;
                        state.socket.globalWork.current = msg;
                    }
                    if (msg.data.state === "done") {
                        state.socket.globalWork.run = false;
                        state.socket.globalWork.current = null;
                    }
                }

            } catch (e) {
                console.info(message.data);
                console.info(e);
            }
        },
        SOCKET_RECONNECT(state, count) {
            console.info(state, count);
        },
        SOCKET_RECONNECT_ERROR(state) {
            state.socket.reconnectError = true;
        },
    },
    getters: {
        WSConnected: state => state.socket.isConnected,
        GlobalWork: state => state.socket.globalWork,
    }
}