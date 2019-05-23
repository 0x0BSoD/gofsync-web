<template>
    <v-container fluid>
        <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
        <v-label>NOTE: all ID's will be ignored</v-label>
<!-- ============================================= Top Panel ============================================= -->
        <v-layout row wrap>
            <v-flex xs12>
                <v-layout row wrap>
                    <v-flex xs2 mr-2 mt-1>
                        <v-autocomplete
                                v-model="host"
                                :items="hosts"
                                label="Classes source Host"
                                persistent-hint
                                solo
                        >
                        </v-autocomplete>
                    </v-flex>
                    <v-flex xs2 mt-1>
                        <v-autocomplete
                                v-model="hostGroupId"
                                :items="hostGroups"
                                :disabled="!host"
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
                                title="load JSON"
                                accept=".json"
                                @file-update="fileChanged"
                        >
                        </upload-btn>
                    </v-flex>
                    <v-flex ml-5 xs5>
                        <v-layout row wrap>
                            <v-flex xs4 mr-3>
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
                            <v-flex xs2>
                                <v-btn large>save</v-btn>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-flex>
<!-- ========================================================== -->
            <v-flex xs12 mb-2>
                <v-tabs
                    fixed-tabs
                    v-model="tab"
                >
                    <v-tab>
                        Visual
                    </v-tab>
                    <v-tab>
                        JSON
                    </v-tab>
                </v-tabs>
            </v-flex>
<!-- ========================================================== -->

            <v-flex xs12>

            </v-flex>
        </v-layout>


<!-- ============================================= /Top Panel ============================================= -->

        <v-layout row wrap>
                    <v-flex xs12 mb-3>
                        <v-btn
                                small
                                @click.stop="dialogPuppetClasses = true"
                                :loading="loadingPC"
                                :disabled="loadingPC || !allPuppetClassesFull"
                        >add puppet class</v-btn>
                    </v-flex>
<!--================================================================================================================-->


                    <v-flex xs12 v-if="tab === 0">
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
                                                v-if="sc"
                                        >
                                            <v-expansion-panel focusable v-if="sc.smart_classes" class="pcPanel">
                                                <v-expansion-panel-content>
                                                    <template v-slot:header>
                                                        {{sc.subclass}}
                                                        <v-spacer></v-spacer>
                                                        <v-chip class="puppetLabel" v-if="sc.overrides" label>have overrides</v-chip>
                                                        <v-btn class="puppetLabel" color="warning" icon @click.stop="rmPC(idx, sc.subclass)"><v-icon>delete</v-icon></v-btn>
                                                    </template>
                                                    <v-card>
                                                        <v-card-actions
                                                                v-for="(scp, i) in sc.smart_classes"
                                                                :key="i"
                                                        >
                                                            {{scp}}
                                                            <v-spacer></v-spacer>
                                                            <v-chip class="puppetLabel" v-if="sc.overrides && sc.overrides.includes(scp)" label>have overrides</v-chip>
                                                            <v-btn class="puppetLabel" color="primary" icon @click.stop="editDialog(idx, sc.subclass, scp)"><v-icon>edit</v-icon></v-btn>
                                                        </v-card-actions>
                                                    </v-card>
                                                </v-expansion-panel-content>
                                            </v-expansion-panel>
                                            <v-card-actions v-else>
                                                {{sc.subclass}}
                                                <v-spacer></v-spacer>
                                                <v-btn class="puppetLabel" color="warning" icon @click.stop="rmPC(idx, sc.subclass)"><v-icon>delete</v-icon></v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-flex>

                </v-layout>

            <v-flex xs12 v-if="tab === 1">
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



<!--  ========================================================================================================      -->
        <v-dialog
                v-model="dialogParamEditor"
                scrollable
                max-width="600px"
        >
            <v-card
                    class="mx-auto"
            >
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">{{parameterEditTitle}}</h3>
                        <v-chip label>{{parameterEditType}}</v-chip>
                    </div>
                </v-card-title>
                <v-card-text>
                    <v-textarea
                            box
                            v-model="parameterEditValue"
                            :label="parameterEditDefaultValue"
                    >
                    </v-textarea>

                </v-card-text>
                <v-card-actions>
                    <v-btn flat>save</v-btn>
                    <v-btn flat color="warning">CLEAR OVERRIDE</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
                v-model="dialogPuppetClasses"
                scrollable
                max-width="600px"
        >
                    <v-card
                            class="mx-auto"
                    >
                        <v-sheet class="pa-3 primary lighten-2">
                            <v-text-field
                                    v-model="search"
                                    label="Search"
                                    dark
                                    flat
                                    solo-inverted
                                    hide-details
                            ></v-text-field>
                        </v-sheet>
                        <v-expansion-panel>
                            <v-expansion-panel-content
                                    v-for="(val, key) in allPuppetClasses"
                                    :key="key"
                                    v-if="val.length > 0"
                            >
                                <template v-slot:header>
                                    <div><v-chip
                                            class="primary lighten-2"
                                            color="primary lighten-2"
                                            outline
                                            label>{{key}}</v-chip></div>
                                </template>
                            <v-card
                                v-for="(lval, k) in val"
                                :key="k"
                            >
                                <v-card-text
                                        v-if="!lval.InHostGroup"
                                >
                                    <v-layout row>
                                        <v-flex xs10>
                                            {{lval.SubClass}}
                                        </v-flex>
                                        <v-flex xs2>
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <v-btn small color="primary" v-on="on" @click="addPuppetClass(lval)">add</v-btn>
                                                </template>
                                                <span>{{lval.SubClass}}</span>
                                            </v-tooltip>

                                        </v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-card>
        </v-dialog>
        <v-snackbar
                v-model="pcNotify"
                :bottom="true"
                :timeout="4000"
        >
            {{ pcNotifyMsg }}
            <v-btn
                    color="pink"
                    flat
                    icon
                    @click="pcNotify = false"
            >
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>
    </v-container>
