import Api from "./Api";

export const pcService = {
    All,
    Update
};

// GET ===========================================
function All(host) {
    return Api().get(`pc/${host}`);
}

// POST ===========================================
function Update(host) {
    return Api().post(`pc/update/${host}`);
}