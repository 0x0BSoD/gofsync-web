import { userService } from "../_services"

export const Common = {
    auth,
};

async function auth(t) {
    const loggedIn = localStorage.getItem('userData');
    const token    = t.$cookies.isKey("token");

    if (token && !!loggedIn) {
        t.btn_logout = true;
        t.loggedIn = true;
        t.userData = JSON.parse(loggedIn);
        t.username = t.userData.CN[0];
        t.userGroups = t.userData.OU.join("|");
        await t.$store.dispatch("setUsername", t.username);
        try {
            await userService.refreshjwt();
        } catch (e) {
            // console.log("token is ok");
        }
    }
    else {
        t.$router.push({name: "login"});
    }
}