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
                            v-if="!svnInfo.directory"
                            @click="uploadSWE()"
                    >
                        upload
                    </v-btn>
                    <v-btn
                            v-else
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
                    <v-btn @click="addNewEnvironment(true)">Add</v-btn>
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

                            <v-autocomplete
                                    clearable
                                    multiple
                                    v-if="checkoutIfReq"
                                    v-model="selectHosts"
                                    :items="hosts"
                                    label="Select hosts"
                                    persistent-hint
                                    box
                            >
                            </v-autocomplete>

                            <div v-if="checkoutIfReq">
                                <v-btn small @click="fillHosts('all')">ALL</v-btn>
                                <v-btn small @click="fillHosts('prod')">PRO</v-btn>
                                <v-btn small @click="fillHosts('stage')">STAGE</v-btn>
                            </div>

                        </v-flex>
                        <v-flex xs12>
                            <v-switch
                                    v-model="checkoutIfReq"
                                    label="Checkout code"
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

        <v-dialog
                v-model="dialogBatchSweRunning"
                max-width="800"
        >
            <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click.native="dialogBatchSweRunning = !dialogBatchSweRunning" icon><v-icon>close</v-icon></v-btn>
            </v-toolbar>

            <v-card>
                <v-card-text>
                    <v-layout row wrap v-for="(envs, host) in progressStruct" :key="host">
                        <v-flex xs12>
                            <v-chip label>{{host}}</v-chip>
                        </v-flex>
                        <v-flex xs2 v-for="(env, idx) in envs" :key="idx">
                            <v-btn
                                    v-if="env.started"
                                    :loading="true"
                                    :disabled="true"
                                    small>
                                {{env.name}}
                            </v-btn>
                            <v-btn
                                    v-else-if="env.done && env.error"
                                    color="error"
                                    @click="showSweDialog(host, env.name)"
                                    small>
                                <v-icon dark>cancel</v-icon>
                                {{env.name}}
                            </v-btn>
                            <v-btn
                                    v-else-if="env.done && !env.error"
                                    color="success"
                                    @click="showSweDialog(host, env.name)"
                                    small>
                                <v-icon dark>check</v-icon>
                                {{env.name}}
                            </v-btn>
                            <v-btn
                                    v-else
                                    class="mx-auto"
                                    @click="showSweDialog(host, env.name)"
                                    small>
                                {{env.name}}
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-card>

            <hr>

            <v-card>

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

            let tmp = (await environmentService.ListAll()).data;
            for (let i in tmp) { tmp[i].sort(Common.dynamicSort("name")); }
            this.environments = tmp;
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

            fillHosts(env) {
                this.selectHosts = [];
                if (env === "all") {
                    this.selectHosts = this.hosts;
                } else {
                    for (let i in this.environments) {
                        for (let k in this.environments[i]) {
                            if (this.environments[i][k].env === env) {
                                this.selectHosts.push(i);
                                break
                            }
                        }
                    }
                }
            },

            async checks(step, hostname, envName) {
                this.addSteps[step].icon = "play_arrow";
                this.addSteps[step].progress = true;
                try {
                    let msg = "";
                    let response = (await environmentService.SVNInfo(hostname, envName)).data;
                    if (response.directory.entry.path === "not exist") {
                        msg += `Directory ${envName} not exist, `
                    } else {
                        msg += `Directory ${envName} already exist, `
                    }
                    this.addSteps[step].msg = msg;
                    console.log(response);
                } catch (e) {
                    console.warn(e);
                    this.addSteps[step].icon = "warning";
                    this.addSteps[step].progress = false;
                    return e;
                }
                this.addSteps[step].icon = "check";
                this.addSteps[step].progress = false;
            },

            async submitNewEnv(step, hostname, envName) {
                let msg = "";
                this.addSteps[step].icon = "play_arrow";
                this.addSteps[step].progress = true;
                try {
                    let response = (await environmentService.ForemanID({host: hostname, env: envName})).data;
                    if (response !== -1) {
                        this.addSteps[step].msg = `${envName} exist on the foreman`;
                        this.addSteps[step].icon = "warning";
                        this.addSteps[step].progress = false;
                    } else {
                        this.addSteps[step].msg = "Submitting ...";
                        response = (await environmentService.Submit({host: hostname, env: envName})).data;
                        this.addSteps[step].msg = "Done";
                    }
                } catch (e) {
                    console.log(e);
                    this.addSteps[step].msg = e.message;
                    this.addSteps[step].icon = "warning";
                    this.addSteps[step].progress = false;
                    return e;
                }
                this.addSteps[step].msg = msg;
                this.addSteps[step].icon = "check";
                this.addSteps[step].progress = false;
            },

            async svnCode(step, hostname, envName) {
                this.addSteps[step].icon = "play_arrow";
                this.addSteps[step].progress = true;
                try {
                    let postParams = {
                        "host": hostname,
                        "environment": envName,
                    };
                    this.addSteps[step].msg = "Getting code ...";
                    let response = (await environmentService.SVNRepoCheckout(postParams)).data;
                    if (response.indexOf("Checked out revision") !== -1) {
                        this.addSteps[step].msg = response.split(" ")[3].substring(0, response[3].length-1);
                    }
                    this.addSteps[step].msg = "Done";

                } catch (e) {
                    console.log(e);
                    this.addSteps[step].icon = "warning";
                    this.addSteps[step].msg = e.message;
                    this.addSteps[step].progress = false;
                    return e;
                }
                this.addSteps[step].icon = "check";
                this.addSteps[step].progress = false;
            },

            async foremanImport(step, hostname, envName) {
                this.addSteps[step].icon = "play_arrow";
                this.addSteps[step].progress = true;
                try {
                    let postParams = {
                        "host": hostname,
                        "environment": envName,
                        "dry_run": false,
                    };
                    this.addSteps[step].msg = "Importing classes ...";
                    let response = (await environmentService.SVNForemanUpdate(postParams)).data;
                    let jsData = JSON.parse(response);
                    if (jsData.hasOwnProperty("message")) {
                        this.addSteps[step].msg = "Classes imported";
                    }
                } catch (e) {
                    console.log(e);
                    this.addSteps[step].icon = "warning";
                    this.addSteps[step].progress = false;
                    return e;
                }
                this.addSteps[step].icon = "check";
                this.addSteps[step].progress = false;
            },

            async addNewEnvironment(showDialog) {
                let envName = this.newEnvName;
                let hostname = this.dialogHost;

                this.checkoutIfReq = false;
                if (!envName || envName === "") {
                    this.newEnvError = "Name required";
                } else {
                    if (showDialog) {
                        this.dialogAddEnvironmentProgress = true;
                    }
                    this.dialogTitle = `Adding ${envName} to ${hostname}`;

                    for (let i in this.addSteps) {
                        this.addSteps[i].msg = null;
                        if (this.addSteps.hasOwnProperty(i)) {
                            switch (i) {
                                case "1":
                                    let err1 = await this.checks(i, hostname, envName);
                                    if (err1) {
                                        return err1;
                                    }
                                    break;

                                case "2":
                                    let err2 = await this.submitNewEnv(i, hostname, envName);
                                    if (err2) {
                                        return err2;
                                    }
                                    break;

                                case "3":
                                    let err3 = await this.svnCode(i, hostname, envName);
                                    if (err3) {
                                        return err3;
                                    }
                                    break;

                                case "4":
                                    let err4 = await this.foremanImport(i, hostname, envName);
                                    if (err4) {
                                        return err4;
                                    }
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
                if (this.checkoutIfReq) {
                    this.dialogBatchSwe = false;

                    this.progressStruct = {};

                    for (let h in this.selectHosts) {
                        this.progressStruct[this.selectHosts[h]] = [];
                    }

                    for (let h in this.selectHosts) {
                        for (let e in this.toUpdate) {
                            this.progressStruct[this.selectHosts[h]].push({
                                name: this.toUpdate[e],
                                started: false,
                                done: false,
                                error: false,
                            });
                        }
                    }

                    this.dialogBatchSweRunning = true;

                    console.time("be");

                    for (let h in this.progressStruct) {
                        for (let e in this.progressStruct[h]) {
                            this.addSteps = {
                                1: {title: "Checking", icon: "pause", progress: false, msg: null, show: true},
                                2: {title: "Adding to Foreman", icon: "pause", progress: false, msg: null, show: true},
                                3: {title: "Getting code", icon: "pause", progress: false, msg: null, show: true},
                                4: {title: "Importing Classes", icon: "pause", progress: false, msg: null, show: true},
                            };

                            try {
                                this.newEnvName = this.progressStruct[h][e].name;
                                this.dialogHost = h;
                                this.progressStruct[h][e].started = true;
                                let err = await this.addNewEnvironment(false);
                                if (err) {
                                    this.progressStruct[h][e].error = true;
                                }
                                this.progressStruct[h][e].started = false;
                            } catch (e) {
                                console.warn(e);
                            } finally {
                                this.progressStruct[h][e].done = true;
                                this.$forceUpdate();
                            }
                        }
                    }

                    console.timeEnd("be");

                } else {
                    let postParams = {};
                    for (let j in this.environments) {
                        postParams[j] = [];
                    }
                    for (let i in this.toUpdate) {
                        for (let j in this.environments) {
                            let envItem = {
                                icon: "pause",
                                name: "",
                                msg: "",
                                progress: false,
                            };
                            for (let k in this.environments[j]) {
                                if (this.environments[j][k].name === this.toUpdate[i]) {
                                    postParams[j].push(this.environments[j][k].name);
                                    envItem.name = this.environments[j][k].name;
                                }
                            }
                        }
                    }
                    this.dialogBatchSwe = false;
                    environmentService.SVNBatch(postParams);
                    this.$forceUpdate();
                }
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
                    this.svnInfo = (await environmentService.SVNInfo(this.dialogHost, this.dialogSwe)).data;
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
        /*margin: 0 auto;*/
        min-width: 400px;
    }
</style>
