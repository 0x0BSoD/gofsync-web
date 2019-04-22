export default {
    state: {
        isConnected: false,
        updateState: "",
    },
    mutations: {
        isConnected: (state, payload) => { state.isConnected = payload },
        updateState: (state, payload) => { state.updateState = payload },
        SOCKET_CONNECT(state) { state.isConnected = true; },
        SOCKET_DISCONNECT(state) { state.isConnected = false; },
    },
    actions: {},
    getters: {},
}