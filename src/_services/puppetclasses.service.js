import Api from "./Api";

export const pcService = {
    allPC,
};

// GET ===========================================
function allPC() {
    return Api().get("pc");
}