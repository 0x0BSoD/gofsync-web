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
                <v-btn :disabled="!loggedIn" flat :to="{name:'batch'}">BATCH</v-btn>
                <v-spacer></v-spacer>
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn
                                :disabled="!loggedIn"
                                falt
                                v-on="on"
                        >
                            {{username}}
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-tile @click="logout()">
                            <v-list-tile-title>Logout</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile @click="sktest()">
                            <v-list-tile-title>test</v-list-tile-title>
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
                    console.log(val);
                    this.loggedIn = localStorage.getItem('userData');
                    this.token    = this.$cookies.isKey("token");
                    if (!this.token && !this.loggedIn) {
                        this.$router.push({name: "login"});
                    }
                }
            },
            "username": {
                async handler(val) {
                    console.log(val);
                }
            }
        },
        methods: {
            logout () {
                this.loggedIn = false;
                this.token    = false;
                this.$store.dispatch("setUsername", "anon");
                localStorage.clear();
                this.$cookies.remove("token");
                this.$router.push({name: "login"});
            },
            sktest() {
                let data = '{"msg": "start"}';
                this.$socket.emit('state', data)
            },
        },
    }
</script>
