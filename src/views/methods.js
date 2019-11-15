// import { userService } from "../_services"

import {locationsService} from "../_services/location.service";
import {environmentService} from "../_services/environments.service";

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
                    t.WSProgress.message = `Processing Environment data: ${message.data.item}`;
                } else {
                    t.WSProgress.message = "Getting Environment data";
                }
                break;
            // Getting/Updating Locations
            case "getLoc":
                if (message.data.hasOwnProperty("item")) {
                    t.WSProgress.message = `Processing Location data: ${message.data.item}`;
                } else {
                    t.WSProgress.message = "Getting Location data";
                }
                break;
            // Getting/Updating Smart Classes
            case "getSC":
                if (message.data.hasOwnProperty("item")) {
                    t.WSProgress.message = `Processing Smart Class: ${message.data.item}`;
                } else {
                    t.WSProgress.message = "Getting Smart Classes";
                }
                break;
            // Getting/Updating Puppet Classes
            case "getPC":
                if (message.data.hasOwnProperty("item")) {
                    if (message.data.hasOwnProperty("counter")) {
                        t.WSProgress.message = `[${message.data.counter.current}/${message.data.counter.total}] Getting: ${message.data.item}`;
                    } else {
                        t.WSProgress.message = `Processing Puppet Class: ${message.data.item}`;
                    }
                } else {
                    t.WSProgress.message = "Getting Puppet Classes";
                }
                break;
            // Getting/Updating Host Group Parameters
            case "getHGParameters":
                if (message.data.hasOwnProperty("item")) {
                    t.WSProgress.message = `Processing Host Group parameter: ${message.data.item}`;
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
                    t.WSProgress.message = `Processing Host Group override: ${message.data.item}`;
                } else {
                    t.WSProgress.message = "Getting Host Group overrides";
                }
                break;
            // Submitting Smart Class Overrides
            case "submitHGOverrides":
                if (message.data.hasOwnProperty("item")) {
                    if (message.data.hasOwnProperty("counter")) {
                        t.WSProgress.message = `[${message.data.counter.current}/${message.data.counter.total}] Submitting: ${message.data.item}`;
                    } else {
                        t.WSProgress.message = `Submitting Host Group override: ${message.data.item}`;
                    }
                } else {
                    t.WSProgress.message = "Submitting Host Group overrides";
                }
                break;
            // Working with Host Group in batch mode
            // Updating Host Group
            case "batchUpdateSource":
                t.WSProgress.message = "Updating Source Host Group";
                if (message.data.state === "running") {
                    t.wip = true;
                    t.checkInProgress = true;
                }
                if (message.data.state === "done") {
                    t.wip = false;
                    t.checkInProgress = false;
                }
                break;
            case "batchUpdateHG":
                if (message.data.hasOwnProperty("item")) {
                    if (message.data.hasOwnProperty("counter")) {
                        t.WSProgress.message = `[${message.data.counter.current}/${message.data.counter.total}] Updating: ${message.data.item}`;
                    } else {
                        t.WSProgress.item = message.data.item;
                        t.WSProgress.message = `Updating: ${message.data.item}`;
                    }
                } else {
                    t.WSProgress.message = "Updating Host Groups";
                }
                break;
            case "batchHostGroupSaving":
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
                t.wip = true;
                t.locations = (await locationsService.List()).data;
                t.wip = false;
                t.$forceUpdate();
                break;
            case "done":
                if (t.hasOwnProperty("WSProgress")) {
                    t.WSProgress.message = null;
                    if (t.WSProgress.hasOwnProperty("item")) {
                        t.WSProgress.item = null;
                    }
                }
                break;
            case "svnCheck":
                let currHost = message.data.host;
                let currSwe = message.data.item;
                let currState = message.data.state;
                for ( let i in t.environments[currHost]) {
                    if (t.environments[currHost][i].name === currSwe) {
                        if (currState === "checking") {
                            t.environments[currHost][i].loading = true;
                        }
                        if (currState === "error") {
                            t.environments[currHost][i].state = "error";
                        }
                        if  (currState === "done") {
                            let postParams = {
                                "host": currHost,
                                "environment": currSwe,
                                "dry_run": false,
                            };
                            let response = (await environmentService.SVNForemanUpdate(postParams)).data;
                            let jsData = JSON.parse(response);
                            t.environments[currHost][i].loading = false;
                            console.log(jsData);
                        }
                    }
                }
                break;
            default:
                if (t.hasOwnProperty("WSProgress")) {
                    if (t.WSProgress.hasOwnProperty("item")) {
                        t.WSProgress.item    = null;
                    }
                    t.WSProgress.message = null;
                }

                console.info(message)
        }
    }
}

function sortEnv(envs) {

}