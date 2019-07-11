import Api from "./Api";

export const hostService = {
    hosts,
    ClientHosts,
    ClientHostsAll,
};

// GET ===========================================
function hosts() {
    return Api().get("hosts/foreman");
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