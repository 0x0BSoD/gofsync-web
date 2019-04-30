import Api from "./Api";

export const locationsService = {
    locList,
    getOverrides,
};

// GET ===========================================
function locList() {
    return Api().get(`loc`);
}
function getOverrides(locName, host) {
    return Api().get(`loc/overrides/${host}/${locName}`);
}