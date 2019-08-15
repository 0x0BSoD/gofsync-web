<template>
    <v-container fluid>
        <v-layout row wrap v-if="wip" class="text-xs-center">
            <v-flex xs12>
                <v-chip label v-if="nowActions">{{nowActions.actions}}</v-chip>
                <v-chip label v-if="nowActions.state">{{nowActions.state}}</v-chip>
            </v-flex>
        </v-layout>
        <v-label>NOTE: all ID's will be ignored</v-label>
        <!-- ============================================= Top Panel ============================================= -->
        <v-layout row wrap>
            <v-flex xs12>
                <v-alert
                        v-model="hgError"
                        dismissible
                        type="error"
                >
                    {{hgErrorMsg}}
                </v-alert>
                <v-alert
                        v-model="hgDone"
                        dismissible
                        type="success"
                >
                    {{hgDoneMsg}}
                </v-alert>
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
                            <v-flex xs4 mr-3 mt-1>
                                <v-text-field
                                        solo
                                        label="Host Group name"
                                        v-model="hgName"
                                        :disabled="tab === 1"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs4 mt-1>
                                <v-text-field
                                        solo
                                        label="Environment name"
                                        v-model="envName"
                                        :disabled="tab === 1"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs2 v-if="existingHG">
                                <v-btn
                                        large
                                        @click="save()"
                                        :loading="creatingHG"
                                        :disabled="creatingHG || !hgName"
                                >update
                                </v-btn>
                            </v-flex>
                            <v-flex xs2 v-else>
                                <v-btn
                                        large
                                        @click="save()"
                                        :loading="creatingHG"
                                        :disabled="creatingHG || !hgName"
                                >save
                                </v-btn>
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
                        v-if="host"
                        small
                        @click.stop="dialogPuppetClasses = true"
                        :loading="loadingPC"
                        :disabled="loadingPC || !allPuppetClassesFull"
                >add puppet class
                </v-btn>
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
                            <v-card-text class=" grey lighten-3">
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
                                                <v-chip class="puppetLabel" v-if="sc.overrides" label>have overrides
                                                </v-chip>
                                                <v-btn class="puppetLabel" color="warning" icon
                                                       @click.stop="rmPC(idx, sc.subclass)">
                                                    <v-icon>delete</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-card>
                                                <v-card-actions
                                                        v-for="(scp, i) in sc.smart_classes"
                                                        :key="i"
                                                >
                                                    {{scp.name}}
                                                    <v-spacer></v-spacer>
                                                    <v-chip class="puppetLabel"
                                                            v-if="labelCheck(sc.overrides, scp.name)" label>override
                                                    </v-chip>
                                                    <v-btn class="puppetLabel" color="ml-2 primary" icon
                                                           @click.stop="editDialog(idx, sc.subclass, scp.name)">
                                                        <v-icon>edit</v-icon>
                                                    </v-btn>
                                                </v-card-actions>
                                            </v-card>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                    <v-card-actions v-else class="pt-3 pb-3">
                                        {{sc.subclass}}
                                        <v-spacer></v-spacer>
                                        <v-btn class="puppetLabel" color="warning" icon
                                               @click.stop="rmPC(idx, sc.subclass)">
                                            <v-icon>delete</v-icon>
                                        </v-btn>
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
                    <!--                    <v-btn color="success" @click="storeOverride()" flat>save</v-btn>-->
                    <v-btn flat @click="dialogParamEditor = false">cancel</v-btn>
                    <v-spacer></v-spacer>
                    <!--                    <v-btn flat :disabled="!parameterEditValue" color="warning">CLEAR OVERRIDE</v-btn>-->
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
                            <div>
                                <v-chip
                                        class="primary lighten-2"
                                        color="primary lighten-2"
                                        outline
                                        label>{{key}}
                                </v-chip>
                            </div>
                        </template>
                        <v-card
                                v-for="(lval, k) in val"
                                :key="k"
                        >
                            <v-card-text
                                    v-if="!lval.in_host_group"
                            >
                                <v-layout row>
                                    <v-flex xs10>
                                        {{lval.sub_class}}
                                    </v-flex>
                                    <v-flex xs2>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn small color="primary" v-on="on" @click="addPuppetClass(lval)">
                                                    add
                                                </v-btn>
                                            </template>
                                            <span>{{lval.sub_class}}</span>
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

    import {hostGroupService, hostService, pcService, SmartClassesService} from "../../_services"
    import {EditorMethods} from "../editor/methods"
    import {PuppetMethods} from "../hostgroup/methods"
    import {Common} from "../methods";
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
            nowActions() {
                return this.$store.state.socketModule.socket.message;
            },
            codemirror() {
                return this.$refs.myCm.codemirror
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
            class: null,
            dump: null,
            hgError: false,
            hgErrorMsg: null,
            hgDone: false,
            hgDoneMsg: null,
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
            SourceName: null,
            hosts: [],
            loadingPC: false,
            tab: 1,
            creatingHG: false,
            existingHG: false,
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
        async mounted() {
            // User check ==========================================
            await Common.auth(this);

            // //this.$connect();

            // ==========================================
            try {
                this.wip = true;
                this.hosts = (await hostService.hosts()).data;
                // this.hostGroups = (await hostGroupService.AllList()).data;
                this.wip = false;
                if (this.$route.query.hasOwnProperty("source")
                    && Common.inHosts(this.hosts, this.$route.query.source)) {
                    this.host = this.$route.query.source;
                }
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
                handler(val) {
                    if (val === 0) {
                        this.JSONObject = JSON.parse(this.JSONCode);
                    } else {
                        this.JSONCode = JSON.stringify(this.JSONObject, " ", "  ");
                    }
                }
            },
            host: {
                async handler(val) {
                    this.loadingPC = true;
                    this.hostGroups = (await hostGroupService.List(val)).data;
                    this.allPuppetClassesFull = (await pcService.All(val)).data;
                    this.allPuppetClasses = _.clone(this.allPuppetClassesFull);
                    this.search = null;
                    this.loadingPC = false;

                    if (this.$route.query.hasOwnProperty("hg")) {
                        this.hostGroupId = this.hostGroups.filter(i => i.name === this.$route.query.hg)[0].id;
                    }
                }
            },
            search: {
                async handler(val) {
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
            hgName: {
                async handler(val) {
                    this.JSONObject.name = val;
                    _.delay(async function (t) {
                        t.creatingHG = true;
                        let fchg = (await hostGroupService.FCheck(t.host, t.hgName)).data;
                        t.existingHG = fchg.id !== -1;
                        t.creatingHG = false;
                    }, 1000, this);

                }
            },
            envName: {
                async handler(val) {
                    this.JSONObject.environment = val;
                }
            },
            JSONCode: {
                async handler(val) {
                    try {
                        let HGObject = JSON.parse(val);
                        this.jsonError = false;
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
                        let err_msg = e.message;
                        let msg = err_msg.split(":");
                        console.info("Error in JSON ", msg);
                        this.jsonError = true;
                        this.jsonMsg = msg[1];
                    }
                }
            },
            hostGroupId: {
                async handler(val) {
                    this.allPuppetClasses = {};
                    this.loadingPC = true;
                    try {
                        this.search = null;
                        this.hostGroup = (await hostGroupService.Get(this.host, val)).data;
                        this.SourceName = this.hostGroup.name;
                        this.JSONObject = this.hostGroup;
                        let pcData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                        this.puppetClasses = pcData.PuppetClasses;
                        this.JSONCode = JSON.stringify(this.JSONObject, " ", "  ");
                        EditorMethods.resetPC(this);
                        EditorMethods.checkPC(this);
                        EditorMethods.sortPC(this);
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
            storeOverride() {
                console.log(this.parameterEditTitle);
                console.log(this.parameterEditValue);
                console.log(this.dump);

                let _subclass = this.parameterEditTitle.split("=>")[0].trim();
                let _parameter = this.parameterEditTitle.split("=>")[1].trim();
                let _class = this.JSONObject.puppet_classes[this.class];

                for (let i in _class) {
                    if (_class[i]["subclass"] === _subclass) {
                        if (_class[i].hasOwnProperty("overrides")) {
                            for (let j in _class[i]["overrides"]) {
                                if (_class[i]["overrides"][j]["parameter"] === _parameter) {
                                    console.log(_class[i]["overrides"][j]);
                                }
                            }
                        } else {
                            console.log("new");
                        }
                    }
                }
            },
            async save() {
                this.wip = true;
                this.hgError = false;
                this.hgDone = false;
                this.creatingHG = true;
                this.JSONObject = JSON.parse(this.JSONCode);
                this.JSONObject["source_name"] = this.SourceName;
                try {
                    await hostGroupService.Create(this.JSONObject, this.host);
                    let response = (await hostGroupService.FUpdate(this.host, this.hgName)).data;
                    this.hostGroups = (await hostGroupService.List(this.host)).data;
                    await hostGroupService.GitCommit(this.host, response.id);
                    this.JSONCode = JSON.stringify(response, " ", "  ");
                    this.hgDone = true;
                    this.hgDoneMsg = `${this.JSONObject.name} Created`
                } catch (e) {
                    this.hgError = true;
                    console.info(e.response);
                    this.hgErrorMsg = e.response.data;
                } finally {
                    this.creatingHG = false;
                    this.wip = false;
                }
            },
            addPuppetClass(data) {
                this.pcNotify = false;
                if (this.JSONObject.puppet_classes.hasOwnProperty(data.class)) {
                    if (data.parameters) {
                        this.JSONObject.puppet_classes[data.class].push({
                            "subclass": data.sub_class,
                            "smart_classes": data.parameters.map(item => {
                                return {"name": item.name, "foreman_id": item.foreman_id, "id": item.id}
                            }),
                        });
                    } else {
                        this.JSONObject.puppet_classes[data.class].push({
                            "subclass": data.sub_class,
                        });
                    }
                    data.in_host_group = true;
                } else {
                    if (data.parameters) {
                        this.JSONObject.puppet_classes[data.class] = ([{
                            "subclass": data.sub_class,
                            "smart_classes": data.parameters.map(item => {
                                return {"name": item.name, "foreman_id": item.foreman_id, "id": item.id}
                            }),
                        }]);
                    } else {
                        this.JSONObject.puppet_classes[data.class] = ([{
                            "subclass": data.sub_class,
                        }]);
                    }
                    data.in_host_group = true;
                }

                EditorMethods.sortPC(this);
                this.JSONCode = JSON.stringify(this.JSONObject, " ", "  ");
                this.pcNotifyMsg = `${data.class} => ${data.sub_class} Added`;
                this.pcNotify = true;
            },
            async editDialog(_class, subClass, parameter) {

                this.parameterEditType = null;
                this.parameterEditDefaultValue = null;

                this.parameterEditTitle = `${subClass} => ${parameter}`;
                this.parameterEditValue = null;

                for (let i in this.JSONObject.puppet_classes[_class]) {
                    if (this.JSONObject.puppet_classes[_class][i].hasOwnProperty("overrides")) {
                        for (let j in this.JSONObject.puppet_classes[_class][i]["overrides"]) {
                            if (this.JSONObject.puppet_classes[_class][i]["overrides"][j]["parameter"] === parameter) {
                                this.parameterEditValue = this.JSONObject.puppet_classes[_class][i]["overrides"][j]["value"];
                                try {
                                    let _id = this.JSONObject.puppet_classes[_class][i]["overrides"][j]["smart_class_id"];
                                    let dump = JSON.parse((await SmartClassesService.getById(_id)).data["Dump"]);
                                    this.dump = dump;
                                    this.class = _class;
                                    this.parameterEditType = dump["parameter_type"];
                                    this.parameterEditDefaultValue = `Default: ${dump["default_value"] !== "" ? dump["default_value"] : "NOPE"}`;
                                    this.dialogParamEditor = true;
                                    return;
                                } catch (e) {
                                    this.parameterEditType = "NOPE";
                                }
                            }
                        }
                    }
                    if (this.JSONObject.puppet_classes[_class][i].hasOwnProperty("smart_classes")) {
                        for (let j in this.JSONObject.puppet_classes[_class][i]["smart_classes"]) {
                            if (this.JSONObject.puppet_classes[_class][i]["smart_classes"][j]["name"] === parameter) {
                                // this.parameterEditValue = this.JSONObject.puppet_classes[_class][i]["overrides"][j]["value"];
                                try {
                                    let _id = this.JSONObject.puppet_classes[_class][i]["smart_classes"][j]["id"];
                                    let dump = JSON.parse((await SmartClassesService.getById(_id)).data["Dump"]);
                                    this.dump = dump;
                                    this.class = _class;
                                    this.parameterEditType = dump["parameter_type"];
                                    this.parameterEditDefaultValue = `Default: ${dump["default_value"] !== "" ? dump["default_value"] : "NOPE"}`;
                                    this.dialogParamEditor = true;
                                    return;
                                } catch (e) {
                                    this.parameterEditType = "NOPE";
                                }
                            }
                        }
                    }
                }

            },
            rmPC(_class, subClass) {
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
            fileChanged(file) {
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    let reader = new FileReader();
                    reader.onload = (function (t) {
                        return function (e) {
                            t.JSONCode = e.target.result;
                        };
                    })(this);
                    reader.readAsText(file);
                } else {
                    console.error('The File APIs are not fully supported in this browser.');
                }
            },
            labelCheck(item, name) {
                for (let i in item) {
                    if (item[i].parameter === name) {
                        return true;
                    }
                }
                return false;
            }
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
