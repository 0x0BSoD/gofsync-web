export default {
    state: {
        host: null,
    },
    mutations: {
        setHost(state, host) {
            state.host = host;
        }
    },
    actions: {
        setHost({commit}, host) {
            commit("setHost", host);
        }
    },
    getters: {
        Host: state => state.host,
    }
}