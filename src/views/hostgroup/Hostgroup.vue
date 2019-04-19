<template>
    <v-container>
        <v-alert
                v-model="hgError"
                dismissible
                type="error"
        >
            {{hgErrorMsg}}
        </v-alert>
        <v-alert
                v-model="hgDone"
                dismissible
                type="success"
        >
            {{hgDoneMsg}}
        </v-alert>
        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
        <v-layout wrap row>
            <v-flex xs6>
                <v-layout wrap row>
                    <v-flex xs6 pr-5>
                        <v-autocomplete
                                v-model="sHost"
                                :items="hosts"
                                label="Source Host"
                                persistent-hint
                        >
                        </v-autocomplete>
                    </v-flex>
                    <v-flex xs6  pr-5>
                        <v-autocomplete
                                v-model="env"
                                :items="Environments"
                                label="Environment"
                                persistent-hint
                                :disabled="!sHost"
                        >
                        </v-autocomplete>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex xs6>
                <v-layout wrap row>
                    <v-flex xs5 pr-5>
                        <v-autocomplete
                                v-model="hostGroupId"
                                :items="hostGroups"
                                label="Host Group"
                                persistent-hint
                                item-text="name"
                                item-value="id"
                                :disabled="!sHost"
                        >
                            <template slot="item" slot-scope="data">
                                <v-list-tile-content>
                                    <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                                </v-list-tile-content>
                            </template>
                        </v-autocomplete>
                    </v-flex>
                    <v-flex xs6 pr-5>
                        <v-autocomplete
                                v-model="tHost"
                                :items="hosts"
                                label="Target Host"
                                persistent-hint
                                :disabled="!sHost"
                        >
                        </v-autocomplete>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>

        <Locations v-if="!sHost" :locations="locations"/>

        <v-layout row wrap v-if="hostGroup">

            <v-flex xs12 pb-2>
                <v-card>
                    <v-layout>
                        <v-flex xs6>
                            <v-card-text>
                                <v-layout>
                                    <v-flex xs6>
                                        <p><v-label>Name: </v-label><v-chip label>{{hostGroup.name}}</v-chip></p>
                                        <v-label>Environment: </v-label><v-chip label>{{hostGroup.environment}}</v-chip>
                                    </v-flex>
                                    <v-flex xs6>
                                        <p><v-label>Puppet Classes: </v-label><v-chip label>{{pc_count}}</v-chip></p>
                                        <p><v-label>Overrides: </v-label><v-chip label>{{ovr_count}}</v-chip></p>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-flex>
                        <v-flex xs6 v-if="existData" pt-3>
                            <v-layout row wrap>

                                <v-flex xs12 v-if="foremanCheckHG">
                                    <v-layout row wrap class="text-xs-center">
                                        <v-flex xs12>
                                            <v-chip color="yellow">
                                                <h3>Host Group exist on host</h3>
                                            </v-chip>
                                            <p v-if="!hgExist"><v-label>not exist in local DB</v-label></p>
                                            <p></p>
                                                <v-tooltip bottom v-if="hostGroupId">
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn @click="updateSourceHG()" color="primary" :disabled="wip" v-on="on">Update source</v-btn>
                                                    </template>
                                                    <span>Load data from source host (about 5 minutes)</span>
                                                </v-tooltip>
                                            <v-tooltip bottom>
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn @click="updateTargetHG()" color="secondary" :disabled="wip" v-on="on">Update target</v-btn>
                                                    </template>
                                                    <span>Load data from target host (about 5 minutes)</span>
                                            </v-tooltip>
                                            <v-btn v-if="hgExist" :disabled="wip" @click="submit()">LOAD TO TARGET<v-icon right dark>cloud_upload</v-icon></v-btn>

                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <v-btn v-if="link" icon flat><a target="_blank" v-on="on" :rel="hostGroup.name" :href="link"><v-icon>link</v-icon></a></v-btn>
                                                </template>
                                                <span>HostGroup link</span>
                                            </v-tooltip>
                                        </v-flex>
                                    </v-layout>
                                </v-flex>

                                <v-flex xs12 v-else>
                                    <v-layout row wrap class="text-xs-center">
                                        <v-flex xs12>
                                            <v-chip color="green" ><h3 >Host Group not exist on host</h3></v-chip>
                                            <v-chip color="yellow" v-if="!envExist" ><h3 >Environment not exist on host</h3></v-chip>
                                            <p><v-btn v-if="!foremanCheckHG && envExist" :disabled="wip" @click="submit()">LOAD TO TARGET<v-icon right dark>expand_less</v-icon></v-btn></p>
                                        </v-flex>
                                    </v-layout>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                        <v-flex xs6 v-else pt-3  class="text-xs-center">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn @click="updateSourceHG()" color="primary" :disabled="wip" v-on="on">Update source</v-btn>
                                </template>
                                <span>Load data from source host (about 5 minutes)</span>
                            </v-tooltip>
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-flex>

        </v-layout>

        <v-card v-if="sourceDiff && targetDiff">
            <v-card-text>
                <v-layout row wrap class="text-xs-center">
                    <v-flex xs6>
                        <h3>Not in source</h3>
                        <h3 v-if="puppetClassesMissingSource">Puppet Classes</h3>
                        <p v-if="puppetClassesMissingSource">{{puppetClassesMissingSource}}</p>
                        <h3 v-if="smartClassesMissingSource">Smart Class</h3>
                        <p v-if="smartClassesMissingSource">{{smartClassesMissingSource}}</p>
                        <h3 v-if="smartClassesParameterMissingSource">Smart Class parameters</h3>
                        <p v-if="smartClassesParameterMissingSource">{{smartClassesParameterMissingSource}}</p>
                        <h3 v-if="overridesMissingSource">Overrides</h3>
                        <p v-if="overridesMissingSource">{{overridesMissingSource}}</p>
                    </v-flex>
                    <v-flex xs6>
                        <h3>Not in target</h3>
                        <h3 v-if="puppetClassesMissing">Puppet Classes</h3>
                        <p v-if="puppetClassesMissing">{{puppetClassesMissing}}</p>
                        <h3 v-if="smartClassesMissing">Smart Class</h3>
                        <p v-if="smartClassesMissing">{{smartClassesMissing}}</p>
                        <h3 v-if="smartClassesParameterMissing">Smart Class parameters</h3>
                        <p v-if="smartClassesParameterMissing">{{smartClassesParameterMissing}}</p>
                        <h3 v-if="overridesMissing">Overrides</h3>
                        <p v-if="overridesMissing">{{overridesMissing}}</p>
                    </v-flex>
                    <v-flex xs12>
                        <h3 v-if="overridesMismatch">Overrides mismatch</h3>
                        <p v-if="overridesMismatch">{{overridesMismatch}}</p>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-card v-else-if="sourceDiff || targetDiff">
            <v-card-text>
                <v-layout row wrap  class="text-xs-center">
                    <v-flex xs12 v-if="sourceDiff">
                        <h3>Not in source</h3>
                        <h3 v-if="puppetClassesMissingSource">Puppet Classes</h3>
                        <p v-if="puppetClassesMissingSource">{{puppetClassesMissingSource}}</p>
                        <h3 v-if="smartClassesMissingSource">Smart Class</h3>
                        <p v-if="smartClassesMissingSource">{{smartClassesMissingSource}}</p>
                        <h3 v-if="smartClassesParameterMissingSource">Smart Class parameters</h3>
                        <p v-if="smartClassesParameterMissingSource">{{smartClassesParameterMissingSource}}</p>
                        <h3 v-if="overridesMissingSource">Overrides</h3>
                        <p v-if="overridesMissingSource">{{overridesMissingSource}}</p>
                    </v-flex>
                    <v-flex xs12 v-if="targetDiff">
                        <h3>Not in target</h3>
                        <h3 v-if="puppetClassesMissing">Puppet Classes</h3>
                        <p v-if="puppetClassesMissing">{{puppetClassesMissing}}</p>
                        <h3 v-if="smartClassesMissing">Smart Class</h3>
                        <p v-if="smartClassesMissing">{{smartClassesMissing}}</p>
                        <h3 v-if="smartClassesParameterMissing">Smart Class parameters</h3>
                        <p v-if="smartClassesParameterMissing">{{smartClassesParameterMissing}}</p>
                        <h3 v-if="overridesMissing">Overrides</h3>
                        <p v-if="overridesMissing">{{overridesMissing}}</p>
                    </v-flex>
                    <v-flex xs12>
                        <h3 v-if="overridesMismatch">Overrides mismatch</h3>
                        <p v-if="overridesMismatch">{{overridesMismatch}}</p>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>

        <v-layout v-if="sourceLoaded" row>
            <v-flex xs12 class="text-xs-center">
                <v-btn v-if="!showPC" @click="showPC = !showPC"  round color="primary" dark>Show puppet classes
                    <v-icon right dark>expand_more</v-icon></v-btn>
                <v-btn v-else @click="showPC = !showPC" round color="primary" dark>Hide puppet classes
                    <v-icon right dark>expand_less</v-icon></v-btn>
            </v-flex>
        </v-layout>


            <v-layout row wrap v-if="!sourceLoaded && !targetLoaded">
                <v-flex xs12>
                    <v-btn
                            v-for="(val, i) in hostGroups"
                            :key="i"
                            @click="setHG(val.id)"
                    >{{val.name}}</v-btn>
                </v-flex>
            </v-layout>

        <div v-if="showPC">
            <v-layout row wrap v-if="sourceLoaded && !targetLoaded">
                <v-flex xs12 class="text-xs-center"><h3>SOURCE</h3></v-flex>
                <v-flex xs12>
                    <HGInfo :puppetClasses="pc"/>
                </v-flex>
            </v-layout>
            <!-- ================================= If Target loaded ================================= -->
            <v-layout row wrap v-if="sourceLoaded && targetLoaded">
                <v-flex xs6>
                    <v-flex xs12 class="text-xs-center"><h3>SOURCE</h3></v-flex>
                    <HGInfo :puppetClasses="pc"/>
                </v-flex>
                <v-flex xs6>
                    <v-flex xs12 class="text-xs-center"><h3>TARGET</h3></v-flex>
                    <HGInfo :puppetClasses="targPc"/>
                </v-flex>
            </v-layout>
        </div>

    </v-container>
