export default {
    state: {
        isLogged: false,
        username: "",
        globalWip: false,
    },
    mutations: {
        setUsername(state, username) {
            state.username = username;
        },
        setGlobalWip(state, wip) {
            state.globalWip = wip;
        },
        setLogged(state, isLogged) {
            state.isLogged = isLogged;
        }
    },
    actions: {
        setUsername({commit}, username) {
            commit("setUsername", username);
        },
        setGlobalWip({commit}, globalWip) {
            commit("setGlobalWip", globalWip);
        },
        setLogged({commit}, isLogged) {
            commit("setLogged", isLogged);
        }
    },
    getters: {
        Username: state => state.username,
        GlobalWip: state => state.globalWip,
        IsLogged: state => state.isLogged,
    }
}