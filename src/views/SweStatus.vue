<template>
    <v-container>
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
<!--                    <v-flex xs2>-->
<!--                        <v-btn large flat @click="batchDialog()">BATCH UPDATE</v-btn>-->
<!--                    </v-flex>-->
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
                            <div v-if="svn_get_error" class="ml-5">
                                <v-chip class="error" label>No Code</v-chip>
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
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogEditRepo = !dialogEditRepo">close</v-btn>
                </v-card-actions>
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
                </v-toolbar>

                <v-card-text>
                    <v-layout row>
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
                    </v-layout>
                </v-card-text>

                <v-card-actions>
                    <v-btn @click="batchStart()">Update</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogBatchSwe = !dialogBatchSwe">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
    import {Common} from "./methods"
    import { environmentService } from "../_services"
    import {FingerprintSpinner} from 'epic-spinners'

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
            swe_loading: false,
            swe_updating: false,
            svn_get_error: false,
            svn_repo: null,
            filter: null,
            repo: null,
            dialogHost: null,
            dialogSwe: null,
            dialog: false,
            dialogChanges: false,
            dialogEditRepo: false,
            dialogBatchSwe: false,
            dialogTitle: null,
        }),

        components: {
            FingerprintSpinner
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

            batchStart() {

                let post_data = {};

                for (let i in this.toUpdate) {
                    for (let j in this.environments) {
                        post_data[j] = [];
                        for (let k in this.environments[j]) {
                            if (this.environments[j][k].name === this.toUpdate[i]) {
                                this.environments[j][k].loading = true;
                                try {
                                    post_data[j].push(this.environments[j][k].name);
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        }
                    }
                }

                console.log(post_data);
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
                    console.info(e);
                    this.svn_get_error = true;
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

<style></style>
