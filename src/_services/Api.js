import axios from "axios";

process.env.NODE_TLS_REJECT_UNAUTORIZED = '0';

export default() => {
    return axios.create({
        baseURL: "https://sjc01-c01-pds10.c01.ringcentral.com:8086/api/v1/",
        // baseURL: "http://localhost:8000",
        withCredentials: true,
    });
}
