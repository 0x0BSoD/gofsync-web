import Api from "./Api";

export const SmartClassesService = {
    getById,
};

// GET ===========================================
function getById(id) {
    return Api().get(`sc/${id}`);
}
