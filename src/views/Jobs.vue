<template>
    <v-container fluid>
        <v-layout row wrap>
            <v-flex xs12><v-btn @click="open_dialog_addNew_job()">add new</v-btn></v-flex>
        </v-layout>
        <v-card class="elevation-1">
            <v-card-text>
                <table>
                    <thead>
                    <tr><th></th></tr>
                    <tr><th></th></tr>
                    <tr><th></th></tr>
                    <tr><th></th></tr>
                    <tr><th></th></tr>
                    <tr><th></th></tr>
                    <tr><th></th></tr>
                    </thead>
                    <tbody v-for="(job,k) in jobs" :key="k">
                    <tr>
                        <td>
                            <v-chip label>
                                <v-btn icon v-if="job.started" small>
                                    <v-icon dark>play_arrow</v-icon>
                                </v-btn>
                                <v-btn icon v-else small>
                                    <v-icon dark>stop</v-icon>
                                </v-btn>
                            </v-chip>
                        </td>

                        <td><v-chip label>{{ job.id }}</v-chip></td>

                        <td><v-chip label>{{ job.status }}</v-chip></td>

                        <td v-for="(i,loc) in job.items" :key="loc">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-chip label v-on="on"><v-icon left>arrow_drop_down</v-icon>{{ loc.toUpperCase() }}</v-chip>
                                </template>
                                <div v-for="(state, swe) in i.swes" :key="swe">
                                    <v-btn dark flat>
                                        {{ swe }} 
                                        <v-icon v-if="state" right color="green darken-2">trip_origin</v-icon>
                                        <v-icon v-else right color="red darken-2">trip_origin</v-icon>
                                    </v-btn>
                                </div>
                            </v-tooltip>
                        </td>

                        <td>
                        <v-chip label>Added: {{ new Date(job.job_added).toString().split(" ").slice(1,5).join(" ") }}</v-chip>
                        </td>

                        <td>
                        <v-chip v-if="!job.job_done.includes('0001')" label>Done: {{ new Date(job.job_done).toString().split(" ").slice(1,5).join(" ") }}</v-chip>
                        </td>

                        <td>
                            <v-btn color="primary" v-if="!job.started && job.job_done.includes('0001')" @click="start_job(job.id)">START</v-btn>
                        </td>

                        <td>
                            <v-btn color="warning" v-if="!job.started && job.job_done.includes('0001')">DELETE</v-btn>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </v-card-text>
        </v-card>


        <v-dialog
                v-model="dialog_addNew_job"
                max-width="800"
                class="full-height"
                fullscreen
        >
            <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                <v-toolbar-title>New Job</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click.native="dialog_addNew_job = !dialog_addNew_job" icon><v-icon>close</v-icon></v-btn>
            </v-toolbar>
            <v-card height="100%">
                <v-card-text>
                <v-progress-linear :indeterminate="true" v-if="working"></v-progress-linear>
                    <v-autocomplete
                        v-model="selected_locations"
                        :items="locations"
                        attach
                        chips
                        label="Locations"
                        multiple
                    ></v-autocomplete>

                    <v-autocomplete
                        v-model="selected_hostGroups"
                        :items="hostGroups"
                        attach
                        chips
                        label="Host Groups"
                        multiple
                    ></v-autocomplete>


                    <v-card dark>
                        <v-card-text>
                            <pre>
{{ output }}
                            </pre>
                        </v-card-text>
                    </v-card>
                </v-card-text>
                <v-card-actions>
                    <v-btn :disabled="selected_hostGroups.length == 0 || selected_locations.length == 0" @click="add_job()">add</v-btn>
                    <!-- <v-btn>start</v-btn> -->
                </v-card-actions>
            </v-card>
        </v-dialog>
        
    </v-container>
</template>

<script>
    import {Common} from "./methods";
    import {jobsService, locationsService, hostGroupService} from "../_services";
    
    export default {
        name: 'Jobs',
        data: () => ({
            jobs: {},
            locations: [],
            selected_locations: [],
            selected_hostGroups: [],
            hostGroups: [],
            output: "Waiting for input ...",
            dialog_addNew_job: false,
            working: false,
        }),
        async mounted() {
            // User check ==========================================
            await Common.auth(this);

            this.jobs = (await jobsService.GetAll()).data;
        },
        methods: {
            async open_dialog_addNew_job() {
                this.dialog_addNew_job = true;
                let tmpLocations = (await locationsService.List()).data;
                for (let i in tmpLocations) {
                    for (let loc in tmpLocations[i].locations) {
                        this.locations.push(tmpLocations[i].locations[loc].name);
                    };
                }
                
                let tmpHostGroups = (await hostGroupService.List("spb01-puppet.lab.nordigy.ru")).data;
                for (let i in tmpHostGroups) {
                    if (tmpHostGroups[i].status == "pro" || tmpHostGroups[i].status == "dev") {
                        this.hostGroups.push(tmpHostGroups[i].name);
                    }
                }
            },

            async add_job() {
                this.working = true;
                let params = {
                    "swe_list": [],
                    "locations_list": []
                };

                params.swe_list = this.selected_hostGroups;
                params.locations_list = this.selected_locations.map(i => i.toLowerCase());

                this.output =  `==>\n${ JSON.stringify(params, null, 2) }`;

                try {
                    let resp = (await jobsService.Add(params)).data;
                    this.output += `\n<==\n${ JSON.stringify(resp, null, 2) }`;
                } catch (e) {
                    console.error(e);
                    this.output += `\n<==\n${ JSON.stringify(e, null, 2) }`;
                }
                this.working = false;
            },

            async start_job(job_id) {
                try {
                    await jobsService.Start(job_id);
                    this.jobs = (await jobsService.GetAll()).data;
                    this.$forceUpdate();
                } catch (e) {
                    console.error(e);
                }
            }
        },
    }
</script>

<style scoped>
.full-height {
    height: 50%;
}
</style>