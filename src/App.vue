<template>
    <v-app>
        <v-content>

            <vue-title :title="'gofsync | ' + menuLabel"></vue-title>

            <v-navigation-drawer
                v-if="showToolBar"
                class="grey lighten-5"
                app
                v-model="drawer"
                :mini-variant="mini"
                stateless
                hide-overlay
                clipped
            >
                <v-list class="pt-0" dense>
                    <v-divider></v-divider>

                    <!-- === home btn's === -->
                    <v-tooltip right v-if="mini">
                        <template v-slot:activator="{ on }">
                            <v-list-tile
                                    v-on="on"
                                    :to="{name:'index'}"
                            >
                                <v-list-tile-action>
                                    <v-icon>home</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title>Home</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>
                        <span>Home</span>
                    </v-tooltip>

                    <v-list-tile
                            v-else
                            :to="{name:'index'}"
                    >
                        <v-list-tile-action>
                            <v-icon>home</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Home</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <!-- === home btn's === -->

                    <v-divider></v-divider>

                    <!-- === hg btn's === -->
                    <v-tooltip right v-if="mini">
                        <template v-slot:activator="{ on }">
                            <v-list-tile
                                    v-on="on"
                                    :to="{name:'hostgroup'}"
                            >
                                <v-list-tile-action>
                                    <v-icon>receipt</v-icon>
                                </v-list-tile-action>

                                <v-list-tile-content>
                                    <v-list-tile-title>Host Group</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>
                        <span>Host Group</span>
                    </v-tooltip>

                    <v-list-tile
                            v-else
                            :to="{name:'hostgroup'}"
                    >
                        <v-list-tile-action>
                            <v-icon>receipt</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Host Group</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <!-- === hg btn's === -->

                    <!-- === hg batch btn's === -->
                    <v-tooltip right v-if="mini">
                        <template v-slot:activator="{ on }">
                            <v-list-tile
                                    v-on="on"
                                    :to="{name:'batch'}"
                            >
                                <v-list-tile-action>
                                    <v-icon>view_module</v-icon>
                                </v-list-tile-action>

                                <v-list-tile-content>
                                    <v-list-tile-title>Host Group Batch</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>
                        <span>Host Group Batch</span>
                    </v-tooltip>

                    <v-list-tile
                            v-else
                            :to="{name:'batch'}"
                    >
                        <v-list-tile-action>
                            <v-icon>view_module</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Host Group Batch</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <!-- === hg batch btn's === -->

                    <!-- === json btn's === -->
                    <v-tooltip right v-if="mini">
                        <template v-slot:activator="{ on }">
                            <v-list-tile
                                    v-on="on"
                                    :to="{name:'jsoneditor'}"
                            >
                                <v-list-tile-action>
                                    <v-icon>edit</v-icon>
                                </v-list-tile-action>

                                <v-list-tile-content>
                                    <v-list-tile-title>Host Group Editor</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>
                        <span>Host Group Editor</span>
                    </v-tooltip>

                    <v-list-tile
                            v-else
                            :to="{name:'jsoneditor'}"
                    >
                        <v-list-tile-action>
                            <v-icon>edit</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Host Group Editor</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <!-- === json btn's === -->

                    <!-- === swe btn's === -->
                    <v-tooltip right v-if="mini">
                        <template v-slot:activator="{ on }">
                            <v-list-tile
                                    v-on="on"
                                    :to="{name:'swe'}"
                            >
                                <v-list-tile-action>
                                    <v-icon>code</v-icon>
                                </v-list-tile-action>

                                <v-list-tile-content>
                                    <v-list-tile-title>SWE Code</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>
                        <span>SWE Code</span>
                    </v-tooltip>

                    <v-list-tile
                            v-else
                            :to="{name:'swe'}"
                    >
                        <v-list-tile-action>
                            <v-icon>code</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>SWE Code</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <!-- === swe btn's === -->

                    <v-divider></v-divider>

                    <!-- === loc btn's === -->
                    <v-tooltip right v-if="mini">
                        <template v-slot:activator="{ on }">
                            <v-list-tile
                                    v-on="on"
                                    :to="{name:'locations'}"
                            >
                                <v-list-tile-action>
                                    <v-icon>edit_location</v-icon>
                                </v-list-tile-action>

                                <v-list-tile-content>
                                    <v-list-tile-title>Locations</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>
                        <span>Locations</span>
                    </v-tooltip>

                    <v-list-tile
                            v-else
                            :to="{name:'locations'}"
                    >
                        <v-list-tile-action>
                            <v-icon>edit_location</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Locations</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                </v-list>
            </v-navigation-drawer>

            <v-toolbar class="pl-1" app dense v-if="showToolBar">
                <v-btn @click.stop="mini = !mini" icon flat class="hidden-xs-only">
                    <v-icon>sync</v-icon>
                </v-btn>
                <v-toolbar-title class="headline text-uppercase">

                    <span>go</span>
                    <span class="font-weight-light">Fsync</span>
                </v-toolbar-title>

                <v-spacer></v-spacer>
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn
                                :disabled="!loggedIn"
                                flat
                                v-on="on"
                        >
                            {{username}}
                            <v-icon v-if="ws_connected && !globalWork.run" color="success" right>account_circle</v-icon>

                            <v-tooltip bottom v-else-if="globalWork.run">
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on" icon small>
                                            <span class="custom-loader">
                                                <v-icon>toys</v-icon>
                                            </span>
                                    </v-btn>
                                </template>

                                <table>
                                    <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>
                                           Action
                                        </td>
                                        <td>
                                            {{globalWork.current.data.actions}}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            User
                                        </td>
                                        <td>
                                            {{globalWork.current.data.status}}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Host
                                        </td>
                                        <td>
                                            {{globalWork.current.data.host}}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </v-tooltip>
                            <v-icon v-else color="warning" right>account_circle</v-icon>


                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-tile @click="logout()">
                            <v-list-tile-title>Logout</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-toolbar>

            <router-view></router-view>
        </v-content>

    </v-app>
