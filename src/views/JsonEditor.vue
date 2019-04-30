<template>
    <v-container>
        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
        <v-label>NOTE: all ID's will be ignored</v-label>
<!-- ============================================= Top Panel ============================================= -->
        <v-layout row wrap>
            <v-flex xs2 mt-1>
                <v-autocomplete
                        v-model="hostGroupId"
                        :items="hostGroups"
                        label="Host Group"
                        persistent-hint
                        item-text="name"
                        item-value="id"
                        solo
                >
                    <template slot="item" slot-scope="data">
                        <v-list-tile-content>
                            <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                        </v-list-tile-content>
                    </template>
                </v-autocomplete>
            </v-flex>
            <v-flex xs2>
                <upload-btn
                        color="default"
                        large
                        title="Upload JSON"
                        accept=".json"
                        :fileChangedCallback="fileChanged"
                >
                </upload-btn>
            </v-flex>
        </v-layout>
<!-- ============================================= /Top Panel ============================================= -->

        <v-layout row wrap>
            <v-flex xs6 pr-4>
                <v-layout row wrap>
                    <v-flex xs4 mr-5>
                        <v-text-field
                                label="Host Group name"
                                v-model="hgName"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                        <v-text-field
                                label="Environment name"
                                v-model="envName"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 mb-3>
                        <v-btn small :disabled="true" @click.stop="dialog = true">add puppet class</v-btn>
                    </v-flex>

                    <v-flex xs12>
                        <v-expansion-panel focusable>
                            <v-expansion-panel-content
                                    v-for="(val, idx) in JSONObject.puppet_classes"
                                    :key="idx"
                            >
                                <template v-slot:header>
                                    <div>{{idx}}</div>
                                </template>
                                <v-card>
                                    <v-card-text class="grey lighten-3">
                                        <v-card
                                                v-for="(sc, jdx) in val"
                                                :key="jdx"
                                                class="mb-1"
                                        >
                                            <v-expansion-panel focusable v-if="sc.smart_classes">
                                                <v-expansion-panel-content>
                                                    <template v-slot:header>
                                                        {{sc.subclass}}
                                                        <v-spacer></v-spacer>
                                                        <v-chip class="puppetLabel" v-if="sc.overrides" label>have overrides</v-chip>
                                                        <v-btn class="puppetLabel" icon @click.stop=""><v-icon>delete</v-icon></v-btn>
                                                    </template>
                                                    <v-card>
                                                        <v-card-actions
                                                                v-for="(scp, i) in sc.smart_classes"
                                                                :key="i"
                                                        >
                                                            {{scp}}
                                                            <v-spacer></v-spacer>
                                                            <v-chip class="puppetLabel" v-if="sc.overrides.includes(scp)" label>have overrides</v-chip>
                                                            <v-btn class="puppetLabel" icon @click.stop="editDialog(sc.subclass, scp)"><v-icon>edit</v-icon></v-btn>
                                                            <v-btn class="puppetLabel" icon @click.stop=""><v-icon>delete</v-icon></v-btn>
                                                        </v-card-actions>
                                                    </v-card>
                                                </v-expansion-panel-content>
                                            </v-expansion-panel>
                                            <v-card-actions v-else>
                                                {{sc.subclass}}
                                            </v-card-actions>
                                        </v-card>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-flex>

                </v-layout>
            </v-flex>
            <v-flex xs6>
                <v-alert
                        v-model="jsonError"
                        type="warning"
                        dense
                >
                    {{jsonMsg}}
                </v-alert>
                <codemirror
                        v-model="JSONCode"
                        :options="cmOptions">
                </codemirror>
            </v-flex>
        </v-layout>



<!--  ========================================================================================================      -->
        <v-dialog
                v-model="dialog"
                scrollable
                max-width="800px"
        >
                    <v-card
                            class="mx-auto"
                    >
                        <v-sheet class="pa-3 primary lighten-2">
                            <v-text-field
                                    v-model="search"
                                    label="Search Company Directory"
                                    dark
                                    flat
                                    solo-inverted
                                    hide-details
                                    clearable
                                    clear-icon="mdi-close-circle-outline"
                            ></v-text-field>
                            <v-checkbox
                                    v-model="caseSensitive"
                                    dark
                                    hide-details
                                    label="Case sensitive search"
                            ></v-checkbox>
                        </v-sheet>
                        <v-card-text>
                            <v-treeview
                                    :items="allPuppetClasses"
                                    :search="search"
                                    :filter="filter"
                                    open-on-click
                                    selectable
                            >
                            </v-treeview>
                        </v-card-text>
                    </v-card>
        </v-dialog>
    </v-container>
</template>

