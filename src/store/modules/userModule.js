export default {
    state: {
        isLogged: false,
        username: "",
    },
    mutations: {
        setUsername(state, username) {
            state.username = username;
        },
        setLogged(state, isLogged) {
            state.isLogged = isLogged;
        }
    },
    actions: {
        setUsername({commit}, username) {
            commit("setUsername", username);
        },
        setLogged({commit}, isLogged) {
            commit("setLogged", isLogged);
        }
    },
    getters: {
        Username: state => state.username,
        IsLogged: state => state.isLogged,
    }
}