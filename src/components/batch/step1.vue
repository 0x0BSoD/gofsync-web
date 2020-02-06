<template>
    <div>
        <v-card>
            <v-card-title class="headline font-weight-regular blue-grey white--text">Source</v-card-title>
            <v-card-text>
                <v-subheader class="pa-0">Source host for getting host group</v-subheader>
                <v-autocomplete
                        laberl="source"
                        prepend-icon="computer"
                        v-model="sHost"
                        :items="hosts"
                        item-text="name"
                        item-value="name"
                ></v-autocomplete>
            </v-card-text>
        </v-card>

        <v-card-actions>
            <v-btn color="primary" :disabled="!sHost" @click="e1 = 2; getHostGroups()" flat>next</v-btn>
        </v-card-actions>
    </div>
</template>

<script>
    export default {
        props: [
            "hosts",
        ],
        data: () => ({
            sHost: null,
            el: 1,
            environments,
            hostGroups,
        }),
        async mounted() {
        },
        watch: {},
        methods: {
            async getHostGroups() {
                this.hostGroups = (await hostGroupService.List(this.sHost)).data;
                this.environments = [];
                for (let h in this.hostGroups) {
                    let tmp = this.hostGroups[h].name.split(".");
                    if (tmp.length > 1 && this.environments.indexOf(tmp[1]) === -1) {
                        this.environments.push(tmp[1])
                    }
                }
            },
        }
    }
</script>

<style></style>
