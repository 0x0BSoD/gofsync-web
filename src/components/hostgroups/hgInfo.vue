<template>
    <v-container>
        <v-card
                v-for="(puppetClass, idx) in puppetClasses"
                :key="idx"
        >
            <v-expansion-panel>
                <v-expansion-panel-content
                        v-for="(subClass, idx1) in puppetClass"
                        :key="idx1"
                >
                    <template v-slot:actions>
                        <v-badge overlap left v-if="subClass.smart_classes">
                            <template v-slot:badge>
                                <span>{{subClass.param_count}}</span>
                            </template>
                            <v-icon color="green darken-2" large>star</v-icon>
                        </v-badge>
                        <v-icon v-else color="primary">$vuetify.icons.expand</v-icon>
                        <v-badge overlap left color="orange" v-if="subClass.ovr_count">
                            <template v-slot:badge>
                                <span>{{subClass.ovr_count}}</span>
                            </template>
                            <v-icon color="blue darken-2" large>star_border</v-icon>
                        </v-badge>
                    </template>
                    <template v-slot:header>
                        <div>{{subClass.subclass}}</div>
                    </template>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <div class="ml-2">
                                <v-chip
                                        label
                                        v-for="(sc, l) in subClass.smart_classes"
                                        :key="l"
                                >
                                    {{sc.name}}
                                </v-chip>
                            </div>
                        </v-flex>
                        <v-flex xs12 pr-2 pt-2>
                            <div v-if="subClass.ovr_count" class="ml-2 mb-2">
                                <div
                                        v-for="(ovr, l) in subClass.overrides"
                                        :key="l"
                                >
                                    <v-label>Parameter:</v-label>
                                    {{ovr.parameter}}
                                    <pre><code class="pa-1">{{ovr.value}}</code></pre>
                                </div>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-card>
    </v-container>
</template>

<script>
    export default {
        data: () => ({}),
        props: [
            "puppetClasses"
        ],
        async mounted() {
        },
        watch: {},
        methods: {}
    }
</script>

<style></style>