<script>

    import { hostGroupService, pcService } from "../_services"
    import { PuppetMethods } from "./hostgroup/methods"
    import { Common } from "./methods";
    import _ from 'lodash'
    import UploadButton from 'vuetify-upload-button';

    import 'codemirror/mode/javascript/javascript.js'
    import'codemirror/addon/selection/active-line.js'
    import'codemirror/addon/edit/closebrackets.js'
    window.JSHINT = require('jshint').JSHINT;
    window.jsonlint = require('jsonlint');
    import'codemirror/addon/lint/lint.js'
    import'codemirror/addon/lint/json-lint.js'
    import'codemirror/addon/lint/javascript-lint.js'
    // foldGutter
    import'codemirror/addon/fold/foldgutter.css'
    import'codemirror/addon/fold/brace-fold.js'
    import'codemirror/addon/fold/comment-fold.js'
    import'codemirror/addon/fold/foldcode.js'
    import'codemirror/addon/fold/foldgutter.js'
    import'codemirror/addon/fold/indent-fold.js'
    import'codemirror/addon/fold/markdown-fold.js'
    import'codemirror/addon/fold/xml-fold.js'
    export default {

        components: {
            'upload-btn': UploadButton
        },

        computed: {
            codemirror() {
                return this.$refs.myCm.codemirror
            },
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
            hostGroupId: null,
            hostGroups: [],
            wip: false,
            hostGroup: {
                id: null,
                foreman_id: null,
                name: null,
                environment: null,
                parent_id: null,
                puppet_classes: [],
                updated: null,
            },
            cmOptions: {
                tabSize: 4,
                mode: {
                    name: 'javascript',
                    json: true
                },
                foldGutter: true,
                lint: true,
                autoCloseBrackets: true,
                styleActiveLine: true,
                lineNumbers: true,
                line: true,
                gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter", "CodeMirror-linenumbers",],
            },
            JSONCode: "{}",
            JSONObject: "{}",
            jsonError: false,
            jsonMsg: "",
            hgName: null,
            envName: null,
            puppetClasses: [],
            dialog: false,
            checkbox: false,
            allPuppetClasses: [],
            search: null,
            caseSensitive: false,
        }),

        //========================================================================================================
        // MOUNTED
        //========================================================================================================
        async mounted () {
            // User check ==========================================
            await Common.auth(this);

            // Load Hosts ==========================================
            try {
                if (localStorage.getItem("jsonInput") !== null) {
                    this.JSONCode = JSON.parse(localStorage.getItem('jsonInput'));
                    // this.JSONCode = JSON.stringify(HGObject, " ", "  ");
                }
                this.wip = true;
                this.hostGroups = (await hostGroupService.hgAllList()).data;
                this.allPuppetClasses = (await pcService.allPC("spb01-puppet.lab.nordigy.ru")).data;
                this.wip = false;
            } catch (e) {
                console.error(e.message);
                this.wip = false;
            }
        },
        watch: {
            JSONCode:
                _.debounce(async function (val) {
                    try {
                        let HGObject = JSON.parse(val);
                        this.JSONObject = HGObject;
                        this.jsonError = false;
                        localStorage.setItem('jsonInput', JSON.stringify(val));
                        this.hgName = HGObject.name;
                        this.envName = HGObject.environment;

                        if (!HGObject.hasOwnProperty("name")) {
                            this.jsonError = true;
                            this.jsonMsg = "Name required";
                        }
                        if (!HGObject.hasOwnProperty("environment")) {
                            this.jsonError = true;
                            this.jsonMsg = "Environment required";
                        }


                    } catch (e) {
                        let err_msg =  e.message;
                        let msg = err_msg.split(":");
                        console.log("Error in JSON ", msg);
                        this.jsonError = true;
                        this.jsonMsg = msg[1];
                    }
                }, 1000),
            hostGroupId: {
                async handler (val) {
                    try {
                        this.hostGroup = (await hostGroupService.hg("spb01-puppet.lab.nordigy.ru", val)).data;
                        let pcData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                        this.puppetClasses = pcData.PuppetClasses;

                        this.JSONCode = JSON.stringify(this.hostGroup, " ", "  ");
                        this.hgName = this.hostGroup.name;
                        this.envName = this.hostGroup.environment;

                    } catch (e) {
                        console.error(e);
                    }
                }
            },

        },
        methods: {
            async editDialog (subc, scp) {
                console.log(subc);
                console.log(scp);
            },
            fileChanged (file) {
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    let reader = new FileReader();
                    reader.onload = (function(t) {
                        return function(e) {
                            t.JSONCode = e.target.result;
                        };
                    })(this);
                    reader.readAsText(file);
                } else {
                    console.error('The File APIs are not fully supported in this browser.');
                }
            },
        }
    }
</script>

<style>
    .puppetLabel {
        flex: unset !important;
    }
    /*.v-expansion-panel__header {*/
    /*    padding: 0;*/
    /*    margin: 0;*/
    /*}*/

    .vue-codemirror {
        /* Firefox */
        height: -moz-calc(100vh - 190px);
        /* WebKit */
        height: -webkit-calc(100vh - 190px);
        /* Opera */
        height: -o-calc(100vh - 190px);
        /* Standard */
        height: calc(100vh - 190px);
    }
    .CodeMirror {
        height: 100%;
        z-index: 0;
    }
</style>
