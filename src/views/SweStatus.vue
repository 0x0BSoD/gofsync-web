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
                                    <v-hover v-for="e in env" :key="e">
                                        <v-btn
                                                slot-scope="{ hover }"
                                                :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                class="mx-auto"
                                                @click="showSweDialog(host, e)"
                                                small>{{e}}
                                        </v-btn>
                                    </v-hover>
                                </v-card-text>

                            </v-card>
                        </v-item>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-item-group>


        <v-dialog
                v-model="dialog"
                max-width="500"
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
                                <v-chip class="warning" label>No Code on host</v-chip>
                            </div>
                            <div v-else class="ml-5">
                                <p><v-chip label>Last Author:</v-chip>{{svnInfo.last_author}}</p>
                                <p><v-chip label>Last Revision:</v-chip>{{svnInfo.last_rev}}</p>
                                <p><v-chip label>Revision:</v-chip>{{svnInfo.revision}}</p>
                                <p><v-chip label>Updated:</v-chip>{{svnInfo.last_date}}</p>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
<!--                    <v-btn v-if="!svn_get_error">changes</v-btn>-->
<!--                    <v-btn>update</v-btn>-->
<!--                    <v-btn v-if="!svn_get_error">update puppet classes</v-btn>-->
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
            dialogTitle: null,
        }),

        components: {
            FingerprintSpinner
        },

        async mounted() {
            // User check ==========================================
            await Common.auth(this);

            // ======
            this.environments = (await environmentService.List()).data;
            this.full_environments = (await environmentService.List()).data;
        },

        watch: {
            filter: {
                async handler (val) {
                    if (val && this.full_environments) {
                        for (let host in this.full_environments) {
                            this.environments[host] = [];
                            for (let i in this.full_environments[host]) {
                                if (this.full_environments[host][i].includes(val)) {
                                    this.environments[host].push(this.full_environments[host][i]);
                                }
                            }
                        }
                    } else {
                        this.environments = (await environmentService.List()).data;
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
                    this.svnInfo = (await environmentService.SVNInfo(host, e)).data[0];
                } catch (e) {
                    console.info(e);
                    this.svn_get_error = true;
                } finally {
                    this.swe_loading = false;
                }
            },
        }
    }
</script>

<style></style>
