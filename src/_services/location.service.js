import Api from "./Api";

export const locationsService = {
    locList,
};

// GET ===========================================
function locList() {
    return Api().get(`loc`);
}