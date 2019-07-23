import Api from "./Api";

export const locationsService = {
    List,
    Overrides,
    Update,
    Submit,
};

// GET ===========================================
function List() {
    return Api().get(`loc`);
}

function Overrides(locName, host) {
    return Api().get(`loc/overrides/${host}/${locName}`);
}

// POST ===========================================
function Update(host) {
    return Api().post(`loc/${host}`);
}

function Submit(data) {
    return Api().post("loc/submit", data);
}