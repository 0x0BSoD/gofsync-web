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
                        <v-btn small @click.stop="dialog = true">add puppet class</v-btn>
                    </v-flex>
                    <v-flex xs12
                        v-for="(val, idx) in puppetClasses"
                        :key="idx"
                    >
                        {{val}}
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
<!--                <v-textarea-->
<!--                        box-->
<!--                        name="input-7-4"-->
<!--                        label="JSON"-->
<!--                        value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."-->
<!--                ></v-textarea>-->
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
                                    :open.sync="open"
                                    open-on-click
                                    selectable
                            >
                            </v-treeview>
                        </v-card-text>
                    </v-card>

<!--                <v-card-actions>-->
<!--                    <v-spacer></v-spacer>-->

<!--                    <v-btn-->
<!--                            color="green darken-1"-->
<!--                            flat="flat"-->
<!--                            @click="dialog = false"-->
<!--                    >-->
<!--                        Add-->
<!--                    </v-btn>-->
<!--                </v-card-actions>-->
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
                puppet_classes: {},
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
            jsonError: false,
            jsonMsg: "",
            hgName: null,
            envName: null,
            puppetClasses: [],
            dialog: false,
            checkbox: false,
            allPuppetClasses: {},
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
                this.allPuppetClasses = (await pcService.allPC()).data;
                console.log(this.allPuppetClasses);
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
                        this.jsonError = false;
                        localStorage.setItem('jsonInput', JSON.stringify(val));
                        this.hgName = HGObject.name;
                        this.envName = HGObject.environment;
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
            async buildPuppetClassTree () {
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
