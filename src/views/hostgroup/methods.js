
export const PuppetMethods = {
    parse,
    compare,
};

function parse(pc) {

    let result = {
        PuppetClasses: {},
        PuppetClassesCount: 0,
        PuppetClassesOverrides: 0,
    };

    let pcRes = {};
    let pcCount = 0;
    let ovrCount = 0;

    for (let i in pc) {
        if (pc.hasOwnProperty(i)) {
            pcCount++;
            pcRes[i] = [];

            for (let j in pc[i]) {
                if (pc[i].hasOwnProperty(j)) {
                    let tmp = {};
                    let param_count = 0;
                    let ovr_curr_count = 0;

                    tmp["subclass"] = pc[i][j]["subclass"];

                    if ("smart_classes" in pc[i][j]) {
                        let sc = pc[i][j]["smart_classes"];
                        for (let l in sc) {
                            if (sc.hasOwnProperty(l)) {
                                param_count++;
                            }
                        }
                        tmp["param_count"] = param_count;
                        tmp["smart_classes"] = sc;
                    }

                    if ("overrides" in pc[i][j]) {
                        let ovr = pc[i][j]["overrides"];
                        for (let t in ovr) {
                            if (ovr.hasOwnProperty(t)) {
                                ovrCount++;
                                ovr_curr_count++;
                            }
                        }
                        tmp["ovr_count"] = ovr_curr_count;
                        tmp["overrides"] = ovr;
                    }

                    pcRes[i].push(tmp);
                }
            }
        }
    }

    result.PuppetClasses = pcRes;
    result.PuppetClassesCount = pcCount;
    result.PuppetClassesOverrides = ovrCount;

    return result;
}

function compare(source_pc, target_pc) {
    let result = {
        puppetClassesMissing: [],
        smartClassesMissing: [],
        smartClassesParameterMissing: [],
        overridesMissing: [],
        overridesMismatch: [],
    };

    if ( source_pc === target_pc ) return null;

    for (let idx in source_pc) {
        if (source_pc.hasOwnProperty(idx)) {
            if (target_pc.hasOwnProperty(idx)) {

                let source_smart_classes = source_pc[idx];
                let target_smart_classes = target_pc[idx];

                for (let jdx in source_smart_classes) {
                    if (source_smart_classes.hasOwnProperty(jdx)) {
                        if (target_smart_classes.hasOwnProperty(jdx)) {

                            let source_subclasses = buildSubclassObject(source_smart_classes[jdx]);
                            let target_subclasses = buildSubclassObject(target_smart_classes[jdx]);


                            for (let gdx in source_subclasses) {
                                if (target_subclasses.hasOwnProperty(gdx)) {
                                    // Smart Class parameters===================================================================
                                    if (source_subclasses[gdx].hasOwnProperty("smart_classes")) {
                                        if (target_subclasses[gdx].hasOwnProperty("smart_classes")) {

                                            for (let edx in source_subclasses[gdx]["smart_classes"]) {
                                                let parameter = source_subclasses[gdx]["smart_classes"][edx];
                                                if (target_subclasses[gdx]["smart_classes"].includes(parameter)) {
                                                } else {
                                                    let res = `${gdx}=>${parameter}`;
                                                    console.error(`We don't have the smart class parameter ${parameter} in ${gdx}`);
                                                    result.smartClassesParameterMissing.push(res);
                                                }
                                            }

                                        } else {
                                            console.error("We don't have a smart class parameters at all in ", source_smart_classes[jdx]["subclass"]);
                                            result.smartClassesParameterMissing.push(source_smart_classes[jdx]["subclass"]);
                                        }
                                    }
                                    // Parameters Overrides ====================================================================
                                    if (source_subclasses[gdx].hasOwnProperty("overrides")) {
                                        if (target_subclasses[gdx].hasOwnProperty("overrides")) {
                                            let source_ovr = source_subclasses[gdx]["overrides"];
                                            let target_ovr = target_subclasses[gdx]["overrides"];
                                            for (let kdx in source_ovr) {
                                                if (target_ovr.hasOwnProperty(kdx)) {
                                                    if (source_ovr[kdx] === target_ovr[kdx]) {

                                                    } else {
                                                        console.error(`Override parameter ${kdx} in ${gdx} mismatch`);
                                                        result.overridesMismatch.push(kdx);
                                                    }
                                                } else {
                                                    console.error(`We don't have the override parameter ${kdx} in ${gdx}`);
                                                    result.overridesMissing.push(kdx);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    console.error(`We don't have the smart class ${gdx} in ${idx}`);
                                    result.smartClassesMissing.push(gdx);
                                }

                            }
                        }
                    }
                }
            } else {
                console.error("We don't have a puppet class ", idx);
                result.puppetClassesMissing.push(idx);
            }
        }
    }
    return result;
}

function buildSubclassObject(sc) {
    let result = {};
    result[sc["subclass"]] = {};
    if (sc.hasOwnProperty("smart_classes")) {
        result[sc["subclass"]]["smart_classes"] = sc["smart_classes"];
    }
    if (sc.hasOwnProperty("overrides")) {
        result[sc["subclass"]]["overrides"] = {};
        for (let idx in sc["overrides"]) {
            result[sc["subclass"]]["overrides"][sc["overrides"][idx]["parameter"]] = sc["overrides"][idx]["value"]
        }
    }
    return result;
}