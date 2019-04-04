import axios from "axios";

process.env.NODE_TLS_REJECT_UNAUTORIZED = '0';

export default() => {
    return axios.create({
        baseURL: "http://sjc01-c01-pds10:8000",
        // baseURL: "http://localhost:8000",
        withCredentials: true,
    });
}
