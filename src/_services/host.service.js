import Api from "./Api";

export const hostService = {
    hosts,
};

// GET ===========================================
function hosts() {
    return Api().get(`hosts`);
}