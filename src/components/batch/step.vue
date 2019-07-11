<template>
    <v-stepper-content :step="stepNum">
        <v-card>
            <v-card-title class="headline font-weight-regular blue-grey white--text">{{commentCard}}</v-card-title>
            <v-card-text>
                <v-subheader class="pa-0">{{commentCard}}}</v-subheader>
                <v-autocomplete
                        laberl="source"
                        prepend-icon="computer"
                        v-model="sHost"
                        :items="hosts"
                ></v-autocomplete>
            </v-card-text>
        </v-card>

        <v-btn color="primary" v-if="stepPrev" @click="stepPrev" flat>back</v-btn>
        <v-btn color="primary" v-if="stepNext" :disabled="!sHost" @click="stepNext;funcAfter()" flat>next</v-btn>

    </v-stepper-content>
</template>

<script>
    export default {
        props: [
            "stepNum",
            "stepPrev",
            "stepNext",
            "funcAfter"
        ],
        data: () => ({}),
        async mounted() {
        },
        watch: {},
        methods: {}
    }
</script>

<style></style>
