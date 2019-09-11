export const config = {
    api,
    ws,
};
export default config;
const ENV = process.env.NODE_ENV;

function api() {
    if (ENV === "development") {
        return  "http://localhost:8086/";
    } else {
        return  "https://sjc01-c01-pds10.c01.ringcentral.com:8087/";
    }
}

function ws()  {
    if (ENV === "development") {
        return "ws://localhost:8086/ws";
    } else {
        return "wss://sjc01-c01-pds10.c01.ringcentral.com:8088/";
    }
}