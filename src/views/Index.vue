<template>
    <v-container>
        <v-item-group>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex xs12>
                        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                                label="Location Search"
                                v-model="locSearch"
                                outline
                                clearable
                        ></v-text-field>
                    </v-flex>

                    <!-- ================= STAGE ================= -->
                    <div class="ribbonS">STAGING</div>
                    <v-flex
                            v-for="(n) in locations"
                            :key="n.host"
                            v-if="n.env === 'stage'"
                            xs12
                            md6
                            xl4
                    >
                        <v-item>
                            <HostCard  :hg="n"/>
                        </v-item>
                    </v-flex>

                    <!-- ================= PROD ================= -->
                    <div class="ribbonP">PRODUCTION</div>
                    <v-flex
                            v-for="n in locations"
                            :key="n.host"
                            v-if="n.env === 'prod'"
                            xs12
                            md6
                            xl4
                    >
                        <v-item>
                            <HostCard  :hg="n"/>
                        </v-item>
                    </v-flex>

                </v-layout>
            </v-container>
        </v-item-group>

        <v-dialog
                v-model="sweHosts"
                max-width="800"
        >
            <v-card>
                <v-toolbar dark color="#7ac2ff">
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-card-text>
                    <v-layout wrap row>
                        <v-flex xs6 pr-2>
                            <v-autocomplete
                                    v-if="allHosts"
                                    v-model="hostGroup"
                                    :items="hostGroups"
                                    label="Host Group"
                                    persistent-hint
                                    item-text="name"
                            >
                                <template slot="item" slot-scope="data">
                                    <v-list-tile-content>
                                        <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                                    </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                            <v-autocomplete
                                    v-else
                                    v-model="hostGroup"
                                    :items="hostGroups"
                                    label="Host Group"
                                    persistent-hint
                                    item-value="foreman_id"
                                    item-text="name"
                            >
                                <template slot="item" slot-scope="data">
                                    <v-list-tile-content>
                                        <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                                    </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs3 pr-2 class="text-sm-center">
                            <v-btn
                                    :loading="loading"
                                    :disabled="loading"
                                    large
                                    @click="loadHosts()"
                            >
                                load
                            </v-btn>

                        </v-flex>

                        <v-flex xs12

                        >
                            <ol>
                                <li
                                        v-for="(v, k) in hosts"
                                        :key="k"
                                >
                                    {{v.name}}
                                    <v-chip>{{ (v.last_report)}}</v-chip>
                                </li>
                            </ol>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
                v-model="dialog"
                max-width="800"
        >
            <v-card>
                <v-toolbar dark color="#7ac2ff">
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>

                <v-card-text>
                    <!--    ============================================ Progress ============================================    -->

                    <v-layout row wrap v-if="wipMessage">
                        <v-flex v-if="wip" xs9>
                            <v-chip label v-if="WSProgress.message">{{WSProgress.message}}</v-chip>
                        </v-flex>
                        <v-flex xs3 class="pt-2">
                            {{wipMessage}}
                        </v-flex>
                        <v-flex xs12 v-if="wip" class="text-xs-center pt-2">
                            <fingerprint-spinner
                                    class="spinner"
                                    :animation-duration="1500"
                                    :size="64"
                                    color="#7ac2ff"
                            />
                        </v-flex>
                    </v-layout>

                    <v-layout row wrap v-else class="text-xs-center">
                        <v-flex v-if="wip" xs12>
                            <v-chip label v-if="WSProgress.message">{{WSProgress.message}}</v-chip>
                        </v-flex>
                        <v-flex xs12 v-if="wip" class="text-xs-center pt-2">
                            <fingerprint-spinner
                                    class="spinner"
                                    :animation-duration="1500"
                                    :size="64"
                                    color="#7ac2ff"
                            />
                        </v-flex>

                    </v-layout>
                    <v-flex xs12 class="text-xs-center pt-2"
                            v-for="(v,k) in WSProgress.errors" :key="k"
                    >
                        <v-chip color="warning" label>{{v.env}}</v-chip>{{v.error.split("::")[1]}}
                    </v-flex>
                    <!--    ============================================ /Progress ============================================    -->
                </v-card-text>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>

    import {FingerprintSpinner} from 'epic-spinners'
    import {environmentService, hostGroupService, hostService, locationsService, pcService} from "../_services"
    import {Common} from "./methods"
    import HostCard from "../components/hostgroups/hostCard"

    export default {

        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
        computed: {
            nowActions() {
                return this.$store.state.socketModule.socket.message;
            }
        },

        data: () => ({
            locations: [],
            hostGroups: [],
            wip: false,
            wipMessage: false,
            dialog: false,
            sweHosts: false,
            allHosts: false,
            hostGroup: null,
            HGChanged: null,
            selHost: null,
            locSearch: null,
            HGChangedExamples: [
                "Today",
                "Yesterday",
                "Yesterday",
                ">2 days ago",
                "10 May,2019"
            ],
            loading: false,
            dialogTitle: "",
            hosts: [],
            WSProgress: {
                message: null,
                errors: [],
            },
            globalWork: false,
        }),

        components: {
            FingerprintSpinner,
            HostCard
        },

        async mounted() {
            // User check ==========================================
            await Common.auth(this);
            this.wip = true;
            this.locations  = (await locationsService.List()).data;
            this.locations.sort(Common.dynamicSort("host"));
            this.wip = false;
        },
        watch: {
            nowActions: {
                async handler(val) {
                    await Common.webSocketParser(val, this);
                }
            },
            locSearch: {
                async handler(val) {
                    if (val) {
                        for (let i in this.locations) {
                            for (let k in this.locations[i].locations) {
                                if (this.locations[i].locations[k].name.includes(val)) {
                                    this.locations[i].open = [true];
                                    this.locations[i].locations[k].highlighted = true;
                                // }
                                } else {
                                    // this.locations[i].open = [ false ];
                                    this.locations[i].locations[k].highlighted = false;
                                }
                            }
                        }
                    } else {
                        for (let i in this.locations) {
                            this.locations[i]["open"] = [ false ];
                            for (let k in this.locations[i].locations) {
                                this.locations[i].locations[k].highlighted = false;
                            }
                        }
                    }
                }
            }
        },
        methods: {
            async showSweDialog(host) {
                this.dialogTitle = host;
                this.hosts = [];
                this.hostGroups = (await hostGroupService.List(host)).data;
                this.selHost = host;
                this.sweHosts = true;
            },
            async loadHosts() {
                this.loading = true;
                try {
                    if (!this.allHosts) {
                        this.hosts = (await hostService.ClientHosts(this.selHost, this.hostGroup, this.HGChanged)).data;
                        for (let i in this.hosts) {
                            let localDate = new Date(this.hosts[i].last_report);
                            this.hosts[i].last_report = localDate.toLocaleString();
                        }
                    } else {
                        this.hosts = (await hostService.ClientHostsAll(this.hostGroup, this.HGChanged)).data;
                        for (let i in this.hosts) {
                            let localDate = new Date(this.hosts[i].last_report);
                            this.hosts[i].last_report = localDate.toLocaleString();
                        }
                    }

                } catch (e) {
                    console.info(e.message);
                    if (e.message === "Request failed with status code 404") {
                        this.hosts[0] = "Nothing found";
                    }
                } finally {
                    this.loading = false;
                }
            },
            async setHost(host) {
                await this.$store.dispatch("setHost", host);
            },
            async updateEnv(host) {
                this.dialogTitle = host;
                this.dialog = true;
                this.wip = true;
                this.wipMessage = "Updating Environments";
                this.WSProgress = {
                    message: null,
                            errors: [],
                };
                try {
                    await environmentService.Update(host);
                    this.$emit('envUpdated');
                } catch (e) {
                    console.error(e);
                } finally {
                    this.wip = false;
                    this.wipMessage = false;
                    if (this.WSProgress.errors.length === 0) {
                        this.dialog = false;
                    }
                    console.log(this.WSProgress.errors);
                }
            },
            async updateLoc(host) {
                //this.$connect();
                this.dialogTitle = host;
                this.dialog = true;
                this.wip = true;
                this.wipMessage = "Updating Locations";
                try {
                    await locationsService.Update(host);
                    this.$emit('locUpdated');
                } catch (e) {
                    console.error(e);
                } finally {
                    this.wip = false;
                    this.wipMessage = false;
                    this.dialog = false;
                    //this.$disconnect();
                }
            },
            async updateHG(host) {
                //this.$connect();
                this.dialogTitle = host;
                this.dialog = true;
                this.wip = true;
                this.wipMessage = "Updating HostGroups";
                try {
                    await hostGroupService.Update(host);
                    this.$emit('hgUpdated');
                } catch (e) {
                    console.error(e);
                } finally {
                    this.wip = false;
                    this.wipMessage = false;
                    this.dialog = false;
                    //this.$disconnect();
                }
            },
            async updatePC(host) {
                //this.$connect();
                this.dialogTitle = host;
                this.dialog = true;
                this.wip = true;
                this.wipMessage = "Updating Puppet Classes";
                try {
                    await pcService.Update(host);
                    this.$emit('pcUpdated');
                } catch (e) {
                    console.error(e);
                } finally {
                    this.wip = false;
                    this.wipMessage = false;
                    this.dialog = false;
                    //this.$disconnect();
                }
            }
        }
    }