</template>

<script>
    import {mapGetters} from "vuex";

    export default {
        name: 'App',
        components: {},
        computed: {
            ...mapGetters({
                username: "Username",
                ws_connected: "WSConnected",
                globalWork: "GlobalWork",
            }),
        },
        data() {
            return {
                loggedIn: false,
                token: false,
                menuLabel: "Tools",
                showToolBar: true,


                drawer: true,
                items: [
                    { title: 'Home', icon: 'dashboard', click: "{name:'hostgroup'}" },
                    { title: 'Host Group', icon: 'question_answer', click: "{name:'hostgroup'}"  },
                    { title: 'Batch Host Groups', icon: 'question_answer', click: "{name:'hostgroup'}"  },
                    { title: 'JSON Code', icon: 'question_answer', click: "{name:'hostgroup'}"  },
                    { title: 'SWE Code', icon: 'question_answer', click: "{name:'hostgroup'}"  },
                    { title: 'Locations', icon: 'question_answer', click: "{name:'hostgroup'}"  },
                ],
                mini: true,
                right: null,
            }
        },
        async mounted() {
            this.showToolBar = !(this.$route.name === "login" || this.$route.name === "error");
            let userData = localStorage.getItem('userData');
            this.token = this.$cookies.isKey("token");
            if (this.token && userData) {
                this.loggedIn = true;
            } else {
                this.$router.push({name: "login"});
            }
        },
        watch: {
            username: {
                handler() {
                    this.showToolBar = !(this.$route.name === "login" || this.$route.name === "error");
                    let userData = localStorage.getItem('userData');
                    this.token = this.$cookies.isKey("token");
                    if (this.token && userData) {
                        this.loggedIn = true;
                        this.menuLabel = "hostgroup";
                    } else {
                        this.$router.push({name: "login"});
                    }
                }
            },
            "$route": {
                async handler(val) {
                    this.showToolBar = !(val.name === "login" || val.name === "error");
                    switch (val.name) {
                        case "hostgroup":
                            this.menuLabel = "HostGroup";
                            break;
                        case "batch":
                            this.menuLabel = "Batch";
                            break;
                        case "jsoneditor":
                            this.menuLabel = "JSON Editor";
                            break;
                        case "locations":
                            this.menuLabel = "Locations";
                            break;
                        case "swe":
                            this.menuLabel = "SWE";
                            break;
                        default:
                            this.menuLabel = "Tools";
                    }
                }
            },
        },
        methods: {
            async logout() {
                this.loggedIn = false;
                this.token = false;
                await this.$store.dispatch("setUsername", "anon");
                localStorage.clear();
                this.$cookies.remove("token");
                await this.$router.push({name: "login"});
            },
        },
    }
</script>
