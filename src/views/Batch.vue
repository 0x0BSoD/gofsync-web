<template>
    <v-container>
        <v-stepper v-model="e1">
            <v-stepper-header>
                <v-stepper-step :complete="e1 > 1" step="1">Source</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="e1 > 2" step="2">Host Group</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="e1 > 3" step="3">Target</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step step="4">Run</v-stepper-step>
            </v-stepper-header>

            <!--     =====================================================================================================       -->
            <v-stepper-items>
                <v-stepper-content step="1">
                    <v-card>
                        <v-card-title class="headline font-weight-regular blue-grey white--text">Source</v-card-title>
                        <v-card-text>
                            <v-subheader class="pa-0">Source host for getting host group</v-subheader>
                            <v-autocomplete
                                    laberl="source"
                                    prepend-icon="computer"
                                    v-model="sHost"
                                    :items="hosts"
                                    item-text="name"
                                    item-value="name"
                            ></v-autocomplete>
                        </v-card-text>
                    </v-card>

                    <v-card-actions>
                        <v-btn color="primary" :disabled="!sHost" @click="e1 = 2; getHostGroups()" flat>next</v-btn>
                    </v-card-actions>

                </v-stepper-content>
                <!--     =====================================================================================================       -->
                <v-stepper-content step="2">
                    <v-card>
                        <v-card-title class="headline font-weight-regular blue-grey white--text">Host Group
                        </v-card-title>
                        <v-card-text>
                            <v-subheader class="pa-0">Select host groups for transfer</v-subheader>
                            <v-autocomplete
                                    clearable
                                    laberl="source"
                                    prepend-icon="computer"
                                    v-model="hostGroupSelected"
                                    :items="hostGroups"
                                    multiple
                                    item-text="name"
                                    item-value="id"
                            ></v-autocomplete>
                            <v-subheader class="pa-0">Select by environment</v-subheader>
                            <v-autocomplete
                                    clearable
                                    v-model="envsSelected"
                                    :items="environments"
                                    multiple
                            ></v-autocomplete>
                        </v-card-text>
                    </v-card>

                    <v-card-actions>
                        <v-btn flat color="warning" @click="e1 = 1">back</v-btn>
                        <v-btn flat color="primary" :disabled="hostGroupSelected.length===0" @click="e1 = 3">next
                        </v-btn>
                    </v-card-actions>

                </v-stepper-content>
                <!--     =====================================================================================================       -->
                <v-stepper-content step="3">
                    <v-card>
                        <v-card-title class="headline font-weight-regular blue-grey white--text">Targets</v-card-title>
                        <v-card-text>
                            <v-subheader class="pa-0">Targets for transfer selected host groups</v-subheader>
                            <v-autocomplete
                                    laberl="source"
                                    prepend-icon="computer"
                                    multiple
                                    v-model="tHost"
                                    :items="hosts"
                                    item-text="name"
                                    item-value="name"
                            ></v-autocomplete>
                        </v-card-text>
                    </v-card>

                    <v-card-actions>
                        <v-btn flat color="warning" @click="e1 = 2">back</v-btn>
                        <v-btn flat color="primary" :disabled="tHost.length===0" @click="e1 = 4; checks()">next</v-btn>
                    </v-card-actions>

                </v-stepper-content>
                <!--     =====================================================================================================       -->
                <v-stepper-content step="4">
                    <v-card>

                        <v-card-title v-if="curr_heder === 'checking'" class="headline font-weight-regular blue-grey white--text">
                            Checking
                        </v-card-title>
                        <v-card-title v-if="curr_heder === 'checked'" class="headline font-weight-regular blue-grey white--text">
                            Checks Result
                        </v-card-title>
                        <v-card-title v-if="curr_heder === 'working'" class="headline font-weight-regular blue-grey white--text">
                            Working
                        </v-card-title>
                        <v-card-title v-if="curr_heder === 'done'" class="headline font-weight-regular blue-grey white--text">
                            Results
                        </v-card-title>

                        <v-card>
                            <v-card-text>
                                <v-layout row wrap>
                                    <v-flex xs12
                                            v-for="(h, k) in hgUniq"
                                            :key="k"
                                    >
                                        <v-layout row wrap>
                                            <v-flex xs2>{{h.name}}</v-flex>
                                            <v-flex xs2>Updated: {{h.updated}}</v-flex>
                                            <v-flex xs2>PuppetClasses: {{h.pc_count}}</v-flex>
                                            <v-flex xs2>Overrides: {{h.ovr_count}}</v-flex>
                                            <v-flex xs4 v-if="h.updating">Updating <looping-rhombuses-spinner class="ml-2" :animation-duration="2500" rhombus-size="15" color="#607d8b"/></v-flex>
                                        </v-layout>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>

                        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>


                        <v-card-text
                                v-else
                                v-for="(swes, host) in checkRes.batch"
                                :key="host"
                        >
                            <v-chip label pt-1 pb-1>{{host}}</v-chip>
                            <v-card
                                    v-for="(swe, idx) in swes"
                                    :key="idx"
                            >
                                <v-card-text>
                                    <v-layout row wrap>
                                        <v-flex xs2 pt-2>{{swe.hgName}}</v-flex>
                                        <v-flex xs1 pt-2 v-if="swe.pc_count">PC: {{swe.pc_count}}</v-flex>
                                        <v-flex xs1 pt-2 v-if="swe.ovr_count">OVR: {{swe.ovr_count}}</v-flex>
                                        <v-flex xs1>
                                            <v-chip label v-if="swe.environment.targetId === -1" color="red">
                                                {{swe.environment.name}}
                                            </v-chip>
                                            <v-chip label v-else color="success">{{swe.environment.name}}</v-chip>
                                        </v-flex>
                                        <v-flex xs6>
                                            <v-btn flat v-if="swe.process.checkInProgress">
                                                Checking
                                                <looping-rhombuses-spinner class="ml-2" :animation-duration="2500"
                                                                           :rhombus-size="15" color="#607d8b"/>
                                            </v-btn>
                                            <div v-else-if="swe.process.loadingInProgress">
                                                <v-btn flat v-if="swe.foreman.targetId">
                                                    Updating
                                                    <looping-rhombuses-spinner class="ml-2" :animation-duration="2500"
                                                                               :rhombus-size="15" color="#607d8b"/>
                                                </v-btn>
                                                <v-btn flat v-else>
                                                    Updating
                                                    <looping-rhombuses-spinner class="ml-2" :animation-duration="2500"
                                                                               :rhombus-size="15" color="#607d8b"/>
                                                </v-btn>
                                                <v-chip label v-if="swe.ws.msg.length > 0">{{swe.ws.msg}}</v-chip>
                                                <v-chip label v-if="swe.ws.count.length > 0">{{swe.ws.count}}</v-chip>
                                                <v-chip label v-if="swe.ws.item.length > 0">{{swe.ws.item}}</v-chip>

                                            </div>
                                            <div v-else-if="swe.process.done">
                                                <v-chip label v-if="swe.foreman.targetId" color="success">Updated
                                                </v-chip>
                                                <v-chip label v-else color="success">Uploaded</v-chip>
                                            </div>
                                            <div v-else>
                                                <v-chip label v-if="swe.environment.targetId === -1">No SWE on host
                                                </v-chip>
                                                <v-chip label v-else-if="swe.foreman.targetId">Exist on host</v-chip>
                                                <v-chip label v-else="">Will be added</v-chip>
                                            </div>
                                        </v-flex>
                                        <v-flex xs1>
                                            <v-btn v-if="swe.hg_link" icon flat><a target="_blank" :rel="swe.hgName"
                                                                                   :href="swe.hg_link">
                                                <v-icon>open_in_new</v-icon>
                                            </a></v-btn>
                                        </v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-card-text>
                    </v-card>

                    <v-checkbox v-if="!wip" v-model="updateSource" label="Update Source HostGroups"></v-checkbox>
                    <v-card-actions>
                        <v-btn v-if="!wip" flat color="warning" @click="e1 = 3">back</v-btn>
                        <v-btn v-if="!wip" flat color="success" :disabled="started || !checked" @click="startJob()">start</v-btn>
                    </v-card-actions>

                </v-stepper-content>

            </v-stepper-items>

        </v-stepper>
    </v-container>
