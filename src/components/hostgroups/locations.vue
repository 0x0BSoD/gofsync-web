<template>
    <v-container>
        <v-item-group>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex
                            v-for="n in locations"
                            :key="n.host"
                            xs12
                            md6
                            xl4
                    >
                        <v-item>
                            <v-card>
                                <v-card-title class="pr-0 pl-3 pt-0 pb-0">
                                    <h4 @click="setHost(n.host)">{{n.host}}</h4>
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
                                            <v-list-tile  @click="" >
                                                <a target="_blank" :rel="n.host" :href="`https://${n.host}`">to foreman</a>
                                            </v-list-tile>
                                            <v-list-tile  @click="updateLoc(n.host)" >
                                                <v-list-tile-title>update locations</v-list-tile-title>
                                            </v-list-tile>
                                            <v-list-tile  @click="updateEnv(n.host)" >
                                                <v-list-tile-title>update environments</v-list-tile-title>
                                            </v-list-tile>
                                            <v-list-tile  @click="updatePC(n.host)" >
                                                <v-list-tile-title>update puppet classes</v-list-tile-title>
                                            </v-list-tile>
                                            <v-list-tile  @click="updateHG(n.host)" >
                                                <v-list-tile-title>update hostgroups</v-list-tile-title>
                                            </v-list-tile>
                                        </v-list>
                                    </v-menu>
                                </v-card-title>
                                <v-divider></v-divider>
                                <v-hover v-for="c in n.locations" :key="c">
                                    <v-chip
                                            slot-scope="{ hover }"
                                            :class="`elevation-${hover ? 2 : 1} ml-1`"
                                            class="mx-auto"
                                            label >{{c}}</v-chip>
                                </v-hover>
                            </v-card>
                        </v-item>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-item-group>



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
                            <v-chip label v-if="nowActions">{{nowActions.actions}}</v-chip>
                            <v-chip label v-if="nowActions.state">{{nowActions.state}}</v-chip>
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
                            <v-chip label v-if="nowActions">{{nowActions.actions}}</v-chip>
                            <v-chip label v-if="nowActions.state">{{nowActions.state}}</v-chip>
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
    import {environmentService, hostGroupService, locationsService, pcService} from "../../_services"

    export default {

        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
        computed: {
            nowActions () {
                return this.$store.state.socketModule.socket.message;
            }
        },

        data: () => ({
            wip: false,
            wipMessage: false,
            dialog: false,
            dialogTitle: "",
        }),

        components: {
            FingerprintSpinner
        },

        props: [
            "locations"
        ],
        async mounted () {},
        watch: {},
        methods: {
            async setHost (host) {
                await this.$store.dispatch("setHost", host);
            },
            async updateEnv (host) {
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
                }
            },
            async updateLoc (host) {
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
                }
            },
            async updateHG (host) {
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
                }
            },
            async updatePC (host) {
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
                }
            }
        }
    }
</script>

<style>
    .spinner {
        margin: 0 auto;
    }
</style>
