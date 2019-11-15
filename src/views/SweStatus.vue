<template>
    <v-container>
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
                        <v-btn large flat @click="batchDialog()">BATCH</v-btn>
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
                                            <v-list-tile @click="editRepo(host)">
                                                <v-list-tile-title>SVN Repo</v-list-tile-title>
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
                                                @click="showSweDialog(host, e.name)"
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
                                                @click="showSweDialog(host, e.name)"
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
                                                @click="showSweDialog(host, e.name)"
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
                                                @click="showSweDialog(host, e.name)"
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
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>

                <v-card-text>
                    <v-layout row>
                        <v-flex v-if="swe_loading" xs12 class="text-xs-center pt-2">
                            <fingerprint-spinner
                                    class="spinner"
                                    :animation-duration="1500"
                                    :size="64"
                                    color="#7ac2ff"
                            />
                        </v-flex>
                        <v-flex v-else xs12>
                            <div v-if="svn_get_error">
                                <v-alert
                                        v-model="svn_get_error_msg"
                                        type="error"
                                >
                                    {{svn_get_error_msg}}
                                </v-alert>
                            </div>
                            <div v-else>
                                <v-layout row>
                                    <v-flex v-if="swe_updating" xs6 class="text-xs-center mt-5">
                                        <fingerprint-spinner
                                                class="spinner"
                                                :animation-duration="1500"
                                                :size="64"
                                                color="#7ac2ff"
                                        />
                                    </v-flex>
                                    <v-flex  v-else xs6>
                                        <v-card v-if="svnInfo.directory.entry">
                                            <v-toolbar class="text-xs-center" dark color="#218ce0">
                                                <v-toolbar-title>Directory</v-toolbar-title>
                                                <v-spacer></v-spacer>
                                            </v-toolbar>
                                            <v-card-text>
                                                <p><v-chip label>Last Author:</v-chip>{{svnInfo.directory.entry.commit.author}}</p>
                                                <p><v-chip label>Last changes on revision:</v-chip>{{svnInfo.directory.entry.commit.revision}}</p>
                                                <p><v-chip label>Current revision:</v-chip>{{svnInfo.directory.entry.revision}}</p>
                                                <p><v-chip label>Updated:</v-chip>{{svnInfo.directory.entry.commit.date.split(".")[0].split("T").join(" ")}}</p>
                                            </v-card-text>
                                        </v-card>
                                    </v-flex>
                                    <v-flex ml-2 xs6>
                                        <v-card v-if="svnInfo.repository.entry">
                                            <v-toolbar class="text-xs-center" dark color="#43b3c1">
                                                <v-toolbar-title>Repository</v-toolbar-title>
                                                <v-spacer></v-spacer>
                                            </v-toolbar>
                                            <v-card-text>
                                                <p><v-chip label>Last Author:</v-chip>{{svnInfo.repository.entry.commit.author}}</p>
                                                <p><v-chip label>Last changes on revision:</v-chip>{{svnInfo.repository.entry.commit.revision}}</p>
                                                <p><v-chip label>Current revision:</v-chip>{{svnInfo.repository.entry.revision}}</p>
                                                <p><v-chip label>Updated:</v-chip>{{svnInfo.repository.entry.commit.date.split(".")[0].split("T").join(" ")}}</p>
                                            </v-card-text>
                                        </v-card>
                                    </v-flex>
                                </v-layout>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-btn v-if="!svn_get_error" @click="showSweChangesDialog()">LOG</v-btn>

                    <v-btn
                            v-if="!svnInfo.directory.last_rev"
                            @click="uploadSWE()"
                    >
                        upload
                    </v-btn>
                    <v-btn
                            v-else-if="svnInfo.directory.last_rev !== svnInfo.repository.last_rev"
                            @click="updateSWE()"
                    >
                        update
                    </v-btn>