</template>

<script>
    import {environmentService, hostGroupService, hostService} from "../_services"
    import {Common} from "./methods";
    import {LoopingRhombusesSpinner} from 'epic-spinners'

    import {PuppetMethods} from "./hostgroup/methods"

    export default {
        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
        computed: {
            nowActions() {
                return this.$store.state.socketModule.socket.message;
            },
        },

        components: {
            LoopingRhombusesSpinner
        },

        data: () => ({
            e1: 0,
            sHost: "spb01-puppet.lab.nordigy.ru",
            tHost: [],
            hosts: [],
            hostGroups: [],
            environments: [],
            envsSelected: [],
            hostGroupSelected: [],
            targetHostGroup: {},
            wip: false,
            checkRes: {},
            started: false,
            updateSource: true,
            wipUploading: true,
            checkingHost: null,
            checkingSWE: null,
            checkResArray: [],
            checked: false,
            checkInProgress: false,
            hgUniq: [],
            WSProgress: {
                errors: [],
                done: [],
                message: null,
                counter: {
                    current: null,
                    total: null,
                },
            },
            curr_heder: null,
        }),
        async mounted() {
            // User check ==========================================
            await Common.auth(this);
            try {
                this.hosts = (await hostService.hosts()).data;
            } catch (e) {
                console.error(e);
            }
        },
        watch: {
            nowActions: {
                async handler (message) {
                    if (message.additional_data.hasOwnProperty("done")) {
                        if (message.additional_data.message !== "Updating HG") {
                            this.checkRes.batch[message.host_name][message.additional_data.host_group].process.loadingInProgress = false;
                            this.checkRes.batch[message.host_name][message.additional_data.host_group].process.done = true;
                        }
                    }

                    if (message.additional_data.hasOwnProperty("host_group")) {
                        if (message.additional_data.message === "Uploading HG") {
                            this.checkRes.batch[message.host_name][message.additional_data.host_group].process.loadingInProgress = true;
                        }
                        // slitted for future
                        if (message.additional_data.message === "Updating HG") {
                            this.checkRes.batch[message.host_name][message.additional_data.host_group].process.loadingInProgress = true;
                        }

                        if (message.additional_data.hasOwnProperty("message")) {
                            this.checkRes.batch[message.host_name][message.additional_data.host_group].ws.msg = message.additional_data.message;
                        }

                        if (message.additional_data.hasOwnProperty("item")) {
                            console.log(message.additional_data.item);
                            this.checkRes.batch[message.host_name][message.additional_data.host_group].ws.item = message.additional_data.item;
                        }
                        if (message.additional_data.hasOwnProperty("total")) {
                            console.log(`${message.additional_data.current}/${message.additional_data.total}`);
                            this.checkRes.batch[message.host_name][message.additional_data.host_group].ws.count = `${message.additional_data.current}/${message.additional_data.total}`;
                        }
                    }
                    this.$forceUpdate();
                }
            },
            envsSelected: {
                async handler(val) {
                    this.hostGroupSelected = [];
                    for (let env in val) {
                        for (let h in this.hostGroups) {
                            if (this.hostGroups[h].name.match(`.*${val[env]}$`)) {
                                this.hostGroupSelected.push(this.hostGroups[h].id)
                            }
                        }
                    }
                }
            }
        },
        methods: {
            async startJob() {
                this.started = true;
                this.curr_heder = "working";
                this.checkRes["update_source"] = this.updateSource;
                hostGroupService.BatchSend(this.checkRes);
                // this.started = false;
                // this.curr_heder = "done";
            },
            async getHostGroups() {
                this.hostGroups = (await hostGroupService.List(this.sHost)).data;
                this.environments = [];
                for (let h in this.hostGroups) {
                    let tmp = this.hostGroups[h].name.split(".");
                    if (tmp.length > 1 && this.environments.indexOf(tmp[1]) === -1) {
                        this.environments.push(tmp[1])
                    }
                }
            },
            async checks() {
                this.started = true;
                this.curr_heder = "checking";
                this.checked = false;
                this.checkRes["batch"] = {};
                this.wip = true;
                // build object for checking
                for (let target in this.tHost) {
                    if (this.tHost.hasOwnProperty(target)) {
                        if (this.tHost[target] !== this.sHost) {
                            this.checkRes["batch"][this.tHost[target]] = {};
                        }
                    }
                }
                // HG ID loop
                this.hgUniq = [];
                for (let hg in this.hostGroupSelected) {
                    // try to get source HG
                    let hostGroup = {};
                    try {
                        if (this.hostGroupSelected.hasOwnProperty(hg)) {
                            hostGroup = (await hostGroupService.Get(this.sHost, this.hostGroupSelected[hg])).data;
                            let parsedPc = PuppetMethods.parse(hostGroup.puppet_classes);
                            this.hgUniq.push({
                                "name":hostGroup.name,
                                "updated":hostGroup.updated,
                                "pc_count":parsedPc.PuppetClassesCount,
                                "ovr_count":parsedPc.PuppetClassesOverrides,
                                "updating":false
                            });
                        }
                    } catch (e) {
                        this.wip = false;
                        return;
                    }

                    // build check struct
                    for (let target in this.tHost) {
                        if (this.tHost.hasOwnProperty(target)) {
                            if (this.tHost[target] !== this.sHost) {
                                this.checkRes["batch"][this.tHost[target]][hostGroup.name] = {
                                    id: hostGroup.id,
                                    hgName: hostGroup.name,
                                    tHost: this.tHost[target],
                                    sHost: this.sHost,
                                    pc_count: null,
                                    ovr_count: null,
                                    environment: {
                                        name: hostGroup.environment,
                                        targetId: null,
                                    },
                                    hg_link: null,
                                    foreman: {
                                        targetId: null,
                                        sourceId: hostGroup.id,
                                    },
                                    process: {
                                        checkInProgress: true,
                                        loadingInProgress: false,
                                        done: false,
                                    },
                                    ws: {
                                        state: true,
                                        msg: "",
                                        item: "",
                                        count: "",
                                    },
                                    error: {
                                        state: false,
                                        msg: "",
                                    },
                                };
                            }
                        }
                    }
                }
                this.wip = false;

                // do check itself
                for (let target in this.checkRes["batch"]) {
                    if (this.checkRes["batch"].hasOwnProperty(target)) {
                        for (let i in this.checkRes["batch"][target]) {
                            if (this.checkRes["batch"][target].hasOwnProperty(i)) {
                                let envData = {
                                    host: target,
                                    env: this.checkRes["batch"][target][i].environment.name
                                };
                                this.checkRes["batch"][target][i].environment.targetId = (await environmentService.ForemanID(envData)).data;
                                let foremanStatus = (await hostGroupService.FCheck(target, i)).data;
                                if (foremanStatus.id !== -1) {
                                    this.checkRes["batch"][target][i].foreman.targetId = foremanStatus.id;
                                    let targetHGList = (await hostGroupService.List(target)).data;
                                    for (let j in targetHGList) {
                                        if (targetHGList[j].name === i) {
                                            let ID = targetHGList[j].id;
                                            let targetHG = (await hostGroupService.Get(target, ID)).data;
                                            let parsedPc = PuppetMethods.parse(targetHG.puppet_classes);
                                            this.checkRes["batch"][target][i].ovr_count = parsedPc.PuppetClassesOverrides;
                                            this.checkRes["batch"][target][i].pc_count = parsedPc.PuppetClassesCount;
                                            let HGNameLink = i.replace(/\./g, "-");
                                            this.checkRes["batch"][target][i].hg_link = `https://${target}/hostgroups/${targetHG.foreman_id}-SWE-${HGNameLink}/edit`;
                                        }
                                    }
                                }
                                this.checkRes["batch"][target][i].process.checkInProgress = false;
                                this.started = false;
                                this.$forceUpdate();
                            }
                        }
                    }
                }
                this.checked = true;
                this.curr_heder = "checked";
            },
        }
    }
</script>

<style>
    #particles-js {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .custom-loader {
        animation: loader 1s infinite;
        display: flex;
    }

    @-moz-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @-webkit-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @-o-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
