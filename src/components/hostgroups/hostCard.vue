<template>
    <v-card class="hostCard">
        <v-toolbar color="#f0f5f5">
            <v-toolbar-title>
                <v-btn flat small :to="{name:'hostgroup', query: {source: hg.host }}">{{hg.host}}
                </v-btn>
            </v-toolbar-title>
            <v-spacer></v-spacer>
<!--            <v-chip v-if="hg.env === 'stage'" small color="success">STAGE</v-chip>-->
<!--            <v-chip v-if="hg.env === 'prod'" small color="warning">PROD</v-chip>-->

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
                        <a target="_blank" :rel="hg.host" :href="`https://${hg.host}`">to
                            foreman</a>
                    </v-list-tile>
                    <v-divider></v-divider>
                    <v-list-tile @click="updateAll(hg.host)">
                        <v-list-tile-title>update all</v-list-tile-title>
                    </v-list-tile>
                    <v-divider></v-divider>
                    <v-list-tile @click="updateLoc(hg.host)">
                        <v-list-tile-title>update locations</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="updateEnv(hg.host)">
                        <v-list-tile-title>update environments</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="updatePC(hg.host)">
                        <v-list-tile-title>update puppet classes</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="updateHG(hg.host)">
                        <v-list-tile-title>update hostgroups</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="showSweDialog(hg.host)">
                        <v-list-tile-title>hosts by HG</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </v-toolbar>
        <v-divider></v-divider>

        <v-card-text>
            <v-hover v-for="c in hg.locations" :key="c.name">
                <v-btn
                        v-if="c.highlighted"
                        slot-scope="{ hover }"
                        :class="`elevation-${hover ? 2 : 1} ml-1`"
                        class="mx-auto red"
                        :to="{name:'locations', query: {source: hg.host, location: c.name }}"
                        small>{{c.name}}
                </v-btn>
                <v-btn
                        v-else
                        slot-scope="{ hover }"
                        :class="`elevation-${hover ? 2 : 1} ml-1`"
                        class="mx-auto"
                        :to="{name:'locations', query: {source: hg.host, location: c.name }}"
                        small>{{c.name}}
                </v-btn>
            </v-hover>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        data: () => ({}),
        props: [
            "hg"
        ],
        async mounted() {
        },
        watch: {},
        methods: {}
    }
</script>

<style>

</style>
