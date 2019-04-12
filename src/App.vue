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
                <v-btn flat :to="{name:'batch'}">BATCH</v-btn>
                <v-spacer></v-spacer>
                {{username}}
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
            }
        },
        watch: {
            "username": {
                async handler(val) {
                    console.log(val);
                }
            }
        }
    }
</script>