<!--                    <v-btn v-if="!svn_get_error">update puppet classes</v-btn>-->

                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialog = !dialog">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialogChanges"
                max-width="1800"
                scrollable
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>

                <v-card-text>
                    <v-layout row>
                        <v-flex xs12>
                            <v-card
                                v-for="(i, key) in svnLog.log_entry"
                                :key="key"
                            >
                                <v-layout row>
                                    <v-flex xs2>
                                        <v-chip label>Revision</v-chip> {{i.revision}}
                                    </v-flex>
                                    <v-flex xs3>
                                        <v-chip label>Author</v-chip> {{i.author}}
                                    </v-flex>
                                    <v-flex xs2>
                                        <v-chip label>Date</v-chip> {{i.date.split("T")[0]}}
                                    </v-flex>
                                    <v-flex xs5>
                                        <v-chip label>Msg</v-chip> {{i.msg}}
                                    </v-flex>
                                </v-layout>
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
                v-model="dialogEditRepo"
                max-width="800"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogEditRepo = !dialogEditRepo" icon><v-icon>close</v-icon></v-btn>
                </v-toolbar>

                <v-card-text>
                    <v-layout row>
                        <v-flex xs12>
                            <v-text-field
                                    label="Repository URL"
                                    v-model="svn_repo"
                                    outline
                                    clearable
                            ></v-text-field>
                            <v-label>must be a full path to environment directory</v-label>
                        </v-flex>
                    </v-layout>
                </v-card-text>

                <v-card-actions>
                    <v-btn @click="submitRepo()">save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialogAddEnvironment"
                max-width="800"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogAddEnvironment = !dialogAddEnvironment" icon><v-icon>close</v-icon></v-btn>
                </v-toolbar>

                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs12 v-if="newEnvError">
                            <v-alert
                                v-model="newEnvError"
                                dismissible
                                type="error"
                            >{{newEnvError}}</v-alert>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field
                                    label="Environment Name"
                                    v-model="newEnvName"
                                    outline
                                    clearable
                            ></v-text-field>
                        </v-flex>
                    </v-layout>
                </v-card-text>

                <v-card-actions>
                    <v-btn @click="addNewEnvironment()">Add</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
                v-model="dialogAddEnvironmentProgress"
                max-width="800"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogAddEnvironmentProgress = !dialogAddEnvironmentProgress" icon><v-icon>close</v-icon></v-btn>
                </v-toolbar>

                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <table class="checkTable">
                                <thead>
                                <tr><th></th></tr>
                                <tr><th></th></tr>
                                <tr><th></th></tr>
                                </thead>
                                <tbody v-for="(i, idx) in addSteps" :key="idx">
                                    <tr v-if="i.show">
                                        <th><v-btn icon><v-icon>{{i.icon}}</v-icon></v-btn></th>
                                        <th>{{i.title}}</th>
                                        <th>
                                            <v-chip v-if="i.msg"> <looping-rhombuses-spinner v-if="i.progress" class="ml-2" :animation-duration="2500"
                                                                                             :rhombus-size="15" color="#607d8b"/>{{i.msg}}</v-chip>
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialogBatchSwe"
                max-width="800"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                    <v-btn icon>
                        <v-icon>accessible_forward</v-icon>
                    </v-btn>
                    <v-toolbar-title>Batch Update</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogBatchSwe = !dialogBatchSwe" icon><v-icon>close</v-icon></v-btn>
                </v-toolbar>

                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <v-autocomplete
                                    clearable
                                    multiple
                                    v-model="toUpdate"
                                    :items="allSwe"
                                    label="SWE's to update/checkout"
                                    persistent-hint
                                    box
                            >
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs12>
                            <v-switch
                                    :disabled="true"
                                    v-model="checkoutIfReq"
                                    label="Auto checkout code"
                            ></v-switch>
                        </v-flex>
                    </v-layout>
                </v-card-text>

                <v-card-actions>
                    <v-btn @click="batchStart()">Update</v-btn>
                    <v-spacer></v-spacer>
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
            dialogAddEnvironment: false,
            dialogAddEnvironmentProgress: false,
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
        },

        watch: {
            nowActions: {
                async handler (val) {
                    await Common.webSocketParser(val, this);

                    // if (this.environments[val.host]) {
                    //     for (let i in this.environments[val.host]) {
                    //         if (val.actions === this.environments[val.host][i].name) {
                    //             if (val.state === "checking ...") {
                    //                 this.environments[val.host][i].loading = true;
                    //             } else if (val.state === "done ...") {
                    //                 this.environments[val.host][i].loading = false;
                    //                 this.svnInfo = (await environmentService.SVNInfo(val.host, val.actions)).data;
                    //                 this.environments = (await environmentService.ListAll()).data;
                    //                 this.full_environments = (await environmentService.ListAll()).data;
                    //                 this.$forceUpdate();
                    //             }
                    //         } else {
                    //             this.environments[val.host][i].ws_message = false;
                    //         }
                    //     }
                    // }
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

            async addNewEnvironment() {
                if (!this.newEnvName || this.newEnvName === "") {
                    this.newEnvError = "Name required";
                } else {
                    this.dialogAddEnvironmentProgress = true;
                    this.dialogTitle = `Adding ${this.newEnvName} to ${this.dialogHost}`;

                    for (let i in this.addSteps) {
                        this.addSteps[i].msg = null;
                        if (this.addSteps.hasOwnProperty(i)) {
                            switch (i) {
                                case "1":
                                    this.addSteps[i].icon = "play_arrow";
                                    this.addSteps[i].progress = true;
                                    try {
                                        let msg = "";
                                        let response = (await environmentService.SVNInfo(this.dialogHost, this.newEnvName)).data;
                                        if (response.directory.entry.path === "not exist") {
                                            msg += `Directory ${this.newEnvName} not exist, `
                                        } else {
                                            msg += `Directory ${this.newEnvName} already exist, `
                                        }
                                        if (response.repository.entry.path === "not exist") {
                                            msg += `code ${this.newEnvName} not exist`;
                                            this.addSteps[i].msg = msg;
                                            this.addSteps[i].icon = "warning";
                                            this.addSteps[i].progress = false;
                                            // return;
                                        } else {
                                            msg += `code ${this.newEnvName} exist`;
                                        }
                                        this.addSteps[i].msg = msg;
                                        console.log(response);
                                    } catch (e) {
                                        console.log(e);
                                        this.addSteps[i].icon = "warning";
                                        this.addSteps[i].progress = false;
                                        return;
                                    }

                                    this.addSteps[i].icon = "check";
                                    this.addSteps[i].progress = false;
                                    break;
                                case "2":
                                    let msg = "";
                                    this.addSteps[i].icon = "play_arrow";
                                    this.addSteps[i].progress = true;
                                    try {
                                        let response = (await environmentService.ForemanID({host: this.dialogHost, env: this.newEnvName})).data;
                                        if (response !== -1) {
                                            this.addSteps[i].msg = `${this.newEnvName} exist on the foreman`;
                                            this.addSteps[i].icon = "warning";
                                            this.addSteps[i].progress = false;
                                            // return;
                                        } else {
                                            this.addSteps[i].msg = "Submitting ...";
                                            response = (await environmentService.Submit({host: this.dialogHost, env: this.newEnvName})).data;
                                            this.addSteps[i].msg = "Updating db ...";
                                            await environmentService.Update(this.dialogHost);
                                            this.addSteps[i].msg = "Done";
                                        }
                                    } catch (e) {
                                        console.log(e);
                                        this.addSteps[i].msg = e.message;
                                        this.addSteps[i].icon = "warning";
                                        this.addSteps[i].progress = false;
                                        return;
                                    }
                                    this.addSteps[i].msg = msg;
                                    this.addSteps[i].icon = "check";
                                    this.addSteps[i].progress = false;
                                    break;
                                case "3":
                                    this.addSteps[i].icon = "play_arrow";
                                    this.addSteps[i].progress = true;
                                    try {
                                        let postParams = {
                                            "host": this.dialogHost,
                                            "environment": this.newEnvName,
                                        };
                                        this.addSteps[i].msg = "Getting code ...";
                                        let response = (await environmentService.SVNRepoCheckout(postParams)).data;
                                        if (response.indexOf("Checked out revision") !== -1) {
                                            this.addSteps[i].msg = response.split(" ")[3].substring(0, response[3].length-1);
                                        }
                                        this.addSteps[i].msg = "Done";

                                    } catch (e) {
                                        console.log(e);
                                        this.addSteps[i].icon = "warning";
                                        this.addSteps[i].progress = false;
                                        return;
                                    }
                                    this.addSteps[i].icon = "check";
                                    this.addSteps[i].progress = false;
                                    break;
                                case "4":
                                    this.addSteps[i].icon = "play_arrow";
                                    this.addSteps[i].progress = true;
                                    try {
                                        let postParams = {
                                            "host": this.dialogHost,
                                            "environment": this.newEnvName,
                                            "dry_run": false,
                                        };
                                        this.addSteps[i].msg = "Importing classes ...";
                                        let response = (await environmentService.SVNForemanUpdate(postParams)).data;
                                        let jsData = JSON.parse(response);
                                        if (jsData.hasOwnProperty("message")) {
                                            this.addSteps[i].msg = "Classes imported";
                                        }
                                    } catch (e) {
                                        console.log(e);
                                        this.addSteps[i].icon = "warning";
                                        this.addSteps[i].progress = false;
                                        return;
                                    }
                                    this.addSteps[i].icon = "check";
                                    this.addSteps[i].progress = false;
                                    break;
                                default:
                                    this.addSteps[i].icon = "warning";
                                    this.addSteps[i].progress = false;
                                    console.error("opa");
                            }
                        }
                    }
                }
                this.environments = (await environmentService.ListAll()).data;
                this.full_environments = (await environmentService.ListAll()).data;
                this.$forceUpdate();
            },

            batchDialog () {
                this.dialogBatchSwe = true;
                for (let i in this.full_environments) {
                    let host = this.full_environments[i];
                    for (let j in host) {
                        if (!this.allSwe.includes(host[j].name)) {
                            this.allSwe.push(host[j].name);
                        }
                    }
                }
                this.allSwe.sort(function (a, b) {
                    return ('' + a).localeCompare(b);
                });
            },

            async batchStart() {

                let post_data = {};

                for (let j in this.environments) {
                    post_data[j] = [];
                }

                for (let i in this.toUpdate) {
                    for (let j in this.environments) {
                        for (let k in this.environments[j]) {
                            if (this.environments[j][k].name === this.toUpdate[i]) {
                                post_data[j].push(this.environments[j][k].name);
                            }
                        }
                    }
                }


                environmentService.SVNBatch(post_data);

                this.$forceUpdate();
                this.dialogBatchSwe = false;
            },

            async showSweDialog (host, e) {
                this.svn_get_error = false;
                this.swe_loading = true;
                this.svnInfo = {
                    repository: {},
                    directory: {},
                };
                this.dialogTitle = `${e} on ${host}`;
                this.dialog = true;
                try {
                    this.svnInfo = (await environmentService.SVNInfo(host, e)).data;
                } catch (e) {
                    this.svn_get_error = true;
                    this.svn_get_error_msg = e.response.data;
                } finally {
                    this.dialogHost = host;
                    this.dialogSwe = e;
                    this.swe_loading = false;
                }
            },
            async showSweChangesDialog () {
                this.swe_loading = true;
                try {
                    this.svnLog = (await environmentService.SVNLog(this.dialogHost, this.dialogSwe)).data;
                } catch (e) {
                    console.info(e);
                } finally {
                    this.swe_loading = false;
                    this.dialogChanges = true;
                }
            },
            async editRepo (host) {
                this.dialogTitle = `Repo URL for ${host}`;
                try {
                    this.svn_repo = (await environmentService.SVNRepo(host)).data;
                } catch (e) {
                    console.info(e);
                } finally {
                    this.dialogHost = host;
                    this.dialogEditRepo = true;
                }
            },

            async addEnvironment (host) {
                this.dialogTitle = `Add Environment to ${host}`;
                this.dialogHost = host;
                this.dialogAddEnvironment = true;
                this.addSteps = {
                    1: { title: "Checking", icon: "pause", progress: false, msg: null, show: true},
                    2: { title: "Adding to Foreman", icon: "pause", progress: false, msg: null, show: true},
                    3: { title: "Getting code", icon: "pause", progress: false, msg: null, show: true},
                    4: { title: "Importing Classes", icon: "pause", progress: false, msg: null, show: true},
                };
            },

            async submitRepo () {
                try {
                    await environmentService.SVNRepoSubmit(this.dialogHost, this.svn_repo);
                } catch (e) {
                    console.info(e);
                } finally {
                    this.dialogEditRepo = false;
                }
            },
            async updateSWE () {
                let postParams = {
                    "host":        this.dialogHost,
                    "environment": this.dialogSwe,
                };
                this.swe_updating = true;
                try {
                    await environmentService.SVNRepoUpdate(postParams);
                    this.svnLog = (await environmentService.SVNInfo(this.dialogHost, this.dialogSwe)).data;
                } catch (e) {
                    console.info(e);
                } finally {
                    this.svnInfo = (await environmentService.SVNInfo(host, e)).data;
                    this.environments = (await environmentService.ListAll()).data;
                    this.full_environments = (await environmentService.ListAll()).data;
                    this.$forceUpdate();
                    this.swe_updating = false;
                }
            },
            async uploadSWE () {
                let postParams = {
                    "host":        this.dialogHost,
                    "environment": this.dialogSwe,
                };
                this.swe_updating = true;
                try {
                    await environmentService.SVNRepoCheckout(postParams);
                    this.svnLog = (await environmentService.SVNInfo(this.dialogHost, this.dialogSwe)).data;
                } catch (e) {
                    console.info(e);
                } finally {
                    this.svnInfo = (await environmentService.SVNInfo(this.dialogHost, this.dialogSwe)).data;
                    this.environments = (await environmentService.ListAll()).data;
                    this.full_environments = (await environmentService.ListAll()).data;
                    this.$forceUpdate();
                    this.swe_updating = false;
                }
            },
        }
    }
</script>

<style>
    .checkTable {
        margin: 0 auto;
        min-width: 400px;
    }
</style>
