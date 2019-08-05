<template>
    <v-container>

        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
        <!-- ============================================= Top Panel ============================================= -->
        <v-layout row wrap>
            <v-flex v-if="wip" xs12>
                <v-chip label v-if="nowActions">{{nowActions.actions}}</v-chip>
                <v-chip label v-if="nowActions.state">{{nowActions.state}}</v-chip>
            </v-flex>
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
                        item-text="name"
                        item-value="name"
                >
                </v-autocomplete>
            </v-flex>
                        <v-flex xs5>
            <!--                <v-btn large>add new location</v-btn>-->
                            <v-btn v-if="location" :disabled="wip" large @click="submitBtn(host, location)">save</v-btn>
                            <v-btn v-if="location" :disabled="wip" large @click="submitAsDialog(location)">save as</v-btn>
                        </v-flex>
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
                                                                    <v-chip
                                                                            v-if="param.old_val !== param.value"
                                                                            dark label> CHANGED</v-chip>
                                                                    <v-chip label> {{ param.type }}</v-chip>
                                                                </v-flex>
                                                                <v-flex>
                                                                    <h3 class="headline mb-0">{{ param.name }} || FID:
                                                                        <strong>{{param.parameter_foreman_id}}</strong>
                                                                    </h3>
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
                                                        <!--                                                                <v-btn flat color="warning">delete</v-btn>-->
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

                <v-dialog
                        v-model="dialog"
                        max-width="800px"
                >
                    <v-card
                            class="mx-auto"
                    >
                        <v-toolbar class="text-xs-center" dark color="#7ac2ff">
                            <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                            <v-spacer></v-spacer>
                        </v-toolbar>
                        <v-card-text>
                            <v-layout  row wrap>
                                <v-flex v-if="submitting" xs12 class="text-xs-center pt-2">
                                    <fingerprint-spinner
                                            class="spinner"
                                            :animation-duration="1500"
                                            :size="64"
                                            color="#7ac2ff"
                                    />
                                </v-flex>
                                <v-flex v-if="!submitting" xs12>
                                    <v-autocomplete
                                            v-model="tHost"
                                            :items="hosts"
                                            label="Target Host"
                                            item-text="name"
                                            item-value="name"
                                            persistent-hint
                                            outline
                                    >
                                    </v-autocomplete>
                                </v-flex>
                                <v-flex v-if="!submitting" xs12>
                                    <v-text-field
                                            v-model="locNewName"
                                            :disabled="!tHost"
                                            label="location new name"
                                            persistent-hint
                                            outline
                                    >
                                    </v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-card-text>
                    <v-card-actions>
                        <v-btn :disabled="!locNewName" @click="submitAsBtn()">save</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click.native="dialog = !dialog">cancel</v-btn>
                    </v-card-actions>
                    </v-card>
                </v-dialog>
    </v-container>
</template>

<script>
    import {Common} from "../methods";
    import { hostService, locationsService, pcService, SmartClassesService } from "../../_services"
    import {FingerprintSpinner} from 'epic-spinners'

    export default {

        components: {
            FingerprintSpinner
        },


        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
        computed: {
            nowActions() {
                return this.$store.state.socketModule.socket.message;
            },
            filter() {
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
            locNewName: null,
            hosts: [],
            host: null,
            tHost: null,
            overrides: [],
            overridesIDs: [],
            allPuppetClasses: [],
            wip: false,
            submitting: false,
            dialog: false,
            dialogTitle: null,
            search: null,
            caseSensitive: false,
            pcSync: false,

        }),

        //========================================================================================================
        // MOUNTED
        //========================================================================================================
        async mounted() {
            // User check ==========================================
            await Common.auth(this);

            this.hosts = (await hostService.hosts()).data;

            if (this.$route.query.hasOwnProperty("source")
                && Common.inHosts(this.hosts, this.$route.query.source)) {
                this.host = this.$route.query.source;
            }
        },
        watch: {
            selectedPC: {
                async handler(val) {

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
                async handler(val) {
                    this.overrides = [];
                    this.location = null;
                    this.allPuppetClasses = (await pcService.All(this.host)).data;
                    let tmp = (await locationsService.List()).data;
                    for (let i in tmp) {
                        if (tmp[i].host === val) {
                            this.locations = tmp[i].locations
                        }
                    }

                    if (this.$route.query.hasOwnProperty("location")) {
                        this.location = this.$route.query.location;
                    }
                }
            },
            location: {
                async handler(val) {
                    this.wip = true;
                    this.pcSync = false;
                    let tmp = (await locationsService.Overrides(val, this.host)).data;
                    // tmp.sort((a, b) => a.puppet_class > b.puppet_class);
                    let res = [];
                    for (let i in tmp) {
                        tmp[i].changed = false;
                        for (let p in tmp[i].parameters) {
                            tmp[i].parameters[p].old_val = tmp[i].parameters[p].value;
                            console.log(tmp[i].parameters[p]);
                        }
                        res.push(tmp[i]);

                    }
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
                    this.overrides = res;
                    this.pcSync = true;
                    this.wip = false;
                }
            },
        },
        methods: {
            async submit (params) {
                try {
                    this.wip = true;
                    this.submitting = true;
                    let resp = (await locationsService.Submit(params)).data;
                    console.log(resp);
                } catch (e) {
                    console.error(e);
                } finally {
                    this.dialog = false;
                    this.submitting = false;
                    this.wip = false;
                }
            },
            submitBtn (target, name) {
                let params = {
                    "name": name,
                    "source": this.host,
                    "target": target,
                    "data": this.overrides,
                };
                this.submit(params);
            },
            submitAsDialog (name) {
                this.dialog = true;
                this.dialogTitle = name;
            },
            submitAsBtn () {

                let params = {
                    "name": this.locNewName,
                    "source": this.host,
                    "target": this.tHost,
                    "data": this.overrides,
                };
                this.submit(params);
            }
        }
    }

    function findId(arr, id) {
        for (let e in arr) {
            if (arr[e].id === id) {
                return arr[e]
            }
            let found = findId(arr[e].children, id);
            if (found) {
                return found
            }
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
