<template>
    <v-container>
        <v-item-group>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex
                            v-for="n in locations"
                            :key="n.host"
                            xs12
                            md4
                    >
                        <v-item>
                            <v-card>
                                <v-card-title class="pr-0 pl-3 pt-0 pb-0">
                                    <h4 @click="setHost(n.host)">{{n.host}}</h4>
                                    <v-spacer></v-spacer>
                                    <v-btn icon flat><a target="_blank" :rel="n.host" :href="`https://${n.host}`"><v-icon>link</v-icon></a></v-btn>
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
    </v-container>
</template>

<script>
    export default {
        data: () => ({}),
        props: [
            "locations"
        ],
        async mounted () {},
        watch: {},
        methods: {
            async setHost (host) {
                await this.$store.dispatch("setHost", host);
            }
        }
    }
</script>

<style></style>
