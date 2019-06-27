import Api from "./Api";

export const environmentService = {
    List,
    Check,
    Update,
    ForemanID,
};

// GET ===========================================
function List(host) {
    return Api().get(`env/${host}`);
}
// POST ===========================================
function Check(data) {
    return Api().post("env/check", data)
}
function ForemanID(data) {
    return Api().post("env/id", data)
}
function Update(host) {
    return Api().post(`env/${host}`);
}