export const config = {
    api,
    ws,
};
export default config;
const ENV = process.env.NODE_ENV;

function api() {
    // let sjc = "https://sjc01-c01-pds10.c01.ringcentral.com:8086/api/v1/";
    let sjc = "https://sjc01-c01-pds10.c01.ringcentral.com:8087/";
    let local = "http://localhost:8086/";

    if (ENV === "development") {
        return local
    } else {
        return sjc
    }
}

function ws() {
    // let sjc = "wss://sjc01-c01-pds10.c01.ringcentral.com:8086/api/v1/ws";
    let sjc = "wss://sjc01-c01-pds10.c01.ringcentral.com:8088/";
    let local = "ws://localhost:8086/ws";

    if (ENV === "development") {
        return local
    } else {
        return sjc
    }
}