</template>

<script>

    import { hostGroupService, pcService, hostService, SmartClassesService } from "../../_services"
    import { EditorMethods } from "../editor/methods"
    import { PuppetMethods } from "../hostgroup/methods"
    import { Common } from "../methods";
    import _ from 'lodash'
    import UploadButton from 'vuetify-upload-button';

    import 'codemirror/mode/javascript/javascript.js'
    import 'codemirror/addon/selection/active-line.js'
    import 'codemirror/addon/edit/closebrackets.js'
    // foldGutter
    import 'codemirror/addon/fold/foldgutter.css'
    import 'codemirror/addon/fold/brace-fold.js'
    import 'codemirror/addon/fold/comment-fold.js'
    import 'codemirror/addon/fold/foldcode.js'
    import 'codemirror/addon/fold/foldgutter.js'
    import 'codemirror/addon/fold/indent-fold.js'
    import 'codemirror/addon/fold/markdown-fold.js'
    import 'codemirror/addon/fold/xml-fold.js'
    export default {
        //========================================================================================================
        // COMPONENTS
        //========================================================================================================
        components: {
            'upload-btn': UploadButton
        },

        //========================================================================================================
        // COMPOUNDED
        //========================================================================================================
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
                gutters: ["CodeMirror-foldgutter", "CodeMirror-linenumbers"],
            },
            JSONCode: "{}",
            JSONObject: "{}",
            jsonError: false,
            jsonMsg: "",
            hgName: null,
            envName: null,
            puppetClasses: [],
            dialogPuppetClasses: false,
            dialogParamEditor: false,
            checkbox: false,
            allPuppetClasses: [],
            allPuppetClassesFull: [],
            search: null,
            caseSensitive: false,
            host: null,
            hosts: [],
            loadingPC: false,
            tab: 0,
            pcNotify: false,
            pcNotifyMsg: null,
            parameterEditTitle: null,
            parameterEditType: null,
            parameterEditValue: null,
            parameterEditDefaultValue: null,
        }),

        //========================================================================================================
        // MOUNTED
        //========================================================================================================
        async mounted () {
            // User check ==========================================
            await Common.auth(this);

            // ==========================================
            try {
                this.wip = true;
                this.hosts = (await hostService.hosts()).data;
                if (localStorage.getItem("lastHost") !== null) {
                    this.host =  localStorage.getItem('lastHost');
                }
                if (localStorage.getItem("lastTab") !== null) {
                    this.tab =  localStorage.getItem('lastTab');
                }
                if (localStorage.getItem("jsonInput") !== null) {
                    this.JSONCode = JSON.parse(localStorage.getItem('jsonInput'));
                    this.JSONObject = JSON.parse(this.JSONCode);
                    this.loadingPC = true;
                    this.allPuppetClassesFull = (await pcService.allPC(this.host)).data;
                    this.allPuppetClasses = _.clone(this.allPuppetClassesFull);
                    this.search = null;
                    EditorMethods.resetPC(this);
                    EditorMethods.checkPC(this);
                    EditorMethods.sortPC(this);
                    this.loadingPC = false;
                }
                this.hostGroups = (await hostGroupService.hgAllList()).data;
                this.wip = false;
            } catch (e) {
                console.error(e.message);
                this.wip = false;
            }
        },

        //========================================================================================================
        // WATCH
        //========================================================================================================
        watch: {
            tab: {
              handler (val) {
                  localStorage.setItem('lastTab', val);
              }
            },
            host: {
                async handler (val) {
                    this.loadingPC = true;
                    this.allPuppetClassesFull = (await pcService.allPC(val)).data;
                    this.allPuppetClasses = _.clone(this.allPuppetClassesFull);
                    this.search = null;
                    localStorage.setItem('lastHost', val);
                    this.loadingPC = false;
                }
            },
            search: {
                async handler (val) {
                    if (this.search) {
                        this.allPuppetClasses = {};
                        for (let i in this.allPuppetClassesFull) {
                            for (let j in this.allPuppetClassesFull[i]) {
                                if (this.allPuppetClassesFull[i][j].SubClass.includes(val)) {
                                    this.allPuppetClasses[i] = this.allPuppetClassesFull[i];
                                }
                            }
                        }
                    } else {
                        this.allPuppetClasses = _.clone(this.allPuppetClassesFull);
                    }
                }
            },
            JSONObject: {
                handler () {
                    EditorMethods.resetPC(this);
                    EditorMethods.checkPC(this);
                    EditorMethods.sortPC(this);
                    // this.JSONCode = JSON.stringify(val, " ", "  ");
                }
            },
            JSONCode:
                _.debounce(async function (val) {
                    // this.search = null;
                    // this.loadingPC = true;
                    // this.allPuppetClasses = {};
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

                        EditorMethods.resetPC(this);
                        EditorMethods.checkPC(this);
                        EditorMethods.sortPC(this);

                        this.loadingPC = false;
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
                    this.allPuppetClasses = {};
                    this.loadingPC = true;
                    try {
                        this.search = null;
                        this.hostGroup = (await hostGroupService.hg("spb01-puppet.lab.nordigy.ru", val)).data;
                        this.JSONObject = this.hostGroup;
                        let pcData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                        this.puppetClasses = pcData.PuppetClasses;

                        this.loadingPC = false;
                    } catch (e) {
                        console.error(e);
                    }
                }
            },

        },

        //========================================================================================================
        // METHODS
        //========================================================================================================
        methods: {
            addPuppetClass (data) {
                this.pcNotify = false;
                if (this.JSONObject.puppet_classes.hasOwnProperty(data.Class)) {
                    if (data.Parameters) {
                        this.JSONObject.puppet_classes[data.Class].push({
                            "subclass": data.SubClass,
                            "smart_classes": data.Parameters.map(item => item.Name),
                        });
                    } else {
                        this.JSONObject.puppet_classes[data.Class].push({
                            "subclass": data.SubClass,
                        });
                    }
                    data.InHostGroup = true;
                } else {
                    if (data.Parameters) {
                        this.JSONObject.puppet_classes[data.Class]=([{
                            "subclass": data.SubClass,
                            "smart_classes": data.Parameters.map(item => item.Name),
                        }]);
                    } else {
                        this.JSONObject.puppet_classes[data.Class]=([{
                            "subclass": data.SubClass,
                        }]);
                    }
                    data.InHostGroup = true;
                }

                EditorMethods.sortPC(this);
                this.JSONCode = JSON.stringify(this.JSONObject, " ", "  ");
                this.pcNotifyMsg = `${data.Class} => ${data.SubClass} Added`;
                this.pcNotify = true;
            },
            async editDialog (_class, subClass, parameter) {
                this.parameterEditTitle = null;
                this.parameterEditValue = null;
                this.parameterEditType = null;
                this.parameterEditDefaultValue = null;

                this.parameterEditTitle = `${subClass} => ${parameter}`;
                this.parameterEditValue = null;

                for (let i in this.JSONObject.puppet_classes[_class]) {
                    if (this.JSONObject.puppet_classes[_class][i].hasOwnProperty("overrides")) {
                        for (let j in this.JSONObject.puppet_classes[_class][i]["overrides"]) {
                            if (this.JSONObject.puppet_classes[_class][i]["overrides"][j]["parameter"] === parameter) {
                                console.log(this.JSONObject.puppet_classes[_class][i]["overrides"][j]);
                                this.parameterEditValue = this.JSONObject.puppet_classes[_class][i]["overrides"][j]["value"];
                                try {
                                    let _id = this.JSONObject.puppet_classes[_class][i]["overrides"][j]["smart_class_id"];
                                    let dump = JSON.parse((await SmartClassesService.getById(_id)).data["Dump"]);
                                    this.parameterEditType = dump["parameter_type"];
                                    this.parameterEditDefaultValue = `Default: ${dump["default_value"]!=="" ? dump["default_value"] :"NOPE"}`;
                                }catch (e) {
                                    this.parameterEditType = "NOPE";
                                }
                            }
                        }
                    }
                }

                this.dialogParamEditor = true;
            },
            rmPC (_class, subClass) {
                this.pcNotify = false;
                if (this.JSONObject.puppet_classes[_class]) {
                    if (this.JSONObject.puppet_classes[_class].length !== 0) {
                        for (let i in this.JSONObject.puppet_classes[_class]) {
                            if (this.JSONObject.puppet_classes[_class][i]["subclass"] === subClass) {
                                console.info(delete this.JSONObject.puppet_classes[_class][i]);
                            }
                        }
                    } else {
                        console.info(delete this.JSONObject.puppet_classes[_class]);
                    }

                }

                EditorMethods.resetPC(this);
                EditorMethods.checkPC(this);
                EditorMethods.sortPC(this);
                this.JSONObject = Common.pruneEmpty(this.JSONObject);
                this.JSONCode = JSON.stringify(this.JSONObject, " ", "  ");

                this.pcNotifyMsg = `${_class} => ${subClass} Removed`;
                this.pcNotify = true;
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
    .CodeMirror {
        height: 100%;
        z-index: 0;
    }
</style>
