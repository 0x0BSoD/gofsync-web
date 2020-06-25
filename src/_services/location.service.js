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

function Overrides(locName, host, format) {
    console.log(format);
    switch (format) {
        case 0:
            return Api().get(`loc/overrides/${host}/${locName}?format=text`);
        case 1:
            return Api().get(`loc/overrides/${host}/${locName}?format=jira`);
        case 2:
            return Api().get(`loc/overrides/${host}/${locName}`);
        default:
            return Api().get(`loc/overrides/${host}/${locName}`);
    }

}

// POST ===========================================
function Update(host) {
    return Api().post(`loc/${host}`);
}

function Submit(data) {
    return Api().post("loc/submit", data);
}