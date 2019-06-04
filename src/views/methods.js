// import { userService } from "../_services"

export const Common = {
    auth,
    pruneEmpty,
};

async function auth(t) {
    const loggedIn = localStorage.getItem('userData');
    const token    = t.$cookies.isKey("token");

    if (token && !!loggedIn) {
        t.userData = JSON.parse(loggedIn);
        t.btn_logout = true;
        t.loggedIn = true;
        t.username = t.userData.CN[0];
        t.userGroups = t.userData.OU.join("|");
        await t.$store.dispatch("setUsername", t.username);
        // try {
        //     await userService.refreshjwt();
        // } catch (e) {
            // console.log("token is ok");
        // }
    }
    else {
        t.$router.push({name: "login"});
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