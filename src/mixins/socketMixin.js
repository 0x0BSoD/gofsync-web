export const socketMixin = {
    sockets: {
        connect: function () {
            this.$store.commit("SOCKET_CONNECT");
        },
        disconnect: function () {
            this.$store.commit("SOCKET_DISCONNECT");
        },
    },
};