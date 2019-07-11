import Api from "./Api";

export const environmentService = {
    List,
    Check,
    Update,
    ForemanID,
    SVNInfo,
};

// GET ===========================================
function List(host) {
    if (!host) {
        return Api().get("env");
    } else {
        return Api().get(`env/${host}`);
    }
}

function SVNInfo(host, name) {
    return Api().get(`env/svn/info/${host}/${name}`);
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