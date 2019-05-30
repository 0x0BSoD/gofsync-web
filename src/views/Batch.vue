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
                        <v-layout row wrap v-if="!checked">
                            <v-flex xs12 class="text-sm-center mt-3">
                                <v-chip color="font-weight-regular">{{checkingHost}}</v-chip>
                            </v-flex>
                            <v-flex xs12 class="text-sm-center mb-3">
                                <v-chip color="font-weight-regular blue-grey white--text">{{checkingSWE}}</v-chip>
                            </v-flex>
                            <v-flex xs12 class="text-sm-center mt-3 mb-3">
                                <fingerprint-spinner
                                        class="spinner"
                                        :animation-duration="1500"
                                        :size="64"
                                        color="#314549"
                                />
                            </v-flex>
                        </v-layout>
                        <v-card-title v-if="checked" class="headline font-weight-regular blue-grey white--text">Checks Result</v-card-title>
                        <v-card-text v-if="checked" v-for="(val, idx) in checkRes" :key="idx">
                            <v-layout v-if="started">

                                <v-flex xs3>{{val.tHost}}</v-flex>
                                <v-flex xs3>{{val.hgName}}</v-flex>

                                <v-flex xs6>

                                    <v-chip label color="primary" text-color="white" v-if="val.wip && !val.error">
                                        <span class="custom-loader">
                                            <v-icon light>cached</v-icon>
                                        </span>
                                        {{val.wipText}}
                                    </v-chip>
                                    <v-chip label color="primary" text-color="white" v-else-if="!val.wip">
                                        <v-icon left>watch_later</v-icon>Idle
                                    </v-chip>

                                    <v-chip label color="success" text-color="white" v-if="val.uploaded">
                                        <v-icon left>done</v-icon>Uploaded
                                    </v-chip>
                                    <v-chip label color="primary" text-color="white" v-if="val.updated">
                                        <v-icon left>done</v-icon>Updated
                                    </v-chip>

                                    <v-chip label v-if="val.wip && nowActions && !val.error">{{nowActions.actions}}</v-chip>
                                    <v-chip label v-if="val.wip && nowActions.state && !val.error">{{nowActions.state}}</v-chip>

                                    <v-chip label v-if="val.error" color="error">Errored</v-chip>

                                </v-flex>
                            </v-layout>

                           <v-layout row v-else>
                               <v-flex xs3>{{val.tHost}}</v-flex>
                               <v-flex xs3>{{val.hgName}}</v-flex>
                               <v-flex xs6 class="text-xs-center">
                                   <v-chip label color="warning" v-if="val.foremanCheckHG">Exist</v-chip>
                                   <v-chip label color="success" v-else>Add new</v-chip>

                                   <v-chip label color="success" text-color="white" v-if="val.uploaded">
                                       <v-icon left>done_all</v-icon>Done
                                   </v-chip>

                                   <v-chip label v-if="val.environment === -1">Env not exist, will be skipped</v-chip>
                                   <v-tooltip bottom v-if="val.foremanCheckHG && !val.error">
                                       <template v-slot:activator="{ on }">
                                           <v-btn icon small><a target="_blank" v-on="on" :rel="val.hgName" :href="val.hg_link"><v-icon>link</v-icon></a></v-btn>
                                       </template>
                                       <span>{{val.hgName}} link</span>
                                   </v-tooltip>
                                   <v-chip label v-else color="error">Errored</v-chip>
                               </v-flex>
                           </v-layout>
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
    import { FingerprintSpinner } from 'epic-spinners'

    export default {
        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
        computed: {
            nowActions () {
                return this.$store.state.socketModule.socket.message;
            },
        },

        components: {
            FingerprintSpinner
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
            checked: false,
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
        watch: {},
        methods: {
            async startJob () {
                this.started = true;
                for (let i in this.checkRes) {
                    if (this.checkRes[i].environment) {
                        // Build POST parameters
                        let data = {
                            source_host: this.sHost,
                            target_host: this.checkRes[i].tHost,
                            source_hg_id: this.checkRes[i].source_hg_id,
                            db_update: true,
                        };
                        // Commit new data
                        try {
                            this.checkRes[i].wipText = "Uploading";
                            this.checkRes[i].wip = true;
                            await hostGroupService.Send(data);
                            this.checkRes[i].wip = false;
                            this.checkRes[i].uploaded = true;
                        } catch (e) {
                            console.error(e);
                            this.checkRes[i].error = true;
                        }
                    }
                    // this.checkRes[i].wip = false;
                }

                for (let i in this.checkRes) {
                    if (this.checkRes[i].environment) {
                        if (!this.checkRes[i].error) {
                            // Commit new data
                            try {
                                this.checkRes[i].wip = true;
                                this.checkRes[i].wipText = "Updating";
                                await hostGroupService.FUpdate(this.checkRes[i].tHost, this.checkRes[i].hgName);
                                this.checkRes[i].wip = false;
                                this.checkRes[i].updated = true;
                            } catch (e) {
                                console.error(e);
                                this.checkRes[i].error = true;
                            }
                        }
                    }
                }

                this.started = false;
            },
            async getHostGroups() {
                this.hostGroups = (await hostGroupService.List(this.sHost)).data;
            },
            async checks() {
                this.started = false;
                this.checked = false;
                this.checkRes = {};
                this.wip = true;
                let res = [];

                for (let hg in this.hostGroupSelected) {
                    let hostGroup = {};
                    try {
                        hostGroup = (await hostGroupService.Get(this.sHost, this.hostGroupSelected[hg])).data;
                        this.checkingSWE = hostGroup.name;
                    } catch (e) {
                        this.wip = false;
                        return ;
                    }
                    for (let target in this.tHost) {
                        if (this.tHost[target] !== this.sHost) {
                            this.checkingHost = this.tHost[target];
                            let hgData = {
                                source_host: this.sHost,
                                target_host: this.tHost[target],
                                source_hg_id: this.hostGroupSelected[hg],
                                foremanCheckHG: false,
                                error: false,
                                wip: false,
                            };

                            let envData = {
                                host: this.tHost[target],
                                env: hostGroup.environment
                            };
                            let envExist = (await environmentService.Check(envData)).data;
                            let hgExist = (await hostGroupService.Check(hgData)).data;
                            let fchg = (await hostGroupService.FCheck(this.tHost[target], hostGroup.name)).data;
                            let tmp = fchg.error != "not found";
                            let targetId = null;
                            let link = null;
                            if (tmp) {
                                let targetHgs = (await hostGroupService.List(this.tHost[target])).data;
                                for (let j in targetHgs) {
                                    if (targetHgs.hasOwnProperty(j)) {
                                        if (targetHgs[j].name === hostGroup.name) {
                                            targetId = targetHgs[j].id;
                                            this.targetHostGroup = (await hostGroupService.Get(this.tHost, targetId)).data;
                                            let name = hostGroup.name.replace(/\./g, "-");
                                            link = `https://${this.tHost[target]}/hostgroups/${this.targetHostGroup.foreman_id}-SWE-${name}/edit`;
                                        }

                                    }
                                }
                            }
                            res.push({
                                tHost: this.tHost[target],
                                hgName: hostGroup.name,
                                environment: envExist,
                                hostgroup: hgExist,
                                uploaded: false,
                                updated: false,
                                foremanCheckHG: tmp,
                                foremanTargetId: targetId,
                                source_hg_id: this.hostGroupSelected[hg],
                                wip: false,
                                wipText: "",
                                hg_link: link,
                            })
                        }
                    }
                }
                this.checked = true;
                this.checkRes = res;
                this.wip = false;
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
