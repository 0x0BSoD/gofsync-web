import Api from "@/services/Api";

export default {
    hgList (host) {
        return Api().get(`/hg/${host}`);
    },
    envList (host) {
        return Api().get(`/env/${host}`);
    },
    locList () {
        return Api().get(`/loc`);
    },
    hosts () {
        return Api().get("/hosts");
    },
    hg (host, hgId) {
        return Api().get(`/hg/${host}/${hgId}`);
    },
    hgCheck(data) {
        return Api().post("/hg/check", data)
    },
    envCheck(data) {
        return Api().post("/env/check", data)
    },
    hgSend(data) {
        return Api().post("/send/hg", data)
    },
    hgUpdate(data) {
        return Api().post("/hg/update", data)
    },
    hgFCheck (host, hgId) {
        return Api().get(`/hg/foreman/check/${host}/${hgId}`);
    },
    hgFGet (host, hgId) {
        return Api().get(`/hg/foreman/get/${host}/${hgId}`);
    },
}