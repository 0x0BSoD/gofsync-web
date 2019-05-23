export const EditorMethods = {
    checkPC,
    resetPC,
    sortPC,
};

function resetPC(t) {
    for (let i in t.allPuppetClassesFull) {
        for (let k in t.allPuppetClassesFull[i]) {
            t.allPuppetClassesFull[i][k].InHostGroup = false;
        }
    }
    t.allPuppetClasses = _.clone(t.allPuppetClassesFull);
}

function checkPC(t) {
    for (let i in t.JSONObject.puppet_classes) {
        for (let j in t.JSONObject.puppet_classes[i]) {
            if (t.allPuppetClassesFull.hasOwnProperty(i)) {
                let scName = t.JSONObject.puppet_classes[i][j]["subclass"];
                for (let k in t.allPuppetClassesFull[i]) {
                    if (scName === t.allPuppetClassesFull[i][k].SubClass) {
                        t.allPuppetClassesFull[i][k].InHostGroup = true;
                    }
                }
            }
        }
    }
    t.allPuppetClasses = _.clone(t.allPuppetClassesFull);
}

function sortPC(t) {
    let pcKeys = Object.keys(t.JSONObject.puppet_classes);
    pcKeys.sort();
    let res = {};
    for (let i=0;i<pcKeys.length;i++) {
        res[pcKeys[i]] = t.JSONObject.puppet_classes[pcKeys[i]].sort( (a, b) => a.subclass.localeCompare( b.subclass ));
    }

    t.JSONObject.puppet_classes = res;
    t.allPuppetClasses = _.clone(t.allPuppetClassesFull);
}