</script>

<style>

    .ribbonS {
        display: block;
        width: 100%;
        margin: 0 15px 15px 0;
        padding: 0 5px 0 15px;
        font-family: Roboto, sans-serif;
        font-size: 2rem;


        background: rgba(76,175,80,1);
        background: -moz-linear-gradient(left, rgba(76,175,80,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        background: -webkit-gradient(left top, right top, color-stop(0%, rgba(76,175,80,1)), color-stop(65%, rgba(191,223,192,0)), color-stop(96%, rgba(246,246,246,0)), color-stop(100%, rgba(237,237,237,0)));
        background: -webkit-linear-gradient(left, rgba(76,175,80,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        background: -o-linear-gradient(left, rgba(76,175,80,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        background: -ms-linear-gradient(left, rgba(76,175,80,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        background: linear-gradient(to right, rgba(76,175,80,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4caf50', endColorstr='#ededed', GradientType=1 );

    }

    .ribbonP {
        display: block;
        width: 100%;
        margin: 15px 15px 15px 0;
        padding: 0 5px 0 15px;
        font-family: Roboto, sans-serif;
        font-size: 2rem;


        background: rgba(241,231,103,1);
        background: -moz-linear-gradient(left, rgba(241,231,103,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        background: -webkit-gradient(left top, right top, color-stop(0%, rgba(241,231,103,1)), color-stop(65%, rgba(191,223,192,0)), color-stop(96%, rgba(246,246,246,0)), color-stop(100%, rgba(237,237,237,0)));
        background: -webkit-linear-gradient(left, rgba(241,231,103,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        background: -o-linear-gradient(left, rgba(241,231,103,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        background: -ms-linear-gradient(left, rgba(241,231,103,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        background: linear-gradient(to right, rgba(241,231,103,1) 0%, rgba(191,223,192,0) 65%, rgba(246,246,246,0) 96%, rgba(237,237,237,0) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4caf50', endColorstr='#ededed', GradientType=1 );

    }

    .spinner {
        margin: 0 auto;
    }
    .info_table {
        width: 100%;
        font-family: "Roboto", Arial, Helvetica, sans-serif;;
        border-collapse: collapse;
    }
    .info_table td {
        border-bottom: 1px solid #dddddd;
        padding: 0 12px 0 0;
    }
    .info_table tr:nth-child(even){ background-color: #f2f2f2; }
    .info_table tr:hover {background-color: #ddd;}
    .info_table th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: center;
    }
    .hostCard {
        height: 100%;
    }
</style>