</template>

<script>
    import { hostGroupService, environmentService,
              hostService, locationsService, userService } from "../../_services"
    import Locations from "../../components/hostgroups/locations";
    import HGInfo from "../../components/hostgroups/hgInfo";
    import { PuppetMethods } from "./methods"

    export default {
        components: {
            Locations,
            HGInfo
        },

        data: () => ({
            hosts: [],
            hostGroups: [],
            targetHostGroup: [],
            hostGroupsFull: [],
            sHost: null,
            tHost: null,
            hostGroupId: null,
            hostGroup: null,
            hgError: null,
            hgErrorMsg: null,
            hgDone: null,
            hgDoneMsg: null,
            existData: null,
            hgExist: null,
            envExist: null,
            wip: false,
            pc_count: 0,
            ovr_count: 0,
            Environments: ["any"],
            env: "any",
            pc: {},
            targetLoaded: false,
            sourceLoaded: false,
            foremanCheckHG: false,
            locations: [],
            loggedIn: false,
            userData: {
                CN: [],
                DC: [],
                OU: []
            },
            username: null,
            userGroups: null,
            btn_logout: false,
            updateDB: false,
            link: false,
            showPC: false,
            sourceDiff: false,
            targetDiff: false,
            puppetClassesMissing: false,
            smartClassesMissing: false,
            smartClassesParameterMissing: false,
            overridesMissing: false,
            overridesMismatch: false,
            puppetClassesMissingSource: false,
            smartClassesMissingSource: false,
            smartClassesParameterMissingSource: false,
            overridesMissingSource: false,
            overridesMismatchSource: false,
        }),

        async mounted () {
            try {
                this.wip = true;
                this.hosts = (await hostService.hosts()).data;
                this.locations =  (await locationsService.locList()).data;
                this.wip = false;
            } catch (e) {
                this.wip = false;
                this.hgError = true;
                this.hgErrorMsg = "Backend not reachable or in errored state"
            }

            const loggedIn = localStorage.getItem('userData');
            const token    = this.$cookies.isKey("token");

            if (token && !!loggedIn) {
                this.btn_logout = true;
                this.loggedIn = true;
                this.userData = JSON.parse(loggedIn);
                this.username = this.userData.CN[0];
                this.userGroups = this.userData.OU.join("|");
                this.$store.dispatch("setUsername", this.username);
                try {
                    await userService.refreshjwt();
                } catch (e) {
                    console.log("token is ok");
                }
            }
            else {
                this.$router.push({name: "login"});
            }
        },

        watch: {
            sHost: {
                async handler (val) {

                    this.tHost = null;
                    this.existData = null;
                    this.hgExist = null;
                    this.envExist = null;
                    this.hostGroup = null;
                    this.env = "any";
                    this.pc = {};
                    this.targPc = {};
                    this.targetLoaded = false;
                    this.sourceLoaded = false;

                    this.hostGroups = (await hostGroupService.hgList(val)).data;
                    this.hostGroupsFull = (await hostGroupService.hgList(val)).data;
                    let tmpEnv = (await environmentService.envList(val)).data;

                    let reg = new RegExp('[0-9]');
                    let result = [];
                    for (let env in tmpEnv) {
                        if (tmpEnv.hasOwnProperty(env)) {
                            if (reg.test(tmpEnv[env])) {
                                let uEnvId = tmpEnv[env].slice(3,6);
                                if (result.indexOf(uEnvId) === -1) {
                                    result.push(uEnvId)
                                }
                            }
                        }
                    }
                    this.Environments = result;
                    this.Environments.push("any");
                }
            },
            env: {
                async handler (val) {
                    this.tHost = null;
                    this.existData = null;
                    this.hgExist = null;
                    this.envExist = null;
                    this.hostGroup = null;
                    this.pc = {};
                    this.targPc = {};
                    this.targetLoaded = false;
                    this.sourceLoaded = false;

                    if (val === 'any') {
                        this.hostGroups = this.hostGroupsFull;
                    } else {
                        let parsedHG = [];
                        for (let i in this.hostGroupsFull) {
                            if (this.hostGroupsFull[i].name.includes(val)) {
                                parsedHG.push(this.hostGroupsFull[i]);
                            }
                        }
                        this.hostGroups = parsedHG;
                    }
                }
            },
            hostGroupId: {
                async handler (val) {
                    if (val) {
                        this.wip = true;
                        let old_th = this.tHost;
                        try {

                            this.tHost = null;
                            this.existData = null;
                            this.hgExist = null;
                            this.envExist = null;

                            this.hostGroup = (await hostGroupService.hg(this.sHost, val)).data;
                            this.pc = {};
                        } catch (e) {
                            console.error(e);
                            this.wip = false;
                            if (e.message.includes("404")) {
                                this.hgError = true;
                                this.hgErrorMsg = `Host group ${val} not fond on ${this.sHost}`;
                            }
                        }
                        let pcData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                        this.pc_count = pcData.PuppetClassesCount;
                        this.ovr_count = pcData.PuppetClassesOverrides;
                        this.pc = pcData.PuppetClasses;

                        this.tHost = old_th;
                        this.sourceLoaded = true;
                        this.wip = false;
                    }
                }
            },
            tHost: {
                async handler (val) {
                    if (val) {
                        this.wip = true;
                        this.targetHostGroup = [];
                        this.targetLoaded = false;

                        resetMismatch(this);

                        let hgData = {
                            source_host: this.sHost,
                            target_host: val,
                            source_hg_id: this.hostGroupId
                        };

                        let envData = {
                            host: val,
                            env: this.hostGroup.environment
                        };

                        this.envExist = (await environmentService.envCheck(envData)).data !== -1;

                        this.hgExist = (await hostGroupService.hgCheck(hgData)).data;
                        let fchg = (await hostGroupService.hgFCheck(this.tHost, this.hostGroup.name)).data;
                        this.foremanCheckHG = fchg.error != "not found";

                        if (this.foremanCheckHG) {
                            let targetId = null;
                            let targetHgs = (await hostGroupService.hgList(this.tHost)).data;
                            for (let i in targetHgs) {
                                if (targetHgs.hasOwnProperty(i)) {
                                    if (targetHgs[i].name === this.hostGroup.name) targetId = targetHgs[i].id;
                                }
                            }
                            this.targetHostGroup = (await hostGroupService.hg(this.tHost, targetId)).data;
                            // fill puppet classes info
                            let pcData = PuppetMethods.parse(this.targetHostGroup.puppet_classes);
                            this.targPc = pcData.PuppetClasses;
                            this.targetLoaded = true;
                            setMismatch(this);
                        }


                        this.wip = false;
                        this.existData = true;
                    }
                }
            }
        },
        methods: {
            async updateSourceHG () {
                this.wip = true;
                let old_th = this.tHost;

                try {
                    await hostGroupService.hgFUpdate(this.sHost, this.hostGroup.name);
                    this.tHost = null;
                    this.existData = null;
                    this.hgExist = null;
                    this.envExist = null;

                    this.hostGroup = (await hostGroupService.hg(this.sHost, this.hostGroupId)).data;
                    this.pc = {};
                    if ( this.hostGroup.status === 200) {
                        this.hgDone = true;
                        this.hgDoneMsg = `HostGroup ${this.hostGroup.name} data updated`;
                    }
                } catch (e) {
                    console.error(e);
                    this.wip = false;
                    if (e.message.includes("404")) {
                        this.hgError = true;
                        this.hgErrorMsg = `Host group ${val} not fond on spb01-puppet`;
                    }
                }

                let pcData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                this.pc_count = pcData.PuppetClassesCount;
                this.ovr_count = pcData.PuppetClassesOverrides;
                this.pc = pcData.PuppetClasses;

                this.tHost = old_th;
                this.sourceLoaded = true;
                this.wip = false;
            },

            async updateTargetHG () {
                this.wip = true;
                try {
                    await hostGroupService.hgFUpdate(this.tHost, this.hostGroup.name);

                    let targetId = null;
                    let targetHgs = (await hostGroupService.hgList(this.tHost)).data;
                    for (let i in targetHgs) {
                        if (targetHgs.hasOwnProperty(i)) {
                            if (targetHgs[i].name === this.hostGroup.name) targetId = targetHgs[i].id;
                        }
                    }
                    this.targetHostGroup = (await hostGroupService.hg(this.tHost, targetId)).data;
                    let name = this.hostGroup.name.replace(/\./g, "-");
                    this.link = `https://${this.tHost}/hostgroups/${this.targetHostGroup.foreman_id}-SWE-${name}/edit`;
                } catch (e) {
                    this.wip = false;
                    console.log(e);
                    if (e.message.includes("404")) {
                        this.hgError = true;
                        this.hgErrorMsg = `Host group ${val} not fond on ${this.tHost}`;
                    }
                }

                // fill puppet classes info
                let pcData = PuppetMethods.parse(this.targetHostGroup.puppet_classes);
                this.targPc = pcData.PuppetClasses;


                // Build POST parameters
                let data = {
                    source_host: this.sHost,
                    target_host: this.tHost,
                    source_hg_id: this.hostGroupId,
                    db_update: this.updateDB,
                };
                this.hgExist = (await hostGroupService.hgCheck(data)).data;
                let fchg = (await hostGroupService.hgFCheck(this.tHost, this.hostGroup.name)).data;
                this.foremanCheckHG = fchg.error != "not found";

                this.targetLoaded = true;
                this.wip = false;
            },

            setHG (hgId) {
                this.hostGroupId = hgId;
            },

            async submit () {
                this.wip = true;

                // Build POST parameters
                let data = {
                    source_host: this.sHost,
                    target_host: this.tHost,
                    source_hg_id: this.hostGroupId,
                    db_update: this.updateDB,
                };

                // Commit new data
                try {
                    let response = (await hostGroupService.hgSend(data));
                    console.log(response);
                    if (response.status === 200) {
                        this.hgDone = true;
                        this.hgDoneMsg = `HostGroup ${this.hostGroup.name} added to ${this.tHost}`;
                    }
                } catch (e) {
                    this.wip = false;
                    this.hgError = true;
                    this.hgErrorMsg = e.message;
                }

                this.hgExist = (await hostGroupService.hgCheck(data)).data;
                let fchg = (await hostGroupService.hgFCheck(this.tHost, this.hostGroup.name)).data;
                this.foremanCheckHG = fchg.error != "not found";

                this.wip = false;
            },
        }
    }

    function setMismatch(t) {
        console.log("Source => Target");
        let td = PuppetMethods.compare(t.pc, t.targPc);

        console.log("Target => Source");
        let sd = PuppetMethods.compare(t.targPc, t.pc);


        if (td.puppetClassesMissing.length > 0) t.puppetClassesMissing = td.puppetClassesMissing;
        if (td.smartClassesMissing.length > 0) t.smartClassesMissing = td.smartClassesMissing;
        if (td.smartClassesParameterMissing.length > 0) t.smartClassesParameterMissing = td.smartClassesParameterMissing;
        if (td.overridesMissing.length > 0) t.overridesMissing = td.overridesMissing;
        if (td.overridesMismatch.length > 0) t.overridesMismatch = td.overridesMismatch;

        if (sd.puppetClassesMissing.length > 0) t.puppetClassesMissingSource = sd.puppetClassesMissing;
        if (sd.smartClassesMissing.length > 0) t.smartClassesMissingSource = sd.smartClassesMissing;
        if (sd.smartClassesParameterMissing.length > 0) t.smartClassesParameterMissingSource = sd.smartClassesParameterMissing;
        if (sd.overridesMissing.length > 0) t.overridesMissingSource = sd.overridesMissing;
        if (sd.overridesMismatch.length > 0) t.overridesMismatchSource = sd.overridesMismatch;

        if (t.puppetClassesMissing         ||
            t.smartClassesMissing          ||
            t.smartClassesParameterMissing ||
            t.overridesMissing             ||
            t.overridesMismatch) t.targetDiff = true;

        if (t.puppetClassesMissingSource         ||
            t.smartClassesMissingSource          ||
            t.smartClassesParameterMissingSource ||
            t.overridesMissingSource             ||
            t.overridesMismatchSource) t.sourceDiff = true;
    }
    function resetMismatch(t) {

        t.targetDiff = false;
        t.sourceDiff = false;

        t.puppetClassesMissing = false;
        t.smartClassesMissing = false;
        t.smartClassesParameterMissing = false;
        t.overridesMissing = false;
        t.overridesMismatch = false;

        t.puppetClassesMissingSource = false;
        t.smartClassesMissingSource = false;
        t.smartClassesParameterMissingSource = false;
        t.overridesMissingSource = false;
        t.overridesMismatchSource = false;
    }


</script>

<style></style>
