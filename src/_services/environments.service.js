import Api from "./Api";

export const environmentService = {
    List,
    ListAll,
    Branches,
    Check,
    Update,
    ForemanID,
    Submit,
    SVNInfo,
    SVNLog,
    SVNRepo,
    SVNRepoSubmit,
    SVNRepoUpdate,
    SVNRepoCheckout,
    SVNForemanUpdate,
    SVNBatch,
    GitClone,
    GitPull,
    GitLogAll,
    GitLogEnv,
    GitLog,
};

// GET ===========================================
function GitClone(host, swe) {
    return Api().get(`env/git/clone/${host}/${swe}`);
}
function GitPull(host, swe) {
    return Api().get(`env/git/pull/${host}/${swe}`);
}
function GitLogAll(host) {
    return Api().get(`env/git/log/${host}`);
}
function GitLogEnv(host, swe, commit) {
    return Api().get(`env/git/log/${host}/${swe}`);
}
function GitLog(host, swe, commit) {
    return Api().get(`env/git/log/${host}/${swe}/${commit}`);
}
function List(host) {
        return Api().get(`env/${host}`);
}
function ListAll(git) {
    if (git) {
        return Api().get("env", {params: {git: 'true'}});
    } else {
        return Api().get("env");
    }
}
function Branches() {
    return Api().get("env/git/branches");
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
    return Api().post("env/db/check", data)
}

function SVNBatch(data) {
    return Api().post("env/svn/batch", data)
}

function Submit(data) {
    return Api().post("env", data)
}

function SVNRepoSubmit(host, url) {
    return Api().post(`env/svn/repo`, {"url": url, "host": host});
}

function SVNRepoUpdate(data) {
    return Api().post("/env/svn/update", data);
}

function SVNRepoCheckout(data) {
    return Api().post("/env/svn/checkout", data);
}

function SVNForemanUpdate(data) {
    return Api().post("/env/svn/foreman", data);
}

function ForemanID(data) {
    return Api().post("/env/foreman/check", data)
}

function Update(host) {
    return Api().post("env/db/update", {"host": host});
}