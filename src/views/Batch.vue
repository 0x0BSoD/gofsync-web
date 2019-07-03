<template>
    <v-container>
<!--        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>-->
        <v-stepper v-model="e1">
            <v-stepper-header>
                <v-stepper-step :complete="e1 > 1" step="1">Source</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="e1 > 2" step="2">Host Group</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="e1 > 3" step="3">Target</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step step="4">Checks</v-stepper-step>
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
                        <v-card-title class="headline font-weight-regular blue-grey white--text">Host Group</v-card-title>
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
                        </v-card-text>
                    </v-card>

                    <v-card-actions>
                        <v-btn flat color="warning" @click="e1 = 1" >back</v-btn>
                        <v-btn flat color="primary" :disabled="hostGroupSelected.length===0" @click="e1 = 3" >next</v-btn>
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
                        <v-btn flat color="warning" @click="e1 = 2" >back</v-btn>
                        <v-btn flat color="primary" :disabled="tHost.length===0" @click="e1 = 4; checks()" >next</v-btn>
                    </v-card-actions>

                </v-stepper-content>
                <!--     =====================================================================================================       -->
                <v-stepper-content step="4">
                    <v-card>
                        <v-card-title v-if="!checked" class="headline font-weight-regular blue-grey white--text">Checking</v-card-title>
                        <v-card-title v-if="checked" class="headline font-weight-regular blue-grey white--text">Checks Result</v-card-title>
                        <v-card-text
                            v-for="(swes, host) in checkRes"
                            :key="host"
                        >
                            <v-card
                                v-for="(swe, idx) in swes"
                                :key="idx"
                            >
                                <v-card-text >
                                    <v-layout row wrap>
                                        <v-flex xs3 pt-2>{{swe.tHost}}</v-flex>
                                        <v-flex xs1 pt-2>{{swe.hgName}}</v-flex>
                                        <v-flex xs2>
                                            <v-chip label v-if="swe.environment.targetId === -1" color="red">{{swe.environment.name}}</v-chip>
                                            <v-chip label v-else color="success">{{swe.environment.name}}</v-chip>
                                        </v-flex>
                                        <v-flex xs5>
                                            <v-btn flat v-if="swe.process.checkInProgress">
                                                Checking <looping-rhombuses-spinner class="ml-2" :animation-duration="2500" :rhombus-size="15" color="#ff1d5e" />
                                            </v-btn>
                                            <div v-else-if="swe.process.loadingInProgress">
                                                <v-btn flat v-if="swe.foreman.targetId">
                                                    Updating <looping-rhombuses-spinner class="ml-2" :animation-duration="2500" :rhombus-size="15" color="#ff1d5e" />
                                                </v-btn>
                                                <v-btn flat v-else>
                                                    Updating <looping-rhombuses-spinner class="ml-2" :animation-duration="2500" :rhombus-size="15" color="#ff1d5e" />
                                                </v-btn>
                                                <v-chip label v-if="WSActions">{{WSActions}}</v-chip>
                                                <v-chip label v-if="WSState">{{WSState}}</v-chip>
                                            </div>
                                            <div v-else-if="swe.process.done">
                                                <v-chip label v-if="swe.foreman.targetId" color="success">Updated</v-chip>
                                                <v-chip label v-else color="success">Uploaded</v-chip>
                                            </div>
                                            <div v-else>
                                                <v-chip label v-if="swe.foreman.targetId">Exist on host</v-chip>
                                                <v-chip label v-else>Will be added</v-chip>
                                                <v-chip label v-if="swe.environment.targetId === -1">No SWE on host</v-chip>
                                            </div>
                                        </v-flex>
                                        <v-flex xs1><v-btn v-if="swe.hg_link" icon flat><a target="_blank" :rel="swe.hgName" :href="swe.hg_link"><v-icon>open_in_new</v-icon></a></v-btn></v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-card-text>
                    </v-card>

                    <v-card-actions>
                        <v-btn v-if="!wip" flat color="warning" @click="e1 = 3" >back</v-btn>
                        <v-btn v-if="!wip" flat color="success" :disabled="started" @click="startJob()" >upload</v-btn>
                    </v-card-actions>


                </v-stepper-content>
            </v-stepper-items>

        </v-stepper>
    </v-container>
