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
                    <v-flex xs1 pt-2 v-if="hostGroupId">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn icon flat @click="renewSourceHG()" v-on="on"><v-icon>sync</v-icon></v-btn>
                            </template>
                            <span>Load data from target host</span>
                        </v-tooltip>

                    </v-flex>
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
                        <v-flex xs6 v-if="existData" pt-5>
                            <v-layout row wrap>
                                <v-flex xs12 class="text-xs-center" >
                                    <v-chip color="yellow" v-if="foremanCheckHG"><h3>Host Group exist on host</h3></v-chip>
                                    <!--<v-chip color="yellow" v-if="hgExist"><h3>Host Group exist in base</h3></v-chip>-->
                                    <v-chip color="green" v-else ><h3 >Host Group not exist on host</h3></v-chip>
                                    <v-chip color="yellow" v-if="!envExist" ><h3 >Environment not exist on host</h3></v-chip>
                                </v-flex>
                                <v-flex xs-12 class="text-xs-center">
                                    <v-btn v-if="!hgExist && envExist" @click="submit()">Upload</v-btn>
                                    <v-btn v-if="hgExist && envExist"  @click="update()">Update</v-btn>
                                    <v-btn v-if="!envExist" :disabled="true" @click="submit()">Create ENv</v-btn>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn v-if="hgExist && envExist && foremanCheckHG" @click="ontargetHG()" color="primary" dark v-on="on">Load Data</v-btn>
                                        </template>
                                        <span>Load data from target host</span>
                                    </v-tooltip>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                    </v-layout>
                </v-card>
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

        <v-layout row wrap v-if="sourceLoaded && !targetLoaded">
            <v-flex xs12>
                <HGInfo :puppetClasses="pc"/>
            </v-flex>
        </v-layout>
        <!-- ================================= If Target loaded ================================= -->
        <v-layout row wrap v-if="sourceLoaded && targetLoaded">
            <v-flex xs6>
                <HGInfo :puppetClasses="pc"/>
            </v-flex>
            <v-flex xs6>
                <HGInfo :puppetClasses="targPc"/>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import { hostGroupService, environmentService,
              hostService, locationsService, userService } from "../_services"
    import Locations from "@/components/locations";
    import HGInfo from "@/components/hgInfo";

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
            targPc_count: 0,
            pc_count: 0,
            ovr_count: 0,
            targOvr_count: 0,
            Environments: ["any"],
            env: "any",
            pc: {},
            targPc: {},
            targSc: {},
            sc: {},
            ovr: {},
            targOvr: {},
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
        }),

        async mounted () {
            try {
                this.hosts = (await hostService.hosts()).data;
                this.locations =  (await locationsService.locList()).data;
            } catch (e) {
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
            } else {
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
                        if (reg.test(tmpEnv[env])) {
                            let uEnvId = tmpEnv[env].slice(3,6);
                            if (result.indexOf(uEnvId) === -1) {
                                result.push(uEnvId)
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

                    let parsedHG = [];
                    for (let i in this.hostGroupsFull) {
                        if (this.hostGroupsFull[i].name.includes(val)) {
                            parsedHG.push(this.hostGroupsFull[i]);
                        }
                    }
                    this.hostGroups = parsedHG;
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
                            if (e.message.includes("404")) {
                                this.hgError = true;
                                this.hgErrorMsg = `Host group ${val} not fond on ${this.sHost}`;
                            }
                        }
                        let pc = this.hostGroup.puppet_classes;

                        this.pc_count = 0;
                        this.ovr_count = 0;
                        for (let i in pc) {
                            this.pc_count++;
                            this.pc[i] = [];

                            for (let j in pc[i]) {
                                let tmp = {};
                                let param_count = 0;
                                let ovr_curr_count = 0;

                                tmp["subclass"] = pc[i][j]["subclass"];

                                if ("smart_classes" in pc[i][j]) {
                                    let sc = pc[i][j]["smart_classes"];
                                    for (let l in sc) {
                                        param_count++;
                                        this.sc[l]= sc;
                                    }
                                    tmp["param_count"] = param_count;
                                    tmp["smart_classes"] = sc;
                                }

                                if ("overrides" in pc[i][j]) {
                                    let ovr = pc[i][j]["overrides"];
                                    for (let t in ovr) {
                                        this.ovr_count++;
                                        ovr_curr_count++;
                                        this.ovr[t]= ovr;
                                    }
                                    tmp["ovr_count"] = ovr_curr_count;
                                    tmp["overrides"] = ovr;
                                }

                                this.pc[i].push(tmp);
                            }
                        }

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

                        let hgData = {
                            source_host: this.sHost,
                            target_host: val,
                            source_hg_id: this.hostGroupId
                        };
                        let envData = {
                            host: val,
                            env: this.hostGroup.environment
                        };
                        this.hgExist = (await hostGroupService.hgCheck(hgData)).data;
                        this.envExist = (await environmentService.envCheck(envData)).data !== -1;
                        let fchg = (await hostGroupService.hgFCheck(this.tHost, this.hostGroup.name)).data;
                        if (fchg.error !== "not found") {
                            this.foremanCheckHG = true;
                        }

                        this.wip = false;
                        this.existData = true;
                    }
                }
            }
        },
        methods: {
            async renewSourceHG () {
                this.wip = true;
                let old_th = this.tHost;
                try {
                    let res = await hostGroupService.hgFUpdate(this.sHost, this.hostGroup.name);
                    console.log(res);

                    this.tHost = null;
                    this.existData = null;
                    this.hgExist = null;
                    this.envExist = null;

                    this.hostGroup = (await hostGroupService.hg(this.sHost, this.hostGroupId)).data;
                    this.pc = {};
                } catch (e) {
                    console.error(e);
                    if (e.message.includes("404")) {
                        this.hgError = true;
                        this.hgErrorMsg = `Host group ${val} not fond on spb01-puppet`;
                    }
                }
                let pc = this.hostGroup.puppet_classes;

                this.pc_count = 0;
                this.ovr_count = 0;
                for (let i in pc) {
                    this.pc_count++;
                    this.pc[i] = [];

                    for (let j in pc[i]) {
                        let tmp = {};
                        let param_count = 0;
                        let ovr_curr_count = 0;

                        tmp["subclass"] = pc[i][j]["subclass"];

                        if ("smart_classes" in pc[i][j]) {
                            let sc = pc[i][j]["smart_classes"];
                            for (let l in sc) {
                                param_count++;
                                this.sc[l]= sc;
                            }
                            tmp["param_count"] = param_count;
                            tmp["smart_classes"] = sc;
                        }

                        if ("overrides" in pc[i][j]) {
                            let ovr = pc[i][j]["overrides"];
                            for (let t in ovr) {
                                this.ovr_count++;
                                ovr_curr_count++;
                                this.ovr[t]= ovr;
                            }
                            tmp["ovr_count"] = ovr_curr_count;
                            tmp["overrides"] = ovr;
                        }
                        this.pc[i].push(tmp);
                    }
                }

                this.tHost = old_th;
                this.sourceLoaded = true;
                this.wip = false;
            },

            async ontargetHG () {
                this.wip = true;

                // get host group info from target foreman
                try {
                    this.targetHostGroup = (await hostGroupService.hgFGet(this.tHost, this.hostGroup.name)).data;
                } catch (e) {
                    if (e.message.includes("404")) {
                        this.hgError = true;
                        this.hgErrorMsg = `Host group ${val} not fond on ${this.tHost}`;
                    }
                }

                // fill puppet classes info
                let pc = this.targetHostGroup.puppet_classes;
                this.targPc_count = 0;
                this.targOvr_count = 0;

                for (let i in pc) {
                    if (pc.hasOwnProperty(i)) {
                        this.targPc_count++;
                        this.targPc[i] = [];

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
                                            this.targSc[l]= sc;
                                        }
                                    }
                                    tmp["param_count"] = param_count;
                                    tmp["smart_classes"] = sc;
                                }

                                if ("overrides" in pc[i][j]) {
                                    let ovr = pc[i][j]["overrides"];
                                    for (let t in ovr) {
                                        if (ovr.hasOwnProperty(t)) {
                                            this.targOvr_count++;
                                            ovr_curr_count++;
                                            this.targOvr[t]= ovr;
                                        }
                                    }
                                    tmp["ovr_count"] = ovr_curr_count;
                                    tmp["overrides"] = ovr;
                                }

                                this.targPc[i].push(tmp);
                            }
                        }
                    }
                }

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
                    source_hg_id: this.hostGroupId
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
                    this.hgError = true;
                    this.hgErrorMsg = e.message;
                }

                this.wip = false;
            },

            async update () {
                this.wip = true;

                // Get Host Group ID for target host
                let targetId = null;
                let targetHgs = (await hostGroupService.hgList(this.tHost)).data;
                for (let i in targetHgs) {
                    if (targetHgs.hasOwnProperty(i)) {
                        if (targetHgs[i].name === this.hostGroup.name) targetId = targetHgs[i].id;
                    }
                }

                // Build POST parameters
                let data = {
                    source_host: this.sHost,
                    target_host: this.tHost,
                    source_hg_id: this.hostGroupId,
                    target_hg_id: targetId
                };

                // Commit new data
                try {
                    let response = (await hostGroupService.hgUpdate(data));
                    console.log(response);
                    if (response.status === 200) {
                        this.hgDone = true;
                        this.hgDoneMsg = `HostGroup ${this.hostGroup.name} updated on ${this.tHost}`;
                    }
                } catch (e) {
                    this.hgError = true;
                    this.hgErrorMsg = e.message;
                }

                this.wip = false;
            },
            logout () {
                localStorage.clear();
                this.$cookies.remove("token");
                this.$router.push({name: "login"});
            },
        }
    }
</script>

<style>

</style>
