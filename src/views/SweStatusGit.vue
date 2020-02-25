<template>
    <v-container fluid>
        <v-item-group>
            <v-container grid-list-md>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-text-field
                                label="Filter"
                                v-model="filter"
                                outline
                                clearable
                        ></v-text-field>
                    </v-flex>
                    <v-flex
                            v-for="(env, host) in environments"
                            :key="host"
                            xs12
                            md6
                            xl4
                    >
                        <v-item>
                            <v-card>
                                <v-card-title class="pr-0 pl-3 pt-0 pb-0">
                                    <v-btn flat small>{{host}}</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-menu bottom left>
                                        <template v-slot:activator="{ on }">
                                            <v-btn
                                                    icon
                                                    v-on="on"
                                            >
                                                <v-icon>more_vert</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-list>
                                            <v-list-tile :disabled="true" @click="addEnvironment(host)">
                                                <v-list-tile-title>Add Environment</v-list-tile-title>
                                            </v-list-tile>
                                        </v-list>
                                    </v-menu>
                                </v-card-title>
                                <v-card-text>
                                    <v-hover v-for="e in env" :key="e.name">
                                        <v-btn
                                                v-if="e.state==='absent'"
                                                :loading="e.loading"
                                                :disabled="e.loading"
                                                slot-scope="{ hover }"
                                                :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                class="mx-auto danger"
                                                color="error"
                                                @click="showDialog(host, e.name)"
                                                small>{{e.name}}
                                        </v-btn>
                                        <v-btn
                                                v-else-if="e.state==='outdated'"
                                                :loading="e.loading"
                                                :disabled="e.loading"
                                                slot-scope="{ hover }"
                                                :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                class="mx-auto"
                                                color="warning"
                                                @click="showDialog(host, e.name)"
                                                small>{{e.name}}
                                        </v-btn>
                                        <v-btn
                                                v-else-if="e.state==='error'"
                                                :loading="e.loading"
                                                :disabled="e.loading"
                                                slot-scope="{ hover }"
                                                :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                class="mx-auto"
                                                color="error"
                                                @click="showDialog(host, e.name)"
                                                small>
                                            <v-icon dark>cancel</v-icon>
                                            {{e.name}}
                                        </v-btn>
                                        <v-btn
                                                v-else
                                                :loading="e.loading"
                                                :disabled="e.loading"
                                                slot-scope="{ hover }"
                                                :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                class="mx-auto"
                                                color="success"
                                                @click="showDialog(host, e.name)"
                                                small>{{e.name}}
                                        </v-btn>
                                    </v-hover>
                                </v-card-text>

                            </v-card>
                        </v-item>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-item-group>


        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialog"
                max-width="1000"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#0066ff">
                    <v-toolbar-title>{{currentEnv}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <div><span class="grey--text">{{currentHost}}</span><br></div>
                </v-toolbar>

                <v-card-text>
                    <v-layout row wrap v-if="commitLoading">
                        <v-flex xs12 >
                            <fingerprint-spinner
                                    class="spinner"
                                    :animation-duration="1500"
                                    :size="64"
                                    color="#7ac2ff"
                            />
                        </v-flex>
                    </v-layout>

                    <v-layout row wrap v-else>
                        <v-flex xs12 v-if="lastCommit">
                            <table>
                                <thead>
                                <tr><th></th></tr>
                                <tr><th></th></tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><v-chip label>Date:</v-chip></td>
                                    <td>{{lastCommit.Date}}</td>
                                </tr>
                                <tr>
                                    <td><v-chip label>Author:</v-chip></td>
                                    <td>{{lastCommit.Author}}</td>
                                </tr>
                                <tr>
                                    <td><v-chip label>Comment:</v-chip></td>
                                    <td>{{lastCommit.Comment}}</td>
                                </tr>
                                </tbody>
                            </table>
                        </v-flex>
                        <v-flex xs12 v-if="lastCommit">
                            <v-card v-for="(d, k) in lastCommit.Diffs" :key="k">
                                <v-card-text>
                                    <v-layout row wrap>
                                        <v-flex xs12 v-for="(s, j) in d.split('\n')" :key="j">
                                            <pre v-if="s.startsWith('+')" class="added">{{s}}</pre>
                                            <pre v-else-if="s.startsWith('-')" class="removed">{{s}}</pre>
                                            <pre v-else>{{s}}</pre>
                                        </v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="dialog = !dialog">Update</v-btn>
                    <v-btn @click="showLogDialog()">Log</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialog = !dialog">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialogChanges"
                max-width="1000"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#0066ff">
                    <v-toolbar-title>Code Log</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>

                <v-card-text>
                    <v-layout row>
                        <v-flex xs12>
                            <pre>
                                {{fullRepoLog}}
                            </pre>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogChanges = !dialogChanges">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialogCommitsLog"
                max-width="1000"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#0066ff">
                    <v-toolbar-title>Log of Commits</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>

                <v-card-text>

                    <v-layout row wrap v-if="logLoading">
                        <v-flex xs12 >
                            <fingerprint-spinner
                                    class="spinner"
                                    :animation-duration="1500"
                                    :size="64"
                                    color="#7ac2ff"
                            />
                        </v-flex>
                    </v-layout>

                    <v-layout row wrap v-else>
                        <v-flex xs12>
                            <table v-if="logCommits">
                                <thead>
                                    <tr>
                                        <th>Author</th>
                                        <th>Date</th>
                                        <th>Comment</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(i,k) in logCommits" :key="k">
                                        <td>{{i.Author}}</td>
                                        <td>{{i.Date}}</td>
                                        <td>{{i.Comment}}</td>
                                        <td><v-btn small outline @click="showFullLog(k)">details</v-btn></td>
                                    </tr>
                                </tbody>
                            </table>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogCommitsLog = !dialogCommitsLog">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
    import {Common} from "./methods"
    import { environmentService } from "../_services"
    import {FingerprintSpinner, LoopingRhombusesSpinner} from 'epic-spinners'

    export default {

        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
        computed: {
            nowActions() {
                return this.$store.state.socketModule.socket.message;
            },
        },

        data: () => ({
            repoData: null,
            lastCommit: null,
            logCommits: null,
            fullRepoLog: null,
            currentHost: null,
            currentEnv: null,
            commitLoading: false,
            dialogCommitsLog: false,
            logLoading: false,
            // --------


            WSProgress: {
                errors: [],
                done: [],
                message: null,
                counter: {
                    current: null,
                    total: null,
                },
            },
            hosts: [],
            selectHosts: [],
            environments: [],
            full_environments: [],
            svnInfo: {
                repository: {},
                directory: {},
            },
            svnLog: [],
            allSwe: [],
            toUpdate: [],
            checkoutIfReq: false,
            swe_loading: false,
            swe_updating: false,
            svn_get_error: false,
            svn_get_error_msg: null,
            svn_repo: null,
            filter: null,
            repo: null,
            dialogHost: null,
            dialogSwe: null,
            newEnvName: null,
            newEnvError: null,
            dialog: false,
            dialogChanges: false,
            dialogEditRepo: false,
            dialogBatchSwe: false,
            dialogBatchSweRunning: false,
            dialogAddEnvironment: false,
            dialogAddEnvironmentProgress: false,
            progressStruct: {},
            dialogTitle: null,
            checkCode: false,
            importClasses: false,
            wip: true,
            addEnvStepNum: 1,
            addSteps: {
                1: { title: "Checking", icon: "pause", progress: false, msg: null, show: true},
                2: { title: "Adding to Foreman", icon: "pause", progress: false, msg: null, show: true},
                3: { title: "Getting code", icon: "pause", progress: false, msg: null, show: true},
                4: { title: "Importing Classes", icon: "pause", progress: false, msg: null, show: true},
            },
        }),

        components: {
            FingerprintSpinner,
            LoopingRhombusesSpinner
        },

        async mounted() {
            // User check ==========================================
            await Common.auth(this);

            // ======
            this.environments = (await environmentService.ListAll()).data;
            this.full_environments = (await environmentService.ListAll()).data;
            for (let i in this.environments) {
                this.hosts.push(i);
            }
        },

        watch: {
            nowActions: {
                async handler (message) {
                    if (message.hasOwnProperty("host_name")) {
                        if (message.additional_data.hasOwnProperty("item")) {

                            if (message.additional_data.hasOwnProperty("done")) {
                                if (message.additional_data.done) {
                                    (this.environments[message.host_name].filter(i => i.name === message.additional_data.item))[0]["loading"] = false;
                                }
                            } else if (message.additional_data.hasOwnProperty("failed")) {
                                if (message.additional_data.failed) {
                                    (this.environments[message.host_name].filter(i => i.name === message.additional_data.item))[0]["state"] = "error";
                                }
                            } else {
                                (this.environments[message.host_name].filter(i => i.name === message.additional_data.item))[0]["loading"] = true;
                            }
                            this.$forceUpdate();
                        }
                    }
                }
            },
            filter: {
                async handler (val) {
                    if (val && this.full_environments) {
                        for (let host in this.full_environments) {
                            this.environments[host] = [];
                            for (let i in this.full_environments[host]) {
                                if (this.full_environments[host][i].name.includes(val)) {
                                    this.environments[host].push(this.full_environments[host][i]);
                                }
                            }
                        }
                    } else {
                        this.environments = (await environmentService.ListAll()).data;
                    }
                }
            },
        },
        methods: {
            async showFullLog(commit) {
                this.fullRepoLog = null;
                this.dialogChanges = true;
                this.fullRepoLog = (await environmentService.GitLog(this.currentHost, this.currentEnv, commit)).data;
                console.log(this.fullRepoLog);
            },

            async showLogDialog() {
                this.dialogCommitsLog = true;
                this.logLoading = true;
                this.logCommits = (await environmentService.GitLogEnv(this.currentHost, this.currentEnv)).data[this.currentHost][this.currentEnv];
                this.logLoading = false;

                // this.repoData = [];
                // for (let i in tmp) {
                //     if (tmp[i] !== "") {
                //         if (tmp[i].indexOf("HEAD") !== -1) {
                //         } else {
                //             let splt = tmp[i].split(" ");
                //             this.repoData.push({
                //                 commit: splt[0],
                //                 ticket: splt[1],
                //                 msg: splt.splice(3).join(" "),
                //             });
                //         }
                //     }
                // }
            },

            async showDialog(host, envName) {
                this.commitLoading = true;
                this.lastCommit = null;
                this.dialog = true;
                this.currentHost = host;
                this.currentEnv = envName;
                this.lastCommit = (await environmentService.GitLog(this.currentHost, this.currentEnv, "HEAD")).data;
                this.commitLoading = false;
            }
        }
    }
</script>

<style>
    .added {
        background-color: lightgreen;
    }
    .removed {
        background-color: lightpink;
    }
    .checkTable {
        /*margin: 0 auto;*/
        min-width: 400px;
    }
</style>
