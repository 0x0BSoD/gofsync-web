import Api from "./Api";

export const environmentService = {
    List,
    ListAll,
    Check,
    Update,
    ForemanID,
    // Submit,
    SVNInfo,
    SVNLog,
    SVNRepo,
    SVNRepoSubmit,
    SVNRepoUpdate,
    SVNRepoCheckout,
};

// GET ===========================================
function List(host) {
        return Api().get(`env/${host}`);
}
function ListAll() {
    return Api().get("env");
}
function SVNInfo(host, name) {
    return Api().get(`env/svn/info/${host}/${name}`);
}
function SVNLog(host, name) {
    return Api().get(`env/svn/log/${host}/${name}`);
}
function SVNRepo(host) {
    return Api().get(`env/svn/repo/${host}`);
}
// POST ===========================================
function Check(data) {
    return Api().post("env/check", data)
}

// function Submit(data) {
//     return Api().post("env/submit", data)
// }

function SVNRepoSubmit(host, url) {
    return Api().post(`env/svn/repo/${host}`, {"url": url});
}

function SVNRepoUpdate(data) {
    return Api().post("/env/svn/update", data);
}

function SVNRepoCheckout(data) {
    return Api().post("/env/svn/checkout", data);
}

function ForemanID(data) {
    return Api().post("/env/check/foreman", data)
}

function Update(host) {
    return Api().post(`env/${host}`);
}