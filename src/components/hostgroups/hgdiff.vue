<template>
    <v-container>

        <v-card v-if="sourceDiff && targetDiff">

            <v-card-text>
                <v-layout row wrap class="text-xs-center">
                    <v-flex xs6>
                        <h3 class="pb-2 display-2">Not in source</h3>

                        <h3 class="headline" v-if="sourceDiff.puppetClassesMissing.length > 0">Puppet Classes</h3>
                        <v-chip
                                color="indigo lighten-5"
                                v-if="sourceDiff.puppetClassesMissing.length > 0"
                                v-for="(val, id) in sourceDiff.puppetClassesMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="sourceDiff.smartClassesMissing.length > 0">Smart Class</h3>
                        <v-chip
                                color="indigo lighten-4"
                                v-if="sourceDiff.smartClassesMissing.length > 0"
                                v-for="(val, id) in sourceDiff.smartClassesMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="sourceDiff.smartClassesParameterMissing.length > 0">Smart Class parameters</h3>
                        <v-chip
                                color="indigo lighten-3"
                                v-if="sourceDiff.smartClassesParameterMissing.length > 0"
                                v-for="(val, id) in sourceDiff.smartClassesParameterMissing">
                            {{val}}
                        </v-chip>
                    </v-flex>
                    <v-flex xs6>
                        <h3 class="pb-2 display-2">Not in target</h3>

                        <h3 class="headline" v-if="targetDiff.puppetClassesMissing.length > 0">Puppet Classes</h3>
                        <v-chip
                                color="blue lighten-5"
                                v-if="targetDiff.puppetClassesMissing.length > 0"
                                v-for="(val, id) in targetDiff.puppetClassesMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="targetDiff.smartClassesMissing.length > 0">Smart Class</h3>
                        <v-chip
                                color="blue lighten-4"
                                v-if="targetDiff.smartClassesMissing.length > 0"
                                v-for="(val, id) in targetDiff.smartClassesMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="targetDiff.smartClassesParameterMissing.length > 0">Smart Class parameters</h3>
                        <v-chip
                                color="blue lighten-3"
                                v-if="targetDiff.smartClassesParameterMissing.length > 0"
                                v-for="(val, id) in targetDiff.smartClassesParameterMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="targetDiff.overridesMissing.length > 0">Overrides</h3>
                        <p v-if="targetDiff.overridesMissing.length > 0">{{targetDiff.overridesMissing}}</p>
                    </v-flex>
                    <v-flex xs12 class="pt-2">
                        <h3 class="headline" v-if="targetDiff.overridesMismatch.length > 0">Overrides mismatch</h3>
                        <v-chip
                                color="blue lighten-2"
                                v-if="targetDiff.overridesMismatch.length > 0"
                                v-for="(val, id) in targetDiff.overridesMismatch">
                            {{val}}
                        </v-chip>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>

        <v-card v-else-if="sourceDiff || targetDiff">
            <v-card-text>
                <v-layout row wrap  class="text-xs-center">
                    <v-flex xs12 v-if="sourceDiff">
                        <h3 class="pb-2 display-2">Not in source</h3>

                        <h3 class="headline" v-if="sourceDiff.puppetClassesMissing.length > 0">Puppet Classes</h3>
                        <v-chip
                                color="indigo lighten-5"
                                v-if="sourceDiff.puppetClassesMissing.length > 0"
                                v-for="(val, id) in sourceDiff.puppetClassesMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="sourceDiff.smartClassesMissing.length > 0">Smart Class</h3>
                        <v-chip
                                color="indigo lighten-4"
                                v-if="sourceDiff.smartClassesMissing.length > 0"
                                v-for="(val, id) in sourceDiff.smartClassesMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="sourceDiff.smartClassesParameterMissing.length > 0">Smart Class parameters</h3>
                        <v-chip
                                color="indigo lighten-3"
                                v-if="sourceDiff.smartClassesParameterMissing.length > 0"
                                v-for="(val, id) in sourceDiff.smartClassesParameterMissing">
                            {{val}}
                        </v-chip>
                    </v-flex>
                    <v-flex xs12 v-if="targetDiff">
                        <h3 class="pb-2 display-2">Not in target</h3>

                        <h3 class="headline" v-if="targetDiff.puppetClassesMissing.length > 0">Puppet Classes</h3>
                        <v-chip
                                color="blue lighten-5"
                                v-if="targetDiff.puppetClassesMissing.length > 0"
                                v-for="(val, id) in targetDiff.puppetClassesMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="targetDiff.smartClassesMissing.length > 0">Smart Class</h3>
                        <v-chip
                                color="blue lighten-4"
                                v-if="targetDiff.smartClassesMissing.length > 0"
                                v-for="(val, id) in targetDiff.smartClassesMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="targetDiff.smartClassesParameterMissing.length > 0">Smart Class parameters</h3>
                        <v-chip
                                color="blue lighten-3"
                                v-if="targetDiff.smartClassesParameterMissing.length > 0"
                                v-for="(val, id) in targetDiff.smartClassesParameterMissing">
                            {{val}}
                        </v-chip>

                        <h3 class="headline" v-if="targetDiff.overridesMissing.length > 0">Overrides</h3>
                        <p v-if="targetDiff.overridesMissing.length > 0">{{targetDiff.overridesMissing}}</p>
                    </v-flex>
                    <v-flex xs12 class="pt-2">
                        <h3 class="headline" v-if="targetDiff.overridesMismatch.length > 0">Overrides mismatch</h3>
                        <v-chip
                                color="blue lighten-2"
                                v-if="targetDiff.overridesMismatch.length > 0"
                                v-for="(val, id) in targetDiff.overridesMismatch">
                            {{val}}
                        </v-chip>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
    export default {
        data: () => ({}),
        props: [
            "sourceDiff",
            "targetDiff"
        ],
        async mounted () {
        },
        watch: {
            sourceDiff: {
                handler (val) {
                    console.log(val);

                },
            },
            targetDiff: {
                handler (val) {
                    console.log(val);

                },
            },
        },
        methods: {}
    }
</script>

<style></style>
