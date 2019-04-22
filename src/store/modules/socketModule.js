export default {
    state: {
        isConnected: false,
        socketMessage: "",
    },
    mutations: {
        isConnected: (state, payload) => { state.isConnected = payload },
        socketMessage: (state, payload) => { state.socketMessage = payload },
        SOCKET_CONNECT(state) { state.isConnected = true; },
        SOCKET_DISCONNECT(state) { state.isConnected = false; },
    },
    actions: {},
    getters: {},
}