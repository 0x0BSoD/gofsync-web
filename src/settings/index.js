export const config = {
    api,
    ws,
};
export default config;

function api() {
    let sjc = "https://sjc01-c01-pds10.c01.ringcentral.com:8086/api/v1/";
    let local = "http://localhost:8086/"
    return local
}

function ws() {
    let sjc = "wss://sjc01-c01-pds10.c01.ringcentral.com:8086/api/v1/ws";
    let local = "ws://localhost:8086/ws";
    return local
}