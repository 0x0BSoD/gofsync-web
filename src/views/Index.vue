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
                    <v-flex
                            v-for="n in locations"
                            :key="n.host"
                            xs12
                            md6
                            xl4
                    >
                        <v-item>

                            <v-card class="hostCard">
                                <v-toolbar color="#f0f5f5">
                                    <v-toolbar-title>
                                        <v-btn flat :to="{name:'hostgroup', query: {source: n.host }}">{{n.host}}
                                        </v-btn>
                                    </v-toolbar-title>
                                    <v-spacer></v-spacer>
                                        <v-chip v-if="n.env === 'stage'" small color="success">STAGE</v-chip>
                                        <v-chip v-if="n.env === 'prod'" small color="warning">PROD</v-chip>
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
                                                <v-list-tile @click="">
                                                    <a target="_blank" :rel="n.host" :href="`https://${n.host}`">to
                                                        foreman</a>
                                                </v-list-tile>
                                                <v-divider></v-divider>
                                                <v-list-tile @click="updateAll(n.host)">
                                                    <v-list-tile-title>update all</v-list-tile-title>
                                                </v-list-tile>
                                                <v-divider></v-divider>
                                                <v-list-tile @click="updateLoc(n.host)">
                                                    <v-list-tile-title>update locations</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile @click="updateEnv(n.host)">
                                                    <v-list-tile-title>update environments</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile @click="updatePC(n.host)">
                                                    <v-list-tile-title>update puppet classes</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile @click="updateHG(n.host)">
                                                    <v-list-tile-title>update hostgroups</v-list-tile-title>
                                                </v-list-tile>
                                                <v-list-tile @click="showSweDialog(n.host)">
                                                    <v-list-tile-title>hosts by HG</v-list-tile-title>
                                                </v-list-tile>
                                            </v-list>
                                        </v-menu>
                                </v-toolbar>
                                <v-divider></v-divider>

                                <v-card-text>
                                    <v-layout row wrap  class="mb-4">
                                        <v-flex
                                                xs12
                                                md6
                                                xl5
                                        >
                                            <v-card
                                                    class="mx-auto"
                                                    elevation="0"
                                            >
                                            <table class="info_table">
                                                <thead>
                                                <tr>
                                                    <th>Last Hosts</th>
                                                    <th></th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr>
                                                    <td>
                                                        <v-chip color="success" label>Success:</v-chip>
                                                    </td>
                                                    <td>
                                                        {{n.success}}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <v-chip color="warning" label>Restart Failures:</v-chip>
                                                    </td>
                                                    <td>
                                                        {{n.r_failed}}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <v-chip color="error" label>Failed:</v-chip>
                                                    </td>
                                                    <td>
                                                        {{n.failed}}
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            </v-card>
                                        </v-flex>
                                        <v-flex
                                                xs12
                                                md6
                                                xl7
                                        >
                                            <v-card
                                                    class="mx-auto"
                                                    elevation="0"
                                                    v-if="n.trend.values"
                                            >
                                                <v-sheet
                                                        class="v-sheet--offset mx-auto"
                                                        color="cyan dark-1"
                                                        elevation="2"
                                                        max-width="calc(100% - 32px)"
                                                >
                                                    <v-sparkline
                                                            :labels="n.trend.labels"
                                                            :value="n.trend.values"
                                                            color="white"
                                                            line-width="2"
                                                            padding="16"
                                                    >
                                                    </v-sparkline>
                                                </v-sheet>

                                                <v-card-text class="pt-2">
                                                    <div class="title font-weight-light mb-2">Runs in the last 24 hours</div>
                                                    <div class="subheading font-weight-light grey--text">UTC time</div>
                                                    <v-divider class="my-2"></v-divider>
                                                    <v-icon
                                                            class="mr-2"
                                                            small
                                                    >
                                                        alarm
                                                    </v-icon>
                                                    <span class="caption grey--text font-weight-light">
                                                        last run <strong><a target="_blank" :rel="n.host" :href="`https://${n.host}/hosts/${n.last_host}/reports`">{{n.last_host}}</a></strong>
                                                    </span>
                                                </v-card-text>
                                            </v-card>

                                        </v-flex>
                                    </v-layout>
                                    <v-expansion-panel
                                        :value="n.open"
                                        expand
                                    >
                                        <v-expansion-panel-content>
                                            <template v-slot:header>
                                                <v-icon small>public</v-icon><div>Locations</div>
                                            </template>
                                            <v-card>
                                                <v-hover v-for="c in n.locations" :key="c.name">
                                                    <v-btn
                                                            v-if="c.highlighted"
                                                            slot-scope="{ hover }"
                                                            :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                            class="mx-auto red"
                                                            :to="{name:'locations', query: {source: n.host, location: c.name }}"
                                                            small>{{c.name}}
                                                    </v-btn>
                                                    <v-btn
                                                            v-else
                                                            slot-scope="{ hover }"
                                                            :class="`elevation-${hover ? 2 : 1} ml-1`"
                                                            class="mx-auto"
                                                            :to="{name:'locations', query: {source: n.host, location: c.name }}"
                                                            small>{{c.name}}
                                                    </v-btn>
                                                </v-hover>
                                            </v-card>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-card-text>


                            </v-card>

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
                        <v-flex xs12 class="text-xs-center pt-2">
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
                        <v-flex xs12 class="text-xs-center pt-2">
                            <fingerprint-spinner
                                    class="spinner"
                                    :animation-duration="1500"
                                    :size="64"
                                    color="#7ac2ff"
                            />
                        </v-flex>
                    </v-layout>
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
            },
        }),

        components: {
            FingerprintSpinner
        },

        async mounted() {
            // User check ==========================================
            await Common.auth(this);
            this.wip = true;
            this.locations = (await locationsService.List()).data;
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
                //this.$connect();
                this.dialogTitle = host;
                this.dialog = true;
                this.wip = true;
                this.wipMessage = "Updating Environments";
                try {
                    await environmentService.Update(host);
                    this.$emit('envUpdated');
                } catch (e) {
                    console.error(e);
                } finally {
                    this.wip = false;
                    this.wipMessage = false;
                    this.dialog = false;
                    //this.$disconnect();
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
