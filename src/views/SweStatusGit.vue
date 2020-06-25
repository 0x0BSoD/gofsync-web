<template>
    <v-container fluid>
        <v-item-group>
            <v-container grid-list-md>
                <v-layout row wrap>
                    <v-flex xs10>
                        <v-text-field
                                label="Filter"
                                v-model="filter"
                                outline
                                clearable
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs2>
                        <v-btn large flat @click="addEnvironment('')">ADD ENV</v-btn>
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
                                            <v-list-tile @click="addEnvironment(host)">
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
                v-model="dialogInfo"
                max-width="1000"
                scrollable
        >
            <v-card>
                <v-card-title>
                    <v-toolbar class="text-xs-center" dark color="#0066ff">
                        <v-toolbar-title>{{currentEnv}}</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <div><span class="grey--text"><v-chip dark>{{currentHost}}</v-chip></span><br></div>
                    </v-toolbar>
                </v-card-title>


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

                    <v-layout v-else-if="pulling" row wrap>
                        <v-flex xs12>Updating ...</v-flex>
                        <v-flex xs12>
                            <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
                        </v-flex>
                    </v-layout>

                    <v-layout v-else-if="cloning" row wrap>
                        <v-flex xs12>Uploading ...</v-flex>
                        <v-flex xs12>
                            <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
                        </v-flex>
                    </v-layout>

                    <v-layout row wrap v-else-if="noRepo">
                        <v-flex xs12>
                            <v-alert
                                    v-model="noRepo"
                                    type="warning"
                            >
                                Environment repo not exist on the host probably.
                            </v-alert>
                        </v-flex>
                    </v-layout>

                    <v-layout row wrap v-else>
                        <v-flex xs12>
                            <v-alert
                                    v-model="noChangesInCommit"
                                    dismissible
                                    type="success"
                            >
                                Already on last commit
                            </v-alert>
                        </v-flex>
                        <v-flex xs12 v-if="lastCommit">
                            <table>
                                <thead>
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
                            <v-card class="mb-2" v-for="(d, k) in lastCommit.Diffs" :key="k">
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
                    <v-btn v-if="noRepo" @click="gitClone()">Upload</v-btn>
                    <v-btn v-else @click="gitPull()">Update</v-btn>
                    <v-btn @click="showLogDialog()" :disabled="noRepo">Log</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogInfo = !dialogInfo">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialogChanges"
                max-width="1000"
                fullscreen
                hide-overlay
                transition="dialog-bottom-transition"
        >
            <v-card
                class="hide-overflow"
                style="position: relative;"
            >
                <v-card-title>
                    <v-toolbar
                        class="text-xs-center"
                        dark
                        color="#0066ff"
                        scroll-off-screen
                        scroll-target="#scrolling-techniques"
                    >
                        <v-toolbar-title>Code Log</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                </v-card-title>


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
                    <v-layout v-else row>
                        <v-flex xs12 v-if="fullRepoLog">
                            <v-card v-for="(d, k) in fullRepoLog.Diffs" :key="k">
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
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogChanges = !dialogChanges">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialogCommitsLog"
                max-width="1200"
                scrollable
        >
            <v-card>
                <v-card-title>
                    <v-toolbar class="text-xs-center" dark color="#0066ff">
                        <v-toolbar-title>Log of Commits</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                </v-card-title>

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
                            <table v-if="logCommits" class="logTable">
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
                                        <td>{{i.Date.split("T")[0]}}</td>
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

        <v-dialog
                v-model="dialogAddEnvironment"
                max-width="800"
                persistent
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                    <v-toolbar-title>Adding new environment</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogAddEnvironment = !dialogAddEnvironment" icon><v-icon>close</v-icon></v-btn>
                </v-toolbar>

                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs10>
                            <v-autocomplete
                                    solo
                                    label="Environments"
                                    multiple
                                    v-model="selectedBranches"
                                    :items="branches"
                                    clearable
                            ></v-autocomplete>
                        </v-flex>

                        <v-flex xs2>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn @click="addAllBranches()" color="primary" dark v-on="on">ADD ALL</v-btn>
                                </template>
                                <span>All with SWE</span>
                            </v-tooltip>
                        </v-flex>

                        <v-flex xs12>
                            <v-autocomplete
                                    solo
                                    label="Hosts"
                                    multiple
                                    v-model="selectedHosts"
                                    :items="hosts"
                                    clearable
                            ></v-autocomplete>
                        </v-flex>
                    </v-layout>
                </v-card-text>

                <v-card-actions>
                    <v-btn :disabled="selectedHosts.length === 0 || selectedBranches.length === 0" @click="submit()">Submit</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
                v-model="dialogAddEnvironmentProgress"
                max-width="800">
            <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                <v-toolbar-title>Adding new environment ...</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click.native="dialogAddEnvironmentProgress = !dialogAddEnvironmentProgress" icon><v-icon>close</v-icon></v-btn>
            </v-toolbar>
            <v-card>
                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs12 v-for="(items,host) in progressStruct" :key="host">
                            <v-card>
                                <v-card-title>
                                    <div><span class="grey--text"><v-chip dark>{{host}}</v-chip></span><br></div>
                                </v-card-title>
                                <v-card-text v-for="(i,k) in items" :key="k">
                                    <v-layout row wrap>
                                        <v-flex xs12>
                                            <v-card>
                                                <v-card-text>
                                                    <v-layout row wrap>
                                                        <v-flex xs3><v-chip label>{{ i.Name }}</v-chip></v-flex>
                                                        <v-flex xs2 v-if="i.InProgress">
                                                            <looping-rhombuses-spinner class="ml-2 mt-3" :animation-duration="2500"
                                                                                       :rhombus-size="15" color="#607d8b"/>
                                                        </v-flex>
                                                        <v-flex xs3 v-if="i.Message && i.Message.length > 0" class="mt-2">{{ i.Message }}</v-flex>
                                                        <v-flex xs2 v-if="i.Exist && i.InProgress"><v-chip label color="primary">Updating</v-chip></v-flex>
                                                        <v-flex xs2 v-else-if="i.InProgress"><v-chip label color="primary">Uploading</v-chip></v-flex>
                                                        <v-flex xs2 v-if="i.Error"><v-chip label color="warning">Failed</v-chip></v-flex>
                                                        <v-flex xs2 v-if="i.Done"><v-chip label color="success">Done</v-chip></v-flex>
                                                    </v-layout>
                                                </v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-card-text>
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
            pulling: false,
            cloning: false,
            noChangesInCommit: false,
            noRepo: false,
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
            selectedHosts: [],
            environments: [],
            full_environments: [],
            filter: null,
            repo: null,
            dialogInfo: false,
            dialogChanges: false,
            dialogEditRepo: false,
            dialogBatchSwe: false,
            dialogBatchSweRunning: false,
            dialogAddEnvironment: false,
            dialogAddEnvironmentProgress: false,
            wip: true,
            selectedBranches: [],
            branches: [],
            progressStruct: {},
        }),

        components: {
            FingerprintSpinner,
            LoopingRhombusesSpinner
        },

        async mounted() {
            // User check ==========================================
            await Common.auth(this);

            // ======
            await this.loadEnvs();
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

            async loadEnvs() {
                let tmp = (await environmentService.ListAll(true)).data;

                for (let i in tmp) { tmp[i].sort(Common.dynamicSort("name")); }

                this.environments = tmp;
                this.full_environments = (await environmentService.ListAll(true)).data;
                for (let i in this.environments) {
                    this.hosts.push(i);
                }
            },

            async gitClone() {
                this.cloning = true;

                let resp = await environmentService.GitClone(this.currentHost, this.currentEnv);
                console.info(resp.data);

                this.noRepo = false;
                this.lastCommit = (await environmentService.GitLog(this.currentHost, this.currentEnv, "HEAD")).data;
                this.pulling = false;
                await this.loadEnvs();
                this.$forceUpdate();

                this.cloning = false;
            },

            async gitPull() {
                this.pulling = true;
                let old_date = this.lastCommit.Date;

                let resp = await environmentService.GitPull(this.currentHost, this.currentEnv);
                console.info(resp.data);

                this.lastCommit = (await environmentService.GitLog(this.currentHost, this.currentEnv, "HEAD")).data;
                if (old_date === this.lastCommit.Date) {
                    this.noChangesInCommit = true;
                }
                this.pulling = false;
                await this.loadEnvs();
                this.$forceUpdate();
            },

            async showFullLog(commit) {
                this.fullRepoLog = null;
                this.commitLoading = true;
                this.dialogChanges = true;
                this.fullRepoLog = (await environmentService.GitLog(this.currentHost, this.currentEnv, commit)).data;
                this.commitLoading = false;
            },

            async showLogDialog() {
                this.dialogCommitsLog = true;
                this.logLoading = true;
                this.logCommits = (await environmentService.GitLogEnv(this.currentHost, this.currentEnv)).data[this.currentHost][this.currentEnv];
                this.logLoading = false;
            },

            async showDialog(host, envName) {
                this.noRepo = false;
                this.commitLoading = true;
                this.lastCommit = null;
                this.dialogInfo = true;
                this.currentHost = host;
                this.currentEnv = envName;
                this.lastCommit = (await environmentService.GitLog(this.currentHost, this.currentEnv, "HEAD")).data;
                if (this.lastCommit.Author === "") {
                    this.noRepo = true;
                }
                this.commitLoading = false;
            },

            async addEnvironment(host) {

                this.selectedHosts = [];
                this.selectedBranches = [];

                if (host.length > 0) { this.selectedHosts.push(host) }
                this.dialogAddEnvironment = true;
                this.branches = (await environmentService.Branches()).data;
            },

            addAllBranches() {
                this.selectedBranches = this.branches.filter(i => i.includes("swe"));
            },

            async submit() {
                for (let i in this.selectedHosts) {
                    let host = this.selectedHosts[i];
                    let tmp = [];
                    for (let j in this.selectedBranches) {
                        let branch = this.selectedBranches[j];
                        tmp.push({
                            Name: branch,
                            InProgress: false,
                            Message: null,
                            Exist: false,
                            Done: false,
                            Error: false,
                        });
                    }
                    this.progressStruct[host] = tmp;
                }

                this.dialogAddEnvironment = false;
                this.dialogAddEnvironmentProgress = true;

                for (let host in this.progressStruct) {
                    for (let i in this.progressStruct[host]) {
                        this.progressStruct[host][i].InProgress = true;
                        this.progressStruct[host][i].Message = "Checking";
                        this.$forceUpdate();

                        let response = (await environmentService.GitLog(host, this.progressStruct[host][i].Name, "HEAD")).data;
                        if (response.Date === "0001-01-01T00:00:00Z") {
                            let resp = (await environmentService.ForemanID({host: host, env: this.progressStruct[host][i].Name})).data;
                            if (resp === -1) {
                                this.progressStruct[host][i].Message = "Creating environment ...";
                                this.$forceUpdate();
                                response = (await environmentService.Submit({host: host, env: this.progressStruct[host][i].Name})).data;
                            }
                            this.progressStruct[host][i].Message = "Cloning code ...";
                            this.$forceUpdate();
                            resp = await environmentService.GitClone(host, this.progressStruct[host][i].Name);
                            console.info(resp.data);
                        } else {
                            this.progressStruct[host][i].Exist = true;
                            this.progressStruct[host][i].Message = "Updating code ...";
                            this.$forceUpdate();
                            let resp = await environmentService.GitPull(host, this.progressStruct[host][i].Name);
                            console.info(resp.data);
                        }

                        let postParams = {
                            "host": host,
                            "environment": this.progressStruct[host][i].Name,
                            "dry_run": false,
                        };
                        try {
                            this.progressStruct[host][i].Message = "Importing classes ...";
                            this.$forceUpdate();
                            let resp = (await environmentService.SVNForemanUpdate(postParams));
                            console.info(resp.data);
                            this.progressStruct[host][i].Message = null;
                            this.progressStruct[host][i].Done = true;
                        } catch (e) {
                            this.progressStruct[host][i].Message = e.Message;
                            this.progressStruct[host][i].Error = true;
                        } finally {
                            this.progressStruct[host][i].InProgress = false;
                            await this.loadEnvs();
                            this.$forceUpdate();
                        }
                    }
                }
            },
        }
    }
</script>

<style scoped>
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
    .logTable {
        border-collapse: collapse;
        width: 100%;
    }
    th, td {
        text-align: left;
        padding: 8px;
    }
    tr:nth-child(even) {background-color: #f2f2f2;}
</style>
