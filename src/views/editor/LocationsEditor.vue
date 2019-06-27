<template>
    <v-container>
        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
<!-- ============================================= Top Panel ============================================= -->
        <v-layout row wrap>
            <v-flex xs2 mr-2 mt-1>
                <v-autocomplete
                        v-model="host"
                        :items="hosts"
                        label="Classes source Host"
                        item-text="name"
                        item-value="name"
                        persistent-hint
                        solo
                >
                </v-autocomplete>
            </v-flex>
            <v-flex xs2 mt-1>
                <v-autocomplete
                        :disabled="!host"
                        v-model="location"
                        :items="locations"
                        label="Location"
                        persistent-hint
                        solo
                >
                </v-autocomplete>
            </v-flex>
<!--            <v-flex xs5>-->
<!--                <v-btn large>add new location</v-btn>-->
<!--                <v-btn large>save</v-btn>-->
<!--                <v-btn large>save as</v-btn>-->
<!--            </v-flex>-->
        </v-layout>
<!--        <v-flex xs12 mb-3>-->
<!--            <v-btn small @click.stop="dialog = true">add puppet class</v-btn>-->
<!--        </v-flex>-->
<!-- ============================================= /Top Panel ============================================= -->
<!--        <v-item-group>-->
<!--            <v-container grid-list-md>-->
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-expansion-panel>
                            <v-expansion-panel-content
                                v-for="(val, idx) in overrides"
                                :key="idx"
                            >
                                <template v-slot:header>
                                    <div>{{val.puppet_class}}</div>
                                </template>
                                <v-card>
                                    <v-card-text>

                                        <v-item-group>
                                            <v-container grid-list-md>
                                                <v-layout wrap>
                                                    <v-flex
                                                            v-for="(param, i) in val.parameters"
                                                            :key="i"
                                                            xs12
                                                            md4
                                                    >
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
                                                                <v-btn flat color="warning">delete</v-btn>
                                                            </v-card-actions>
                                                        </v-card>
                                                    </v-flex>
                                                </v-layout>
                                            </v-container>
                                        </v-item-group>

                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-flex>
                </v-layout>

        <!--  ========================================================================================================      -->
<!--        <v-dialog-->
<!--                v-model="dialog"-->
<!--                scrollable-->
<!--                max-width="800px"-->
<!--        >-->
<!--            <v-card-->
<!--                    class="mx-auto"-->
<!--            >-->
<!--                <v-sheet class="pa-3 primary lighten-2">-->
<!--                    <v-text-field-->
<!--                            v-model="search"-->
<!--                            label="Search"-->
<!--                            dark-->
<!--                            flat-->
<!--                            solo-inverted-->
<!--                            hide-details-->
<!--                            clearable-->
<!--                            clear-icon="mdi-close-circle-outline"-->
<!--                    ></v-text-field>-->
<!--                    <v-checkbox-->
<!--                            v-model="caseSensitive"-->
<!--                            dark-->
<!--                            hide-details-->
<!--                            label="Case sensitive search"-->
<!--                    ></v-checkbox>-->
<!--                </v-sheet>-->
<!--                <v-card-text>-->
<!--                    <v-treeview-->
<!--                            v-model="selectedPC"-->
<!--                            :items="allPuppetClasses"-->
<!--                            :search="search"-->
<!--                            :filter="filter"-->
<!--                            open-on-click-->
<!--                            selectable-->
<!--                    >-->
<!--                    </v-treeview>-->
<!--                </v-card-text>-->
<!--            </v-card>-->
<!--        </v-dialog>-->
</v-container>
</template>

<script>
    import { Common } from "../methods";
    import { hostService, locationsService, pcService, SmartClassesService } from "../../_services"

    export default {

        components: {},

        computed: {
            filter () {
                return this.caseSensitive
                    ? (item, search, textKey) => item[textKey].indexOf(search) > -1
                    : undefined
            },
        },
        //========================================================================================================
        // DATA
        //========================================================================================================
        data: () => ({
            selectedPC: [],
            locations: [],
            location: null,
            hosts: [],
            host: null,
            overrides: [],
            overridesIDs: [],
            allPuppetClasses: [],
            wip: false,
            dialog: false,
            search: null,
            caseSensitive: false,
            pcSync: false,

        }),

        //========================================================================================================
        // MOUNTED
        //========================================================================================================
        async mounted () {
            // User check ==========================================
            await Common.auth(this);

            this.hosts = (await hostService.hosts()).data;
        },
        watch: {
            selectedPC: {
                async handler (val) {

                    let oldPC = this.overridesIDs;
                    let newPC = val;

                    console.log(oldPC);
                    console.log(newPC);

                    if (this.pcSync) {
                        for (let i in val) {
                            let found = (findId(this.allPuppetClasses, val[i]));
                            if (found) {
                                if (found.hasOwnProperty("base_id")) {
                                    let data = (await SmartClassesService.getById(found.base_id)).data;
                                    if (this.overrides.hasOwnProperty(data.PuppetClass)) {
                                        this.overrides[data.PuppetClass].push({
                                            parameter: data.Name,
                                            type: data.ValueType,
                                            value: "",
                                        })
                                    } else {
                                        this.overrides[data.PuppetClass] = [];
                                        this.overrides[data.PuppetClass].push({
                                            parameter: data.Name,
                                            type: data.ValueType,
                                            value: "",
                                        })
                                    }

                                } else {
                                    // console.log(found);
                                }
                            }
                        }
                    }
                }
            },
            host: {
                async handler (val) {

                    this.overrides = [];
                    this.location = null;
                    this.allPuppetClasses = (await pcService.All(this.host)).data;
                    let tmp =  (await locationsService.List()).data;
                    for (let i in tmp) {
                        if (tmp[i].host === val) {
                            this.locations = tmp[i].locations
                        }
                    }
                }
            },
            location: {
                async handler (val) {
                    this.pcSync = false;
                    let tmp = (await locationsService.Overrides(val, this.host)).data;
                    tmp.sort((a, b) => a.puppet_class > b.puppet_class);
                    this.overrides = tmp;
                    // let res = {};
                    // for (let i in tmp) {
                    //     res[tmp[i].puppet_class] = [];
                    // }
                    //
                    // for (let i in tmp) {
                    //     let id = checkByName(this.allPuppetClasses, tmp[i].puppet_class, tmp[i].smart_class_name);
                    //
                    //     this.selectedPC.push(id);
                    //     this.overridesIDs.push(id);
                    //
                    //     res[tmp[i].puppet_class].push({
                    //         parameter: tmp[i].smart_class_name,
                    //         type: tmp[i].type,
                    //         value: tmp[i].value,
                    //         foreman_sc_id: tmp[i].sc_foreman_id,
                    //         foreman_ovr_id: tmp[i].ovr_foreman_id,
                    //     });
                    // }
                    // this.overrides = res;
                    this.pcSync = true;
                }
            },
        },
        methods: {}
    }

    function findId(arr, id) {
        for (let e in arr) {
            if (arr[e].id === id) { return arr[e] }
            let found = findId(arr[e].children, id);
            if (found) { return found }
        }
    }

    function checkByName(arr, pcName, scName) {
        for (let e in arr) {
            if (pcName == arr[e].name) {
                let ch = arr[e]["children"];
                for (let j in ch) {
                    if (scName == ch[j].name) {
                        return ch[j].id;
                    }
                }
            }
        }
        return scName;
    }
</script>

<style></style>
