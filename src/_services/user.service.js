// import config from 'config';
import Api from "./Api";
// import { authHeader } from '../_helpers';

export const userService = {
    login,
    refreshjwt
};

function login(username, password, remember_me) {

    const data = {
        "username": username,
        "password": password,
        "remember_me": remember_me
    };

    return Api().post("signin", data);
}

function refreshjwt() {
    return Api().post("refreshjwt")
}
