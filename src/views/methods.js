import {userService} from "../_services/user.service";

export const Common = {
    auth,
    pruneEmpty,
    inHosts,
};

function parseJwt (token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

async function auth(t) {
    const loggedIn = localStorage.getItem('userData');
    const tokenIsSet = t.$cookies.isKey("token");
    if (t.$store.state.userModule.isLogged) {
        let token = parseJwt(t.$cookies.get("token"));
        let tknDate = new Date(token.exp*1000);
        // console.log((new Date));
        // console.log(tknDate);
        // console.log(((new Date) - tknDate) > (60 * 60 * 1000));
        if (((new Date) - tknDate) > (60 * 60 * 1000)) {
            try {
                await userService.refreshjwt();
                console.info("token updated");
            } catch (e) {
            console.info(e);
            }
        }
    } else {
        if (tokenIsSet && !!loggedIn) {
            t.userData = JSON.parse(loggedIn);
            t.btn_logout = true;
            t.loggedIn = true;
            t.username = t.userData.CN[0];
            t.userGroups = t.userData.OU.join("|");
            await t.$store.dispatch("setUsername", t.username);
            await t.$store.dispatch("setLogged", true);
            t.$connect();
        } else {
            t.$router.push({name: "login"});
        }
    }
}

function pruneEmpty(obj) {
    return function prune(current) {
        _.forOwn(current, function (value, key) {
            if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
                (_.isString(value) && _.isEmpty(value)) ||
                (_.isObject(value) && _.isEmpty(prune(value)))) {

                delete current[key];
            }
        });
        if (_.isArray(current)) _.pull(current, undefined);

        return current;

    }(_.cloneDeep(obj));
}

function inHosts(hosts, s) {
    for (let i = 0; i < hosts.length; i++) {
        if (hosts[i].name === s) return true;
    }
    return false
}

