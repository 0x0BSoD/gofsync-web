import {locationsService} from "../_services";
import wss from "./wsStrings";

export const socketEvents = {
    webSocketParser,
};

// =====================================================================================================================
// MODELS
// =====================================================================================================================
function WSMessage() {
    this.action = '';
    this.message = '';
    this.user = '';
    this.currnetCount = '';
    this.totalCount = '';
}

function calcPercents(current, total) {
    let a = parseInt(current);
    let b = parseInt(total);
    return current / (total / 100);
}

async function webSocketParser(message, t) {
    let result = new WSMessage();
    if (message.hasOwnProperty("operation")) {
        switch (message.operation) {
            case "getHG":
                // result.message = wss.gettingHG();
                t.WSProgress.message = wss.gettingHG();
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
                        t.WSProgress.counter = `[${message.data.counter.current}/${message.data.counter.total}]`;
                        t.WSProgress.host    = message.data.item;
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
                t.WSProgress.message = null;
                if (t.WSProgress.hasOwnProperty("item")) {
                    t.WSProgress.item    = null;
                }
                break;
            default:
                if (t.WSProgress.hasOwnProperty("item")) {
                    t.WSProgress.item    = null;
                }
                t.WSProgress.message = null;
                console.info(message)
        }
    }
    return result;
}