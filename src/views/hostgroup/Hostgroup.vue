<template>
    <v-container>

        <!--    ============================================ Alerts ============================================    -->
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
        <!--    ============================================ /Alerts ============================================    -->

        <!--    ============================================ Progress ============================================    -->
        <v-layout row wrap v-if="wipMessage">
            <v-flex v-if="wip" xs9>
                <v-chip label v-if="WSProgress.message">{{WSProgress.message}}</v-chip>
            </v-flex>
            <v-flex xs3 class="pt-2">
                {{wipMessage}}
            </v-flex>
            <v-flex xs12>
                <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
            </v-flex>
        </v-layout>
        <v-layout row wrap v-else class="text-xs-center">
            <v-flex v-if="wip" xs12>
                <v-chip label v-if="WSProgress.message">{{WSProgress.message}}</v-chip>
            </v-flex>
            <v-flex xs12>
                <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
            </v-flex>
        </v-layout>
        <!--    ============================================ /Progress ============================================    -->

        <!--    ============================================ Top menu - selects =========================================    -->
        <v-layout wrap row class="text-xs-center" v-if="!wip">
            <v-flex xs12 md6>
                <v-layout wrap row>
                    <v-flex xs6 pr-2>
                        <v-autocomplete
                                v-model="sHost"
                                :items="hosts"
                                label="Source Host"
                                item-text="name"
                                item-value="name"
                                persistent-hint
                        >
                        </v-autocomplete>
                    </v-flex>
                    <v-flex xs6 pr-2>
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
            <v-flex xs12 md6>
                <v-layout wrap row>
                    <v-flex xs6 pr-2>
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
                    <v-flex xs6>
                        <v-autocomplete
                                v-model="tHost"
                                :items="hosts"
                                label="Target Host"
                                persistent-hint
                                :disabled="!sHost"
                                item-text="name"
                                item-value="name"
                        >
                        </v-autocomplete>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
        <!--    ============================================ /Top menu - selects =========================================    -->

        <!--        <Locations v-if="!sHost" :locations="locations" @envUpdated="envUpdated()" @locUpdated="locUpdated()" />-->

        <!--    ======================================== Middle menu - HG control========================================    -->
        <v-layout row wrap v-if="hostGroup.id">
            <v-flex xs12 pb-2>
                <v-card>
                    <v-layout row wrap>
                        <v-flex xs12 md6>
                            <v-card-text>
                                <v-layout>
                                    <v-flex xs12 md4>
                                        <table>
                                            <thead>
                                            <tr><th></th></tr>
                                            <tr><th></th></tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td><v-chip label>Name:</v-chip></td>
                                                <td>{{hostGroup.name}}</td>
                                            </tr>
                                            <tr>
                                                <td><v-chip label>Environment:</v-chip></td>
                                                <td>{{hostGroup.environment}}</td>
                                            </tr>
                                            <tr>
                                                <td><v-chip label>Updated:</v-chip></td>
                                                <td>{{hostGroup.updated}}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </v-flex>
                                    <v-flex xs12 md8>
                                        <table>
                                            <thead>
                                            <tr><th></th></tr>
                                            <tr><th></th></tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td><v-chip label>Puppet Classes:</v-chip></td>
                                                <td>{{pc_count}}</td>
                                            </tr>
                                            <tr>
                                                <td><v-chip label>Overrides:</v-chip></td>
                                                <td>{{ovr_count}}</td>
                                            </tr>
                                            <tr>
                                                <td><v-btn :to="{name:'jsoneditor', query: {source: sHost, hg: hostGroup.name }}">Edit</v-btn></td>
                                                <td></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-flex>
                        <v-flex xs12 md6  v-if="existData && !hgError" pt-3>
                            <v-layout row wrap>
                                <v-flex xs12 v-if="foremanCheckHG">
                                    <v-layout row wrap class="text-xs-center">
                                        <v-flex xs12>
                                            <v-chip color="yellow">
                                                <h3>Host Group exist on host</h3>
                                            </v-chip>
                                            <p v-if="!hgExist">
                                                <v-label>not exist in local DB</v-label>
                                            </p>
                                            <p></p>
                                            <v-tooltip bottom v-if="hostGroupId">
                                                <template v-slot:activator="{ on }">
                                                    <v-btn @click="updateSourceHG()" color="primary" :disabled="wip"
                                                           v-on="on">Update source
                                                    </v-btn>
                                                </template>
                                                <span>Load data from source host (about 5 minutes)</span>
                                            </v-tooltip>
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <v-btn @click="updateTargetHG()" color="secondary" :disabled="wip"
                                                           v-on="on">Update target
                                                    </v-btn>
                                                </template>
                                                <span>Load data from target host (about 5 minutes)</span>
                                            </v-tooltip>
                                            <v-btn v-if="hgExist" :disabled="wip" @click="submit()">LOAD TO TARGET
                                                <v-icon right dark>cloud_upload</v-icon>
                                            </v-btn>

                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <v-btn v-if="link" icon flat><a target="_blank" v-on="on"
                                                                                    :rel="hostGroup.name" :href="link">
                                                        <v-icon>link</v-icon>
                                                    </a></v-btn>
                                                </template>
                                                <span>HostGroup link</span>
                                            </v-tooltip>
                                        </v-flex>
                                    </v-layout>
                                </v-flex>
                                <v-flex xs12 v-else>
                                    <v-layout row wrap class="text-xs-center">
                                        <v-flex xs12>
                                            <v-chip color="warning" v-if="!envExist"><h3>Environment not exist on
                                                host</h3></v-chip>
                                            <v-chip color="green" v-else><h3>Host Group not exist on host</h3></v-chip>
                                            <p>
                                                <v-btn v-if="!foremanCheckHG && envExist" :disabled="wip"
                                                       @click="submit()">LOAD TO TARGET
                                                    <v-icon right dark>cloud_upload</v-icon>
                                                </v-btn>
                                            </p>
                                        </v-flex>
                                    </v-layout>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                        <v-flex xs12 md6 v-else pt-3 class="text-xs-center">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn @click="updateSourceHG()" color="primary" :disabled="wip" v-on="on">Update
                                        source
                                    </v-btn>
                                </template>
                                <span>Load data from source host (about 5 minutes)</span>
                            </v-tooltip>
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-flex>
        </v-layout>
        <!--    ======================================== /Middle menu - HG control========================================    -->

        <HGDiff v-if="!hgError" :sourceDiff="sourceDiff" :targetDiff="targetDiff"></HGDiff>

        <v-layout v-if="sourceLoaded  && !hgError" row>
            <v-flex xs12 class="text-xs-center">
                <v-btn v-if="!showPC" @click="showPC = !showPC" round color="primary" dark>Show puppet classes
                    <v-icon right dark>expand_more</v-icon>
                </v-btn>
                <v-btn v-else @click="showPC = !showPC" round color="primary" dark>Hide puppet classes
                    <v-icon right dark>expand_less</v-icon>
                </v-btn>
            </v-flex>
        </v-layout>

        <!--    ============================================ HostGroups ============================================    -->
        <v-layout row wrap v-if="!sourceLoaded && !targetLoaded">
            <v-flex xs12 v-if="hostGroups.length > 0">
                <v-btn-toggle v-model="toggle_status" class="mb-2">
                    <v-btn flat dark color="success">Pro</v-btn>
                    <v-btn flat dark color="primary">Dev</v-btn>
                    <v-btn flat dark color="warning">To remove</v-btn>
                    <v-btn flat>w/o state</v-btn>
                </v-btn-toggle>
                <br/>
                <div v-if="toggle_status === 0">
                    <v-btn
                            v-for="(val, i) in hostGroups"
                            :key="i"
                            v-if="val.name !== 'SWE' && val.status === 'pro'"
                            @click="setHG(val.id)">
                        {{val.name}}
                        <v-icon right v-if="val.status === 'pro'" color="success">trip_origin</v-icon>
                    </v-btn>
                </div>
                <div v-else-if="toggle_status === 1">
                    <v-btn
                            v-for="(val, i) in hostGroups"
                            :key="i"
                            v-if="val.name !== 'SWE' && val.status === 'dev'"
                            @click="setHG(val.id)">
                        {{val.name}}
                        <v-icon right v-if="val.status === 'dev'" color="primary">trip_origin</v-icon>
                    </v-btn>
                </div>
                <div v-else-if="toggle_status === 2">
                    <v-btn
                            v-for="(val, i) in hostGroups"
                            :key="i"
                            v-if="val.name !== 'SWE' && val.status === '_toremove'"
                            @click="setHG(val.id)">
                        {{val.name}}
                        <v-icon right v-if="val.status === '_toremove'" color="warning">trip_origin</v-icon>
                    </v-btn>
                </div>
                <div v-else-if="toggle_status === 3">
                    <v-btn
                            v-for="(val, i) in hostGroups"
                            :key="i"
                            v-if="val.name !== 'SWE' && val.status !== '_toremove' && val.status !== 'dev' && val.status !== 'pro'"
                            @click="setHG(val.id)">
                        {{val.name}}
                    </v-btn>
                </div>
                <div v-else>
                    <v-btn
                            v-for="(val, i) in hostGroups"
                            :key="i"
                            v-if="val.name !== 'SWE'"
                            @click="setHG(val.id)">
                        {{val.name}}
                        <v-icon right v-if="val.status === 'pro'" color="success">trip_origin</v-icon>
                        <v-icon right v-if="val.status === 'dev'" color="primary">trip_origin</v-icon>
                        <v-icon right v-if="val.status === '_toremove'" color="warning">trip_origin</v-icon>
                    </v-btn>
                </div>
            </v-flex>
        </v-layout>
        <!--    ============================================ /HostGroups ============================================    -->

        <div v-if="showPC">
            <v-layout row wrap v-if="sourceLoaded && !targetLoaded">
                <v-flex xs12 class="text-xs-center"><h3>SOURCE</h3></v-flex>
                <v-flex xs12 class="text-xs-center"><h4>Last update: {{hostGroup.updated}}</h4></v-flex>
                <v-flex xs12>
                    <HGInfo :puppetClasses="pc"/>
                </v-flex>
            </v-layout>
            <!-- ================================= If Target loaded ================================= -->
            <v-layout row wrap v-if="sourceLoaded && targetLoaded">
                <v-flex xs6>
                    <v-flex xs12 class="text-xs-center"><h3>SOURCE</h3></v-flex>
                    <v-flex xs12 class="text-xs-center"><h4>Last update: {{hostGroup.updated}}</h4></v-flex>
                    <HGInfo :puppetClasses="pc"/>
                </v-flex>
                <v-flex xs6>
                    <v-flex xs12 class="text-xs-center"><h3>TARGET</h3></v-flex>
                    <v-flex xs12 class="text-xs-center"><h4>Last update: {{targetHostGroup.updated}}</h4></v-flex>
                    <HGInfo :puppetClasses="targPc"/>
                </v-flex>
            </v-layout>
        </div>

    </v-container>
