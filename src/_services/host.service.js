import Api from "./Api";

export const hostService = {
    Info,
    hosts,
    ClientHosts,
    ClientHostsAll,
    Statistic,
};

// GET ===========================================
function hosts() {
    return Api().get("hosts/foreman");
}

function Statistic(host) {
    return Api().get(`hosts/trend/${host}`);
}

function Info(host) {
    return Api().get(`/info/${host}`);
}

function ClientHostsAll(hgName, changed) {
    if (!changed) {
        return Api().get(`/hosts/all/hg/${hgName}?hostnames`);
    } else {
        return Api().get(`/hosts/all/hg/${hgName}?hostnames&changed=${changed}`);
    }
}

function ClientHosts(host, hgForemanId, changed) {
    if (!changed) {
        return Api().get(`/hosts/${host}/hg/${hgForemanId}?hostnames`);
    } else {
        return Api().get(`/hosts/${host}/hg/${hgForemanId}?hostnames&changed=${changed}`);
    }
}