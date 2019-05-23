import Api from "./Api";

export const pcService = {
    allPC,
};

// GET ===========================================
function allPC(host) {
    return Api().get(`pc/${host}`);
}