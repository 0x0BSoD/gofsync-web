<template>
    <v-container fluid>

        <!--    ============================================ Progress ============================================    -->
        <v-layout row wrap v-if="wipMessage">
            <v-flex v-if="wip" xs9>
                <v-chip label v-if="WSProgress.message">{{WSProgress.message}}</v-chip>
            </v-flex>
            <v-flex xs3 class="pt-2">
                {{wipMessage}}
            </v-flex>
            <v-flex xs12>
                <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
            </v-flex>
        </v-layout>
        <v-layout row wrap v-else class="text-xs-center">
            <v-flex v-if="wip" xs12>
                <v-chip label v-if="WSProgress.message">{{WSProgress.message}}</v-chip>
            </v-flex>
            <v-flex xs12>
                <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
            </v-flex>
        </v-layout>
        <!--    ============================================ /Progress ============================================    -->

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
                                        autocomplete="off"
                                        autocorrect="off"
                                        autocapitalize="off"
                                        spellcheck="false"
                                        :disabled="tab === 1"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs2 mt-1>
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
                            <v-flex xs5 v-else>
                                <v-layout row wrap>
                                    <v-flex xs5>
                                        <v-btn
                                                large
                                                @click="save()"
                                                :loading="creatingHG"
                                                :disabled="creatingHG || !hgName"
                                        >save
                                        </v-btn>
                                    </v-flex>
<!--                                    <v-flex xs6 v-if="renameHG">-->
<!--                                        <v-btn-->
<!--                                                large-->
<!--                                                @click="save()"-->
<!--                                                :loading="creatingHG"-->
<!--                                                :disabled="creatingHG || !hgName"-->
<!--                                        >update-->
<!--                                        </v-btn>-->
<!--                                    </v-flex>-->
                                </v-layout>
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
<!--            <codemirror-->
<!--                    autocomplete="off"-->
<!--                    autocorrect="off"-->
<!--                    autocapitalize="off"-->
<!--                    spellcheck="false"-->
<!--                    v-model="JSONCode"-->
<!--                    :options="cmOptions">-->
<!--            </codemirror>-->
            <v-json-editor v-model="JSONObject"  height="660px" :plus="false" />
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
    import VJsonEditor from 'v-jsoneditor'

    export default {
        //========================================================================================================
        // COMPONENTS
        //========================================================================================================
        components: {
            'upload-btn': UploadButton,
            VJsonEditor
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
            // JSONCode: "{}",
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
            tab: 0,
            creatingHG: false,
            existingHG: false,
            renameHG: false,
            oldNameHG: "",
            pcNotify: false,
            pcNotifyMsg: null,
            parameterEditTitle: null,
            parameterEditType: null,
            parameterEditValue: null,
            parameterEditDefaultValue: null,
            wipMessage: false,
            WSProgress: {
                message: null,
            },
        }),

        //========================================================================================================
        // MOUNTED
        //========================================================================================================
        async mounted() {
            // User check ==========================================
            await Common.auth(this);

            // ==========================================
            try {
                this.wip = true;
                this.hosts = (await hostService.hosts()).data;
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
            nowActions: {
                async handler(val) {
                    await Common.webSocketParser(val, this);
                }
            },
            host: {
                async handler(val) {
                    this.loadingPC = true;

                    console.time("get HG");
                    this.hostGroups = (await hostGroupService.List(val)).data;
                    console.timeEnd("get HG");

                    // console.time("copy PC");
                    // this.allPuppetClasses = _.clone(this.allPuppetClassesFull);
                    // console.timeEnd("copy PC");

                    this.search = null;
                    this.loadingPC = false;

                    if (this.$route.query.hasOwnProperty("hg")) {
                        this.hostGroupId = this.hostGroups.filter(i => i.name === this.$route.query.hg)[0].id;
                    }

                    console.log("host end");
                }
            },
            search: {
                async handler(val) {
                    // if (this.search) {
                        this.allPuppetClasses = {};
                        for (let i in this.allPuppetClassesFull) {
                            for (let j in this.allPuppetClassesFull[i]) {
                                if (this.allPuppetClassesFull[i][j].SubClass.includes(val)) {
                                    this.allPuppetClasses[i] = this.allPuppetClassesFull[i];
                                }
                            }
                        }
                    // } else {
                    //     this.allPuppetClasses = _.clone(this.allPuppetClassesFull);
                    // }
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
                        console.log(t.existingHG);
                        if (!t.existingHG) {
                        let fchgId = (await hostGroupService.FCheckID(t.host, t.JSONObject.id)).data;
                            if (fchgId.name !== "") {
                                t.renameHG = true;
                            }
                        }
                    }, 1000, this);
                }
            },
            envName: {
                async handler(val) {
                    this.JSONObject.environment = val;
                }
            },
            JSONObject: {
                async handler(val) {
                    this.jsonError = false;
                    this.hgName = val.name;
                    this.envName = val.environment;

                    if (!val.hasOwnProperty("name")) {
                        this.jsonError = true;
                        this.jsonMsg = "Name required";
                    }

                    if (!val.hasOwnProperty("environment")) {
                        this.jsonError = true;
                        this.jsonMsg = "Environment required";
                    }
                }
            },
            hostGroupId: {
                async handler(val) {
                    this.allPuppetClasses = {};
                    this.loadingPC = true;
                    try {
                        console.time("get PC");
                        this.allPuppetClassesFull = (await pcService.All(this.host)).data;
                        console.timeEnd("get PC");
                        this.search = null;
                        this.hostGroup = (await hostGroupService.Get(this.host, val)).data;
                        this.SourceName = this.hostGroup.name;
                        this.JSONObject = this.hostGroup;
                        let pcData = PuppetMethods.parse(this.hostGroup.puppet_classes);
                        this.oldNameHG = pcData.name;
                        this.puppetClasses = pcData.PuppetClasses;
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
                this.JSONObject["source_name"] = this.SourceName;

                try {
                    this.wipMessage = "Uploading to foreman";
                    await hostGroupService.Create(this.JSONObject, this.host);
                    this.wipMessage = "Updating goFsync DB";
                    let response = (await hostGroupService.FUpdate(this.host, this.hgName)).data;
                    this.wipMessage = "Getting HG list";
                    this.hostGroups = (await hostGroupService.List(this.host)).data;
                    this.wipMessage = "Committing HG to Git";
                    await hostGroupService.GitCommit(this.host, response.id);
                    this.hgDone = true;
                    this.hgDoneMsg = `${this.JSONObject.name} Uploaded`
                } catch (e) {
                    this.hgError = true;
                    console.info(e.response);
                    this.hgErrorMsg = e.response.data;
                } finally {
                    this.wipMessage = false;
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
                // this.JSONCode = JSON.stringify(this.JSONObject, " ", "  ");
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
                // this.JSONCode = JSON.stringify(this.JSONObject, " ", "  ");

                this.pcNotifyMsg = `${_class} => ${subClass} Removed`;
                this.pcNotify = true;
            },
            fileChanged(file) {
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    let reader = new FileReader();
                    // reader.onload = (function (t) {
                    //     return function (e) {
                    //         t.JSONCode = e.target.result;
                    //     };
                    // })(this);
                    reader.readAsText(file);
                } else {
                    console.error('The File APIs is not a fully supported in this browser.');
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
