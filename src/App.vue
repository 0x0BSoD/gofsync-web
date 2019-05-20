<template>
    <v-app>
        <v-content>
            <v-toolbar app dense>
                <v-btn :to="{name:'hostgroup'}" icon flat class="hidden-xs-only">
                    <v-icon>sync</v-icon>
                </v-btn>
                <v-toolbar-title class="headline text-uppercase">
                    <span>go</span>
                    <span class="font-weight-light">Fsync</span>
                </v-toolbar-title>
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn
                                :disabled="!loggedIn"
                                flat
                                v-on="on"
                        >
                            {{menuLabel}}
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-tile :to="{name:'batch'}">
                            <v-list-tile-title>Batch</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile :disabled="true" :to="{name:'jsoneditor'}">
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
            }
        },
        async mounted () {
            this.loggedIn = localStorage.getItem('userData');
            this.token    = this.$cookies.isKey("token");
            if (!this.token && !this.loggedIn) {
                this.$router.push({name: "login"});
            }
        },
        watch: {
            "$route": {
                async handler (val) {
                    console.log(val.name);
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
