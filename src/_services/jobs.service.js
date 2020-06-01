import Api from "./Api";

export const jobsService = {
    GetAll,
    Add,
    Start,
};

// GET ===========================================
function GetAll() {
    return Api().get("jobs");
}

function Start(job_id) {
    return Api().get(`job/${job_id}/start`);
}

// POST ===========================================
function Add(data) {
    return Api().post("job", data);
}
