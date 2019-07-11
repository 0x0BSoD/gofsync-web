import Api from "./Api";

export const environmentService = {
    List,
    ListAll,
    Check,
    Update,
    ForemanID,
    SVNInfo,
};

// GET ===========================================
function List(host) {
        return Api().get(`env/${host}`);
}
function ListAll() {
    return Api().get("env");
}
function SVNInfo(host, name) {
    return Api().get(`env/svn/info/${host}/${name}`);
}
// POST ===========================================
function Check(data) {
    return Api().post("env/check", data)
}

function ForemanID(data) {
    return Api().post("/env/check/foreman", data)
}

function Update(host) {
    return Api().post(`env/${host}`);
}