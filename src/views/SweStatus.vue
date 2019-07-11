<template>
    <v-container>
        <v-item-group>
            <v-container grid-list-md>
                <v-layout wrap>
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
                                </v-card-title>
                                <v-card-text>
                                    <v-hover v-for="e in env" :key="e.name">
                                        <v-btn
                                                slot-scope="{ hover }"
                                                v-if="e.state==='absent'"
                                                :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                class="mx-auto danger"
                                                color="error"
                                                @click="showSweDialog(host, e.name)"
                                                small>{{e.name}}
                                        </v-btn>
                                        <v-btn
                                                v-else-if="e.state==='outdated'"
                                                slot-scope="{ hover }"
                                                :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                class="mx-auto"
                                                color="warning"
                                                @click="showSweDialog(host, e.name)"
                                                small>{{e.name}}
                                        </v-btn>
                                        <v-btn
                                                v-else
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
                max-width="800"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#7ac2ff">
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
                                <v-chip class="error" label>No Code on host</v-chip>
                            </div>
                            <div v-else class="ml-5">
                                <p><v-chip label>Last Author:</v-chip>{{svnInfo.last_author}}</p>
                                <p><v-chip label>Last changes on revision:</v-chip>{{svnInfo.last_rev}}</p>
                                <p><v-chip label>Current revision:</v-chip>{{svnInfo.revision}}</p>
                                <p><v-chip label>Updated:</v-chip>{{svnInfo.last_date}}</p>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-btn v-if="!svn_get_error" @click="showSweChangesDialog()">changes</v-btn>
                    <v-btn>update</v-btn>
                    <v-btn v-if="!svn_get_error">update puppet classes</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialog = !dialog">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- ======================================================================================================= -->
        <v-dialog
                v-model="dialogChanges"
                max-width="1024"
        >
            <v-card>
                <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>

                <v-card-text>
                    <v-layout row>
                    </v-layout>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="dialogChanges = !dialogChanges">close</v-btn>
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
        data: () => ({
            environments: [],
            full_environments: [],
            svnInfo: [],
            swe_loading: false,
            svn_get_error: false,
            filter: null,
            dialog: false,
            dialogChanges: false,
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
            async showSweDialog (host, e) {
                this.svn_get_error = false;
                this.swe_loading = true;
                this.svnInfo = [];
                this.dialogTitle = `${e} on ${host}`;
                this.dialog = true;
                try {
                    this.svnInfo = (await environmentService.SVNInfo(host, e)).data;
                } catch (e) {
                    console.info(e);
                    this.svn_get_error = true;
                } finally {
                    this.swe_loading = false;
                }
            },
            showSweChangesDialog () {
                this.dialogChanges = true;
            }
        }
    }
</script>

<style></style>
