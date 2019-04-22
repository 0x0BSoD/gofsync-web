export default {
    state: {
        isLogged: false,
        username: "anon",
    },
    mutations: {
        setUsername (state, username) {
            state.username = username;
        }
    },
    actions: {
        setUsername ({commit}, username) {
            commit("setUsername", username);
        }
    },
    getters: {
        Username: state => state.username,
    }
}