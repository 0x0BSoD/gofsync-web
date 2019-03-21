import axios from "axios";

process.env.NODE_TLS_REJECT_UNAUTORIZED = '0';

export default() => {
    return axios.create({
        baseURL: "http://localhost:8000"
    });
}