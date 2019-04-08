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

                    <v-btn
                            color="primary"
                            @click="e1 = 2; getHostGroups()"
                    >
                        Next
                    </v-btn>

                    <v-btn flat :to="{name:'hostgroup'}">Cancel</v-btn>
                </v-stepper-content>
                <!--     =====================================================================================================       -->
                <v-stepper-content step="2">
                    <v-card>
                        <v-card-title class="headline font-weight-regular blue-grey white--text">Host Group</v-card-title>
                        <v-card-text>
                            <v-subheader class="pa-0">Select host groups for transfer</v-subheader>
                            <v-autocomplete
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

                    <v-btn
                            color="primary"
                            @click="e1 = 3"
                    >
                        Next
                    </v-btn>
                    <v-btn
                            color="primary"
                            @click="e1 = 1"
                    >
                        Back
                    </v-btn>
                    <v-btn flat :to="{name:'hostgroup'}">Cancel</v-btn>
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

                    <v-btn
                            color="primary"
                            @click="e1 = 4; checks()"
                    >
                        Next
                    </v-btn>
                    <v-btn
                            color="primary"
                            @click="e1 = 2"
                    >
                        Back
                    </v-btn>
                    <v-btn flat :to="{name:'hostgroup'}">Cancel</v-btn>
                </v-stepper-content>
                <!--     =====================================================================================================       -->
                <v-stepper-content step="4">
                    <v-card>
                        <v-card-title class="headline font-weight-regular blue-grey white--text">Checks</v-card-title>
                        <v-card-text v-for="(val, idx) in checkRes" :key="idx">
                           <v-layout row>
                               <v-flex xs3>{{val.tHost}}</v-flex>
                               <v-flex xs3>{{val.hgName}}</v-flex>
                               <v-flex xs3 v-if="val.hostgroup"><v-chip label color="warning">Exist, to update</v-chip></v-flex>
                               <v-flex xs3 v-else><v-chip label color="success">Add new</v-chip></v-flex>
                               <v-flex xs3 v-if="val.environment === -1"><v-chip label color="warning">Env not exist, skip</v-chip></v-flex>
                               <v-flex xs3 v-else><v-chip label color="success">Env exist, ok</v-chip></v-flex>
                           </v-layout>
                        </v-card-text>
                    </v-card>

                    <v-btn
                            color="primary"
                            @click="e1 = 1"
                    >
                        Upload
                    </v-btn>
                    <v-btn
                            color="primary"
                            @click="e1 = 3"
                    >
                        Back
                    </v-btn>
                    <v-btn flat :to="{name:'hostgroup'}">Cancel</v-btn>
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
        }),
        async mounted () {
            try {
                this.hosts = (await hostService.hosts()).data;
            } catch (e) {
                console.error(e);
                this.hgError = true;
                this.hgErrorMsg = "Backend not reachable or in errored state"
            }
        },
        watch: {},
        methods: {
            async getHostGroups() {
                this.hostGroups = (await hostGroupService.hgList(this.sHost)).data;
            },
            async checks() {
                console.log(this.hostGroupSelected);
                this.wip = true;
                let res = [];
                for (let hg in this.hostGroupSelected) {
                    let hostGroup = (await hostGroupService.hg(this.sHost, this.hostGroupSelected[hg])).data;
                    for (let target in this.tHost) {
                        if (this.tHost[target] !== this.sHost) {
                            let hgData = {
                                source_host: this.sHost,
                                target_host: this.tHost[target],
                                source_hg_id: this.hostGroupSelected[hg]
                            };

                            let envData = {
                                host: this.tHost[target],
                                env: hostGroup.environment
                            };
                            let envExist = (await environmentService.envCheck(envData)).data;
                            let hgExist = (await hostGroupService.hgCheck(hgData)).data;
                            res.push({
                                tHost: this.tHost[target],
                                hgName: hostGroup.name,
                                environment: envExist,
                                hostgroup: hgExist
                            })
                        }
                    }
                }
                this.wip = false;
                console.log(res);
                this.checkRes = res;
            },
        }
    }
</script>

<style></style>
