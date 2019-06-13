<template>
    <v-app>
        <v-content>
            <v-toolbar app dense v-if="showToolBar">
                <v-btn  :to="{name:'index'}" icon flat class="hidden-xs-only">
                    <v-icon>sync</v-icon>
                </v-btn>
                <v-toolbar-title class="headline text-uppercase">
                    <span>go</span>
                    <span class="font-weight-light">Fsync</span>
                </v-toolbar-title>
                <v-btn
                        class="hidden-xs-only"
                        :disabled="!loggedIn"
                        flat
                        :to="{name:'hostgroup'}"
                >
                    hostgroup
                </v-btn>
                <v-btn
                        class="hidden-xs-only"
                        :disabled="!loggedIn"
                        flat
                        :to="{name:'batch'}"
                >
                    batch
                </v-btn>

                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn
                                :disabled="!loggedIn"
                                flat
                                icon
                                v-on="on"
                        >
                            <v-icon>
                                more_vert
                            </v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-tile :to="{name:'hostgroup'}">
                            <v-list-tile-title>HostGroup</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile :to="{name:'batch'}">
                            <v-list-tile-title>Batch</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile :to="{name:'jsoneditor'}">
                            <v-list-tile-title>Json editor</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile :disabled="true" :to="{name:'locations'}">
                            <v-list-tile-title>Locations</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>


                <v-spacer></v-spacer>
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn
                                :disabled="!loggedIn"
                                flat
                                v-on="on"
                        >
                            {{username}}
                            <v-icon right>account_circle</v-icon>
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
    import { mapGetters } from "vuex";

    export default {
        name: 'App',
        components: {},
        computed: {
            ...mapGetters({
                username: "Username",
            }),
        },
        data () {
            return {
                loggedIn: false,
                token: false,
                menuLabel: "Tools",
                showToolBar: true,
            }
        },
        async mounted () {
            this.showToolBar = !(this.$route.name === "login" || this.$route.name === "error");
            let userData = localStorage.getItem('userData');
            this.token    = this.$cookies.isKey("token");
            if (this.token && userData) {
                this.loggedIn = true;
            } else {
                this.$router.push({name: "login"});
            }
        },
        watch: {
            username: {
                handler () {
                    this.showToolBar = !(this.$route.name === "login" || this.$route.name === "error");
                    let userData = localStorage.getItem('userData');
                    this.token    = this.$cookies.isKey("token");
                    if (this.token && userData) {
                        this.loggedIn = true;
                        this.menuLabel = "hostgroup";
                    } else {
                        this.$router.push({name: "login"});
                    }
                }
            },
            "$route": {
                async handler (val) {
                    this.showToolBar = !(val.name === "login" || val.name === "error");
                    switch(val.name) {
                        case "hostgroup":
                            this.menuLabel = "hostgroup";
                            break;
                        case "batch":
                            this.menuLabel = "batch";
                            break;
                        case "jsoneditor":
                            this.menuLabel = "json editor";
                            break;
                        case "locations":
                            this.menuLabel = "locations";
                            break;
                        default:
                            this.menuLabel = "Tools";
                    }
                }
            },
        },
        methods: {
            async logout () {
                this.loggedIn = false;
                this.token    = false;
                await this.$store.dispatch("setUsername", "anon");
                localStorage.clear();
                this.$cookies.remove("token");
                this.$router.push({name: "login"});
            },
        },
    }
</script>
