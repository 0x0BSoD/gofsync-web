import Api from "./Api";

export const hostGroupService = {
    hg,
    hgList,
    hgFCheck,
    // hgFGet,
    hgFUpdate,
    hgCheck,
    hgSend,
    hgUpdate,
};

// GET ===========================================
function hg(host, hgId) {
    return Api().get(`hg/${host}/${hgId}`);
}
function hgList(host) {
    return Api().get(`hg/${host}`);
}
function hgFCheck(host, hgId) {
    return Api().get(`hg/foreman/check/${host}/${hgId}`);
}
function hgFGet(host, hgId) {
    return Api().get(`hg/foreman/get/${host}/${hgId}`);
}
function hgFUpdate(host, hgId) {
    return Api().get(`hg/foreman/update/${host}/${hgId}`);
}
// POST ===========================================
function hgCheck(data) {
    return Api().post("/hg/check", data)
}
function hgSend(data) {
    return Api().post("/hg/upload", data)
}
function hgUpdate(data) {
    return Api().post("/hg/update", data)
}
