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
                                <v-card-title><h4>{{n.host}}</h4></v-card-title>
                                <v-divider></v-divider>
                                <v-hover v-for="c in n.locations" :key="c">
                                    <v-chip
                                            slot-scope="{ hover }"
                                            :class="`elevation-${hover ? 12 : 2}`"
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
        methods: {}
    }
</script>

<style></style>