</template>

<script>
    import { hostGroupService, environmentService, hostService } from "../_services"
    import { Common } from "./methods";
    import { LoopingRhombusesSpinner } from 'epic-spinners'
    import { mapGetters } from "vuex"

    export default {
        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
        computed: {
            mapGetters() {

            },
            nowActions () {
                return this.$store.state.socketModule.socket.message;
            },
        },

        components: {
            LoopingRhombusesSpinner
        },

        data: () => ({
            e1: 0,
            sHost: null,
            tHost: [],
            hosts: [],
            hostGroups: [],
            hostGroupSelected: [],
            targetHostGroup: {},
            wip: false,
            checkRes: [],
            started: false,
            wipUploading: true,
            checkingHost: null,
            checkingSWE: null,
            checkResArray: [],
            checked: false,
            WSState: false,
            WSActions: false,
        }),
        async mounted () {
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
                async handler (val) {
                    let data = (await val);
                    if (data.hasOwnProperty("done")) {
                        for (let i in this.checkRes[data.tHost]) {
                            if (data.hgName === this.checkRes[data.tHost][i].hgName) {
                                this.checkRes[data.tHost][i].process.done = data.done;
                                this.checkRes[data.tHost][i].process.loadingInProgress = data.in_progress;
                            }
                        }
                        this.$forceUpdate();
                    } else {
                        try {
                            this.WSActions = val.action;
                            this.WSState = val.state
                        } catch (e) {
                            this.WSActions = false;
                            this.WSState = false;
                        }
                    }
                }
            },
        },
        methods: {
            async startJob () {
                this.started = true;
                //this.$connect();
                await hostGroupService.BatchSend(this.checkRes);
                this.started = false;
                //this.$disconnect();
            },
            async getHostGroups() {
                this.hostGroups = (await hostGroupService.List(this.sHost)).data;
            },
            async checks() {
                this.started = true;
                this.checked = false;
                this.checkRes = {};
                // build object for checking
                for (let target in this.tHost) {
                    if (this.tHost[target] !== this.sHost) {
                        this.checkRes[this.tHost[target]] = [];
                    }
                }
                // HG ID's loop
                for (let hg in this.hostGroupSelected) {
                    // try to get source HG
                    let hostGroup = {};
                    try {
                        hostGroup = (await hostGroupService.Get(this.sHost, this.hostGroupSelected[hg])).data;
                    } catch (e) {
                        this.wip = false;
                        return ;
                    }
                    for (let target in this.tHost) {
                        if (this.tHost[target] !== this.sHost) {
                            this.checkRes[this.tHost[target]].push({
                                id: hostGroup.id,
                                hgName: hostGroup.name,
                                tHost: this.tHost[target],
                                sHost: this.sHost,
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
                                },
                                error: {
                                    state: false,
                                    msg: "",
                                },
                            });
                        }
                    }
                }
                this.checked = true;
                for (let target in this.checkRes) {
                    for (let i in this.checkRes[target]) {
                        let envData = {
                            host: target,
                            env: this.checkRes[target][i].environment.name
                        };
                        this.checkRes[target][i].environment.targetId = (await environmentService.ForemanID(envData)).data;
                        let foremanStatus = (await hostGroupService.FCheck(target, this.checkRes[target][i].hgName)).data;
                        if (foremanStatus.id !== -1) {
                            this.checkRes[target][i].foreman.targetId = foremanStatus.id;
                            let targetHGList = (await hostGroupService.List(target)).data;
                            for (let j in targetHGList) {
                                if (targetHGList[j].name ===  this.checkRes[target][i].hgName) {
                                   let ID = targetHGList[j].id;
                                    let targetHG = (await hostGroupService.Get(target, ID)).data;
                                    let HGNameLink =  this.checkRes[target][i].hgName.replace(/\./g, "-");
                                    this.checkRes[target][i].hg_link = `https://${target}/hostgroups/${targetHG.foreman_id}-SWE-${HGNameLink}/edit`;
                                }
                            }
                        }
                        this.checkRes[target][i].process.checkInProgress = false;
                        this.started = false;
                        this.$forceUpdate();
                    }
                }
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
