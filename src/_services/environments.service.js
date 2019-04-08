import Api from "./Api";

export const environmentService = {
    envList,
    envCheck,
};

// GET ===========================================
function envList(host) {
    return Api().get(`env/${host}`);
}
// POST ===========================================
function envCheck(data) {
    return Api().post("env/check", data)
}