</template>

<script>
    import {environmentService, hostGroupService, hostService, locationsService} from "../../_services"
    import Locations from "../../components/hostgroups/locations"
    import HGInfo from "../../components/hostgroups/hgInfo"
    import HGDiff from "../../components/hostgroups/hgdiff"
    import {Common} from "../methods";
    import {PuppetMethods} from "./methods"
    import {mapGetters} from "vuex";

    export default {
        //========================================================================================================
        // COMPONENTS
        //========================================================================================================
        components: {
            Locations,
            HGInfo,
            HGDiff
        },

        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
        computed: {
            nowActions() {
                return this.$store.state.socketModule.socket.message;
            },
            ...mapGetters({
                host: "Host",
            }),
        },

        //========================================================================================================
        // DATA
        //========================================================================================================
        data: () => ({
            hosts: [],
            hostGroups: [],
            hostGroupsFull: [],
            hgError: null,
            hgErrorMsg: null,
            hgDone: null,
            hgDoneMsg: null,
            wip: false,
            wipMessage: false,
            Environments: ["any"],
            env: "any",
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
            showPC: false,
            // source ======
            sHost: null,
            hostGroupId: null,
            hostGroup: {
                id: null,
                foreman_id: null,
                name: null,
                environment: null,
                parent_id: null,
                puppet_classes: {},
                updated: null,
            },
            sourceLoaded: false,
            sourceDiff: false,
            pc_count: 0,
            ovr_count: 0,
            pc: {},
            // target ======
            tHost: null,
            targetHostGroup: {
                id: null,
                foreman_id: null,
                name: null,
                environment: null,
                parent_id: null,
                puppet_classes: {},
                updated: null,
            },
            existData: null,
            hgExist: null,
            envExist: null,
            targetLoaded: false,
            foremanCheckHG: false,
            link: false,
            targetDiff: false,
            toggle_status: null,
            WSProgress: {
                message: null,
            },
        }),

        //========================================================================================================
        // SOCKET
        //========================================================================================================

        //========================================================================================================
        // MOUNTED
        //========================================================================================================
        async mounted() {
            // User check ==========================================
            await Common.auth(this);
            // Load Hosts ==========================================
            try {
                this.wip = true;
                this.hosts = (await hostService.hosts()).data;
                this.locations = (await locationsService.List()).data;
                this.wip = false;
            } catch (e) {
                this.wip = false;
                this.hgError = true;
                this.hgErrorMsg = "Backend not reachable or in errored state"
                await this.$router.push({name: "error"});
            }

            if (this.$route.query.hasOwnProperty("source")
                && Common.inHosts(this.hosts, this.$route.query.source)) {
                this.sHost = this.$route.query.source;
            }

            if (this.$route.query.hasOwnProperty("env")) {
                this.env = this.$route.query.env;
            }
        },

        //========================================================================================================
        // WATCH
        //========================================================================================================
        watch: {
            nowActions: {
                async handler(val) {
                    await Common.webSocketParser(val, this);
                    // if (val.hasOwnProperty("operation")) {
                    //     this.wip = true;
                    //     switch (val.operation) {
                    //         case "getSC":
                    //             if (val.data.hasOwnProperty("item")) {
                    //                 this.WSProgress.operation = null;
                    //                 this.WSProgress.item = `Getting Smart Class: ${val.data.item}`;
                    //             } else {
                    //                 this.WSProgress.operation = "Getting Smart Classes";
                    //                 this.WSProgress.item = null;
                    //             }
                    //             break;
                    //         case "getHG":
                    //             this.WSProgress.operation = "Getting Host Group";
                    //             break;
                    //         case "getPC":
                    //             if (val.data.hasOwnProperty("item")) {
                    //                 this.WSProgress.operation = null;
                    //                 this.WSProgress.item = `Getting Puppet Class: ${val.data.item}`;
                    //             } else {
                    //                 this.WSProgress.operation = "Getting Puppet Classes";
                    //                 this.WSProgress.item = null;
                    //             }
                    //             break;
                    //         case "getHGParameters":
                    //             if (val.data.hasOwnProperty("item")) {
                    //                 this.WSProgress.operation = null;
                    //                 this.WSProgress.item = `Getting Host Group parameter: ${val.data.item}`;
                    //             } else {
                    //                 this.WSProgress.operation = "Getting Host Group parameters";
                    //                 this.WSProgress.item = null;
                    //             }
                    //             break;
                    //         case "updatingHGOverrides":
                    //             if (val.data.hasOwnProperty("item")) {
                    //                 this.WSProgress.operation = null;
                    //                 if (val.data.item.length > 20) {
                    //                     let old = val.data.item;
                    //                     val.data.item = old.substring(0,19) + " ...";
                    //                 }
                    //                 this.WSProgress.item = `Getting Host Group override: ${val.data.item}`;
                    //             } else {
                    //                 this.WSProgress.operation = "Getting Host Group overrides";
                    //                 this.WSProgress.item = null;
                    //             }
                    //             break;
                    //         case "done":
                    //             this.wip = false;
                    //             this.WSProgress.item = null;
                    //             this.WSProgress.operation = null;
                    //             break;
                    //         default:
                    //             this.WSProgress.item = null;
                    //             this.WSProgress.operation = null;
                    //             console.info(val)
                    //     }
                    // }
                }
            },
            host: {
                handler(val) {
                    this.sHost = val;
                }
            },
            socket: {
                async handler(val) {
                    console.log(val);
                }
            },
            sHost: {
                async handler(val) {
                    // RESET =================================
                    PuppetMethods.resetMismatch(this);
                    this.tHost = null;
                    this.existData = null;
                    this.hgExist = null;
                    this.envExist = null;
                    this.hostGroup = {
                        id: null,
                        foreman_id: null,
                        name: null,
                        environment: null,
                        parent_id: null,
                        puppet_classes: {},
                        updated: null,
                    };
                    this.pc = {};
                    this.targetLoaded = false;
                    this.sourceLoaded = false;

                    // Load source info =================================
                    this.hostGroups = (await hostGroupService.List(val)).data;
                    this.hostGroupsFull = (await hostGroupService.List(val)).data;

                    let tmpEnv = (await environmentService.List(val)).data;
                    let reg = new RegExp('(([0-9]).*|v.*)');
                    let result = [];
                    for (let env in tmpEnv) {
                        if (tmpEnv.hasOwnProperty(env)) {
                            if (reg.test(tmpEnv[env])) {
                                let uEnvId = tmpEnv[env].slice(3);
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
                async handler(val) {
                    // RESET =================================
                    PuppetMethods.resetMismatch(this);
                    this.tHost = null;
                    this.existData = null;
                    this.hgExist = null;
                    this.envExist = null;
                    this.hostGroup = {
                        id: null,
                        foreman_id: null,
                        name: null,
                        environment: null,
                        parent_id: null,
                        puppet_classes: {},
                        updated: null,
                    };
                    this.pc = {};
                    this.targetLoaded = false;
                    this.sourceLoaded = false;

                    // =================================
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

                    if (this.$route.query.hasOwnProperty("env")) {
                        this.$route.query.env = this.env;
                    } else {
                        await this.$router.push({
                            query: {
                                "source": this.sHost,
                                "env": this.env,
                            }
                        });
                    }


                }
            },
            hostGroupId: {
                async handler(val) {
                    if (val) {
                        this.wip = true;
                        let old_th = this.tHost;
                        try {
                            PuppetMethods.resetMismatch(this);
                            this.tHost = null;
                            this.existData = null;
                            this.hgExist = null;
                            this.envExist = null;

                            this.hostGroup = (await hostGroupService.Get(this.sHost, val)).data;
                            this.pc = {};
                        } catch (e) {
                            console.error(e);
                            this.wip = false;
                            if (e.message.includes("404")) {
                                this.hgError = true;
                                this.hgErrorMsg = `Host group ${val} not fond on ${this.sHost}`;
                            }
                        } finally {
                            let pcData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                            this.pc_count = pcData.PuppetClassesCount;
                            this.ovr_count = pcData.PuppetClassesOverrides;
                            this.pc = pcData.PuppetClasses;
                            this.tHost = old_th;
                            this.sourceLoaded = true;
                            this.wip = false;
                        }


                    }
                    // this.$router.push({
                    //     query: {
                    //         "source": this.sHost,
                    //         "env": this.env,
                    //         "hg": val,
                    //     }
                    // });
                }
            },
            tHost: {
                async handler(val) {
                    if (val) {
                        this.wip = true;
                        this.targetHostGroup = [];
                        this.targetLoaded = false;

                        PuppetMethods.resetMismatch(this);

                        let hgData = {
                            source_host: this.sHost,
                            target_host: val,
                            source_hg_id: this.hostGroupId
                        };

                        let envData = {
                            host: val,
                            env: this.hostGroup.environment
                        };

                        this.envExist = (await environmentService.Check(envData)).data !== -1;

                        this.hgExist = (await hostGroupService.Check(hgData)).data;
                        try {
                            let foremanCheck = (await hostGroupService.FCheck(this.tHost, this.hostGroup.name)).data;
                            this.foremanCheckHG = foremanCheck.id !== -1;
                        } catch (e) {
                            console.error(e);
                            this.wip = false;
                            this.hgError = true;
                            this.hgErrorMsg = `${this.tHost} not available`;
                        }


                        if (this.foremanCheckHG) {
                            let targetId = null;
                            let targetHgs = (await hostGroupService.List(this.tHost)).data;
                            for (let i in targetHgs) {
                                if (targetHgs.hasOwnProperty(i)) {
                                    if (targetHgs[i].name === this.hostGroup.name) targetId = targetHgs[i].id;
                                }
                            }

                            this.targetHostGroup = (await hostGroupService.Get(this.tHost, targetId)).data;
                            let targetPCData = PuppetMethods.parse(this.targetHostGroup.puppet_classes);
                            let sourcePCData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                            this.targPc = targetPCData.PuppetClasses;

                            this.targetLoaded = true;

                            try {
                                PuppetMethods.setMismatch(this, sourcePCData, targetPCData);
                            } catch (e) {
                                console.error(e);
                                this.wip = false;
                            }

                            let name = this.hostGroup.name.replace(/\./g, "-");
                            this.link = `https://${this.tHost}/hostgroups/${this.targetHostGroup.foreman_id}-SWE-${name}/edit`;

                        }
                        this.wip = false;
                        this.existData = true;
                    }
                }
            }
        },

        //========================================================================================================
        // METHODS
        //========================================================================================================
        methods: {
            async locUpdated() {
                this.locations = (await locationsService.List()).data;
            },
            async updateSourceHG() {
                this.wip = true;
                let old_th = this.tHost;
                try {
                    await hostGroupService.FUpdate(this.sHost, this.hostGroup.name);
                    this.tHost = null;
                    this.existData = null;
                    this.hgExist = null;
                    this.envExist = null;

                    this.hostGroup = (await hostGroupService.Get(this.sHost, this.hostGroupId)).data;
                    this.pc = {};
                    // await hostGroupService.GitCommit(this.sHost, this.hostGroupId);
                    this.hgDone = true;
                    this.hgDoneMsg = `HostGroup ${this.hostGroup.name} data updated`;
                } catch (e) {
                    console.error(e);
                    this.wip = false;
                    if (e.message.includes("404")) {
                        this.hgError = true;
                        this.hgErrorMsg = `Host group ${val} not fond on spb01-puppet`;
                    } else {
                        this.wip = false;
                        this.hgError = true;
                        this.hgErrorMsg = e.message;
                    }
                }


                let sourcePCData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                this.pc_count = sourcePCData.PuppetClassesCount;
                this.ovr_count = sourcePCData.PuppetClassesOverrides;
                this.pc = sourcePCData.PuppetClasses;
                try {
                    if (this.tHost) {
                        let targetPCData = PuppetMethods.parse(this.targetHostGroup.puppet_classes);
                        PuppetMethods.setMismatch(this, sourcePCData, targetPCData);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    this.tHost = old_th;
                    this.sourceLoaded = true;
                    this.wip = false;
                }
            },

            async updateTargetHG() {
                this.wip = true;
                //this.$connect();
                try {
                    await hostGroupService.FUpdate(this.tHost, this.hostGroup.name);
                    let targetId = null;
                    let targetHgs = (await hostGroupService.List(this.tHost)).data;
                    for (let i in targetHgs) {
                        if (targetHgs.hasOwnProperty(i)) {
                            if (targetHgs[i].name === this.hostGroup.name) targetId = targetHgs[i].id;
                        }
                    }
                    await hostGroupService.GitCommit(this.tHost, targetId);
                    this.targetHostGroup = (await hostGroupService.Get(this.tHost, targetId)).data;
                    let name = this.hostGroup.name.replace(/\./g, "-");
                    this.link = `https://${this.tHost}/hostgroups/${this.targetHostGroup.foreman_id}-SWE-${name}/edit`;
                } catch (e) {
                    this.wip = false;
                    console.error(e);
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
                this.hgExist = (await hostGroupService.Check(data)).data;
                let fchg = (await hostGroupService.FCheck(this.tHost, this.hostGroup.name)).data;
                this.foremanCheckHG = fchg.error != "not found";
                if (this.foremanCheckHG) {
                    let targetId = null;
                    let targetHgs = (await hostGroupService.List(this.tHost)).data;
                    for (let i in targetHgs) {
                        if (targetHgs.hasOwnProperty(i)) {
                            if (targetHgs[i].name === this.hostGroup.name) targetId = targetHgs[i].id;
                        }
                    }
                    this.targetHostGroup = (await hostGroupService.Get(this.tHost, targetId)).data;
                    // fill puppet classes info
                    let targetPCData = PuppetMethods.parse(this.targetHostGroup.puppet_classes);
                    let sourcePCData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                    this.targPc = targetPCData.PuppetClasses;
                    this.targetLoaded = true;

                    try {
                        PuppetMethods.setMismatch(this, sourcePCData, targetPCData);
                    } catch (e) {
                        console.error(e);
                    }
                    let name = this.hostGroup.name.replace(/\./g, "-");
                    this.link = `https://${this.tHost}/hostgroups/${this.targetHostGroup.foreman_id}-SWE-${name}/edit`;

                }

                this.targetLoaded = true;
                //this.$disconnect();
                this.wip = false;
            },

            setHG(hgId) {
                this.hostGroupId = hgId;
            },

            async submit() {
                // Build POST parameters
                let data = {
                    source_host: this.sHost,
                    target_host: this.tHost,
                    source_hg_id: this.hostGroupId,
                    db_update: this.updateDB,
                };

                // Commit new data
                try {
                    this.wip = true;
                    // this.wipMessage = "Updating source ...";
                    // await hostGroupService.FUpdate(this.sHost, this.hostGroup.name);
                    this.wipMessage = "Uploading to target host ...";
                    let response = (await hostGroupService.Send(data));
                    if (response.status === 200) {
                    }
                    this.wip = false;

                    this.wip = true;
                    this.wipMessage = "Updating data ...";
                    let response2 = (await hostGroupService.FUpdate(this.tHost, this.hostGroup.name));
                    if (response2.status === 200) {
                        await hostGroupService.GitCommit(this.tHost, response2.data.id);
                        this.hgDone = true;
                        this.hgDoneMsg = `HostGroup ${this.hostGroup.name} updated on ${this.tHost}`;
                    }
                    this.wipMessage = false;
                    this.wip = false;

                } catch (e) {
                    this.wip = false;
                    this.hgError = true;
                    this.hgErrorMsg = e.message;
                }

                // =====================================================================================================
                this.hgExist = (await hostGroupService.Check(data)).data;
                let fchg = (await hostGroupService.FCheck(this.tHost, this.hostGroup.name)).data;
                this.foremanCheckHG = fchg.error != "not found";
                if (this.foremanCheckHG) {
                    let targetId = null;
                    let targetHgs = (await hostGroupService.List(this.tHost)).data;
                    for (let i in targetHgs) {
                        if (targetHgs.hasOwnProperty(i)) {
                            if (targetHgs[i].name === this.hostGroup.name) targetId = targetHgs[i].id;
                        }
                    }
                    this.targetHostGroup = (await hostGroupService.Get(this.tHost, targetId)).data;
                    // fill puppet classes info
                    let targetPCData = PuppetMethods.parse(this.targetHostGroup.puppet_classes);
                    let sourcePCData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                    this.targPc = targetPCData.PuppetClasses;
                    this.targetLoaded = true;
                    try {
                        PuppetMethods.setMismatch(this, sourcePCData, targetPCData);
                    } catch (e) {
                        console.error(e);
                    }

                    let name = this.hostGroup.name.replace(/\./g, "-");
                    this.link = `https://${this.tHost}/hostgroups/${this.targetHostGroup.foreman_id}-SWE-${name}/edit`;

                }
                //this.$disconnect();
            },
        }
    }
</script>

<style></style>
