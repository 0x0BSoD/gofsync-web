import Vue from "vue";
import Vuex from "vuex";

import socketModule from "./modules/socketModule";
import userModule from "./modules/userModule";
import hostModule from "./modules/hostModule";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    socketModule,
    userModule,
    hostModule,
  },
});
