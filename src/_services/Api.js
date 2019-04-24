import axios from "axios";

import config from "../settings";

process.env.NODE_TLS_REJECT_UNAUTORIZED = '0';

export default() => {
    return axios.create({
        baseURL: config.api(),
        withCredentials: true,
    });
}
