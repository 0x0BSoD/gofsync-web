<template>
    <v-container>
        <v-card
                class="mb-2"
        >
            <v-card-title primary-title>
                <div>
                    <v-layout row>
                        <v-flex>
                            <v-chip label> {{ param.type }} </v-chip>
                        </v-flex>
                        <v-flex>
                            <h3 class="headline mb-0">{{ param.name }} || FID: <strong>{{param.parameter_foreman_id}}</strong></h3>
                        </v-flex>
                    </v-layout>

                    <strong>default: </strong>{{param.default_value || "no default"}}
                </div>
            </v-card-title>
            <v-card-text>
                <v-textarea
                        box
                        v-model="param.value"
                        label="Override value"
                >
                </v-textarea>

            </v-card-text>
            <v-card-actions>
                <!--                                                                <v-btn flat>save</v-btn>-->
                <v-spacer></v-spacer>
                <v-btn flat color="warning">clear</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
    export default {
        data: () => ({}),
        props: [],
        async mounted () {},
        watch: {},
        methods: {}
    }
</script>

<style></style>
