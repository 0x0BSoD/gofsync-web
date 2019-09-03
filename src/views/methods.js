// import { userService } from "../_services"

import {locationsService} from "../_services/location.service";

export const Common = {
    auth,
    pruneEmpty,
    inHosts,
    webSocketParser,
};

async function auth(t) {
    const loggedIn = localStorage.getItem('userData');
    const token = t.$cookies.isKey("token");
    if (t.$store.state.userModule.isLogged) {
        // try {
        //     await userService.refreshjwt();
        // } catch (e) {
        // console.log("token is ok");
        // }
    } else {
        if (token && !!loggedIn) {
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

async function webSocketParser(message, t) {
    if (message.hasOwnProperty("operation")) {
        switch (message.operation) {
            case "getHG":
                t.WSProgress.message = "Getting Host Groups data";
                break;
            // Updating Host Groups in a database
            case "submitHG":
                if (message.data.hasOwnProperty("item")) {
                    if (message.data.hasOwnProperty("counter")) {
                        t.WSProgress.message = `[${message.data.counter.current}/${message.data.counter.total}] Updating: ${message.data.item}`;
                    } else {
                        t.WSProgress.message = `Updating: ${message.data.item}`;
                    }
                } else {
                    t.WSProgress.message = "Updating host groups";
                }
                break;
            // Getting/Updating Environments
            case "getEnv":
                if (message.data.hasOwnProperty("item")) {
                    t.WSProgress.message = `Getting Environment data: ${message.data.item}`;
                } else {
                    t.WSProgress.message = "Getting Environment data";
                }
                break;
            // Getting/Updating Smart Classes
            case "getSC":
                if (message.data.hasOwnProperty("item")) {
                    t.WSProgress.message = `Getting Smart Class: ${message.data.item}`;
                } else {
                    t.WSProgress.message = "Getting Smart Classes";
                }
                break;
            // Updating Host Group
            case "updateHG":
                t.WSProgress.message = "Updating Source Host Group";
                if (message.data.state === "running") {
                    t.WSUpdate = true;
                }
                if (message.data.state === "done") {
                    t.WSUpdate = false;
                }
                break;
            // Getting/Updating Puppet Classes
            case "getPC":
                if (message.data.hasOwnProperty("item")) {
                    if (message.data.hasOwnProperty("counter")) {
                        t.WSProgress.message = `[${message.data.counter.current}/${message.data.counter.total}] Getting: ${message.data.item}`;
                    } else {
                        t.WSProgress.message = `Getting Puppet Class: ${message.data.item}`;
                    }
                } else {
                    t.WSProgress.message = "Getting Puppet Classes";
                }
                break;
            // Getting/Updating Host Group Parameters
            case "getHGParameters":
                if (message.data.hasOwnProperty("item")) {
                    t.WSProgress.message = `Getting Host Group parameter: ${message.data.item}`;
                } else {
                    t.WSProgress.message = "Getting Host Group parameters";
                }
                break;
            // Getting/Updating Smart Class Overrides
            case "updatingHGOverrides":
                if (message.data.hasOwnProperty("item")) {
                    if (message.data.item.length > 20) {
                        let old = message.data.item;
                        message.data.item = old.substring(0,19) + " ...";
                    }
                    t.WSProgress.message = `Getting Host Group override: ${message.data.item}`;
                } else {
                    t.WSProgress.message = "Getting Host Group overrides";
                }
                break;
            // Working with Host Group in batch mode
            case "postHGSaving":
                t.WSProgress.message = null;

                for (let i in t.checkRes[message.data.tHost]) {
                    if (message.data.hgName === t.checkRes[message.data.tHost][i].hgName) {
                        t.checkRes[message.data.tHost][i].process.done = message.data.done;
                        t.checkRes[message.data.tHost][i].process.loadingInProgress = message.data.in_progress;
                    }
                }
                t.$forceUpdate();
                break;
            // Index page a specific message
            case "dashboardUpdate":
                this.wip = true;
                this.locations = (await locationsService.List()).data;
                this.wip = false;
                this.$forceUpdate();
                break;
            case "done":
                t.WSProgress.message = null;
                break;
            default:
                t.WSProgress.message = null;
                console.info(message)
        }
    }
}