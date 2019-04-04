import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  plugins: [
  ],
  state: {
    username: "anon"
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
  },

});
