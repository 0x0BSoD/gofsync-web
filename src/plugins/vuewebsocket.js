import Vue from 'vue'
import ws from "vue-native-websocket";

import store from "../store";
import config from "../settings";

Vue.use(
    ws,
    config.ws(),
    {
        reconnection: false,
        reconnectionAttempts: 1,
        reconnectionDelay: 3000,
        store: store,
        format: 'json',
        protocol: "wss",
    },
);