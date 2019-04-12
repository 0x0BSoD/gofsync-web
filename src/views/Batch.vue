<template>
    <v-container>
        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
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

                    <v-btn color="primary" :disabled="!sHost" @click="e1 = 2; getHostGroups()" flat>next</v-btn>

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

                    <v-btn flat color="warning" @click="e1 = 1" >back</v-btn>
                    <v-btn flat color="primary" :disabled="hostGroupSelected.length===0" @click="e1 = 3" >next</v-btn>

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

                    <v-btn flat color="warning" @click="e1 = 2" >back</v-btn>
                    <v-btn flat color="primary" :disabled="tHost.length===0" @click="e1 = 4; checks()" >next</v-btn>

                </v-stepper-content>
                <!--     =====================================================================================================       -->
                <v-stepper-content step="4">
                    <v-card>
                        <v-card-title class="headline font-weight-regular blue-grey white--text">Checks</v-card-title>
                        <v-card-text v-for="(val, idx) in checkRes" :key="idx">
                            <v-layout v-if="started">
                                <v-flex xs3>{{val.tHost}}</v-flex>
                                <v-flex xs3>{{val.hgName}}</v-flex>
                                <v-flex xs6>
                                    <v-progress-linear v-if="val.wip" :indeterminate="val.wip"></v-progress-linear>
                                    <v-chip v-else-if="val.error" color="error">Errored</v-chip>
                                    <v-chip v-else label color="success">Uploaded</v-chip>
                                </v-flex>
                            </v-layout>
                           <v-layout row v-else>
                               <v-flex xs3>{{val.tHost}}</v-flex>
                               <v-flex xs3>{{val.hgName}}</v-flex>
                               <v-flex xs3 v-if="val.foremanCheckHG"><v-chip label color="warning">Exist</v-chip></v-flex>
                               <v-flex xs3 v-else><v-chip label color="success">Add new</v-chip></v-flex>
                               <v-flex xs3 v-if="val.environment === -1"><v-chip label color="warning">Env not exist</v-chip></v-flex>
                               <v-flex xs3 v-else><v-chip label color="success">Env exist</v-chip></v-flex>
                           </v-layout>
                        </v-card-text>
                    </v-card>

                    <v-btn v-if="!wip" flat color="warning" @click="e1 = 3" >back</v-btn>
                    <v-btn v-if="!wip" flat color="success" :disabled="started" @click="startJob()" >upload</v-btn>

                </v-stepper-content>
            </v-stepper-items>

        </v-stepper>
    </v-container>
</template>

<script>
    import { hostGroupService, environmentService,
        hostService, locationsService, userService } from "../_services"

    export default {
        data: () => ({
            e1: 0,
            sHost: null,
            tHost: [],
            hosts: [],
            hostGroups: [],
            hostGroupSelected: [],
            wip: false,
            checkRes: [],
            started: false,
            wipUploading: true,
        }),
        async mounted () {
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
                            let response = (await hostGroupService.hgSend(data));
                            console.log(response);
                        } catch (e) {
                            console.error(e);
                            this.checkRes[i].error = true;
                        }
                        //    ==============================================================================================
                    }
                    // else {
                    //       // Build POST parameters
                    //     let data = {
                    //         source_host: this.sHost,
                    //         target_host: this.checkRes[i].tHost,
                    //         source_hg_id: this.checkRes[i].source_hg_id,
                    //         target_hg_id: this.checkRes[i].foremanTargetId,
                    //         db_update: true,
                    //     };
                    //     console.log(data);
                    //     // Commit new data
                    //     try {
                    //         let response = (await hostGroupService.hgUpdate(data));
                    //         console.log(response);
                    //     } catch (e) {
                    //         console.error(e);
                    //         this.checkRes[i].error = true;
                    //     }
                    // }
                    this.checkRes[i].wip = false;
                }
                await this.checks()
            },
            async getHostGroups() {
                this.hostGroups = (await hostGroupService.hgList(this.sHost)).data;
            },
            async checks() {
                this.started = false;
                this.wip = true;
                this.checkRes = {};
                let res = [];
                for (let hg in this.hostGroupSelected) {
                    let hostGroup = {};
                    try {
                        hostGroup = (await hostGroupService.hg(this.sHost, this.hostGroupSelected[hg])).data;
                    } catch (e) {
                        this.wip = false;
                        return ;
                    }
                    for (let target in this.tHost) {
                        if (this.tHost[target] !== this.sHost) {
                            let hgData = {
                                source_host: this.sHost,
                                target_host: this.tHost[target],
                                source_hg_id: this.hostGroupSelected[hg],
                                foremanCheckHG: false,
                                error: false,
                                wip: true,
                            };

                            let envData = {
                                host: this.tHost[target],
                                env: hostGroup.environment
                            };
                            let envExist = (await environmentService.envCheck(envData)).data;
                            let hgExist = (await hostGroupService.hgCheck(hgData)).data;
                            let fchg = (await hostGroupService.hgFCheck(this.tHost[target], hostGroup.name)).data;
                            let tmp = fchg.error != "not found";
                            let targetId = null;
                            if (tmp) {
                                let targetHgs = (await hostGroupService.hgList(this.tHost[target])).data;
                                for (let j in targetHgs) {
                                    if (targetHgs.hasOwnProperty(j)) {
                                        if (targetHgs[j].name === hostGroup.name) targetId = targetHgs[j].id;
                                    }
                                }
                            }
                            res.push({
                                tHost: this.tHost[target],
                                hgName: hostGroup.name,
                                environment: envExist,
                                hostgroup: hgExist,
                                foremanCheckHG: tmp,
                                foremanTargetId: targetId,
                                source_hg_id: this.hostGroupSelected[hg],
                                wip: true,
                            })
                        }
                    }
                }
                this.wip = false;
                this.checkRes = res;
            },
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
</script>

<style></style>
