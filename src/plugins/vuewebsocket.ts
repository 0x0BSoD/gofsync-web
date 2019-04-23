import Vue from 'vue'
import ws from "vue-native-websocket";

import store from "../store";

Vue.use(
    ws,
    "ws://localhost:8086/ws",
    {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        store: store,
        format: 'json'
    },
);