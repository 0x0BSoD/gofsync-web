import Api from "./Api";

export const hostGroupService = {
    Get,
    List,
    FCheck,
    Update,
    FUpdate,
    Check,
    Send,
    Create,
    BatchSend,
};

// GET ===========================================
function Get(host, hgId) {
    return Api().get(`hg/${host}/${hgId}`);
}

function List(host) {
    return Api().get(`hg/${host}`);
}

function AllList() {
    return Api().get("hg");
}

function FCheck(host, hgId) {
    return Api().get(`hg/foreman/check/${host}/${hgId}`);
}

// function FGet(host, hgId) {
//     return Api().get(`hg/foreman/get/${host}/${hgId}`);
// }
function FUpdate(host, hgId) {
    return Api().get(`hg/foreman/update/${host}/${hgId}`);
}

// POST ===========================================
function Check(data) {
    return Api().post("/hg/check", data);
}

function Send(data) {
    return Api().post("/hg/upload", data);
}

function BatchSend(data) {
    return Api().post("/hg/batch/upload", data);
}

function Update(host) {
    return Api().post(`/hg/update/${host}`);
}

function Create(data, host) {
    return Api().post(`/hg/create/${host}`, data);
}