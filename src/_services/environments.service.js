import Api from "./Api";

export const environmentService = {
    List,
    Check,
    Update,
};

// GET ===========================================
function List(host) {
    return Api().get(`env/${host}`);
}
// POST ===========================================
function Check(data) {
    return Api().post("env/check", data)
}
function Update(host) {
    return Api().post(`env/${host}`);
}