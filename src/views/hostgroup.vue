<template>
  <v-container>
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

    <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>

    <v-layout row wrap>

      <v-flex xs3>
        <v-autocomplete
                class="pr-5"
                v-model="sHost"
                :items="hosts"
                label="Source Host"
                persistent-hint
        >
        </v-autocomplete>
      </v-flex>
      <v-flex xs3>

        <v-autocomplete
                class="pr-5"
                v-model="env"
                :items="Environments"
                label="Environment"
                persistent-hint
                :disabled="!sHost"
        >
        </v-autocomplete>
      </v-flex>

      <v-flex xs3>
        <v-autocomplete
                class="pr-5"
                v-model="hostGroupId"
                :items="hostGroups"
                label="Host Group"
                persistent-hint
                item-text="name"
                item-value="id"
                :disabled="!sHost"
        >
          <template slot="item" slot-scope="data">
            <v-list-tile-content>
              <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
            </v-list-tile-content>
          </template>
        </v-autocomplete>
      </v-flex>

      <v-flex xs3>
        <v-autocomplete
                class="pr-5"
                v-model="tHost"
                :items="hosts"
                label="Target Host"
                persistent-hint
                :disabled="!sHost"
        >
        </v-autocomplete>
      </v-flex>
<!--      <v-flex xs1>-->

<!--      </v-flex>-->

    </v-layout>

      <v-layout row wrap v-if="hostGroup">
        <v-flex xs12 pb-2>
          <v-card>
            <v-layout>
              <v-flex xs6>
                <v-card>
                  <v-card-text>
                    <v-layout>
                      <v-flex xs6>
                        <p><v-label>Name: </v-label><v-chip label>{{hostGroup.name}}</v-chip></p>
                        <v-label>Environment: </v-label><v-chip label>{{hostGroup.environment}}</v-chip>
                      </v-flex>
                      <v-flex xs6>
                        <p><v-label>Puppet Classes: </v-label><v-chip label>{{pc_count}}</v-chip></p>
                        <p><v-label>Overrides: </v-label><v-chip label>{{ovr_count}}</v-chip></p>
                      </v-flex>
                    </v-layout>

                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs6 v-if="existData" pt-5>
                <v-layout row wrap>
                  <v-flex xs12 class="text-xs-center" >
                    <v-chip color="yellow" v-if="hgExist"><h3>Host Group exist on host</h3></v-chip>
                    <v-chip color="green" v-else ><h3 >Host Group not exist on host</h3></v-chip>
                    <v-chip color="yellow" v-if="!envExist" ><h3 >Environment not exist on host</h3></v-chip>
                  </v-flex>
                  <v-flex xs-12 class="text-xs-center">
                    <v-btn v-if="!hgExist && envExist" @click="submit()">Upload</v-btn>
                    <v-btn v-if="hgExist && envExist" disabled="true" @click="submit()">Update</v-btn>
                    <v-btn v-if="!envExist" @click="submit()">Create ENv</v-btn>
                  </v-flex>
                </v-layout>

              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout row wrap v-if="sourceLoaded && !targetLoaded">
        <v-flex xs12>
          <v-card
            v-for="(val, i) in pc"

            :key="i"
          >
<!--          <v-card-title><h3 class="headline mb-0">{{i}}</h3></v-card-title>-->
            <v-expansion-panel>
              <v-expansion-panel-content
                    v-for="(subval, j) in val"
                    :key="j"
            >
                <template v-slot:header>
                  <v-layout>
                    <v-flex xs8>
                      <h5 class="mb-0">{{subval.subclass}}</h5>
                    </v-flex>
                    <v-flex xs2 v-if="subval.param_count">
                      <v-badge left>
                        <template v-slot:badge>
                          <span>{{subval.param_count}}</span>
                        </template>
                        <v-chip>
                          parameters
                        </v-chip>
                      </v-badge>
                    </v-flex>
                    <v-flex xs2 v-if="subval.ovr_count">
                      <v-badge left>
                        <template v-slot:badge>
                          <span>{{subval.ovr_count}}</span>
                        </template>
                        <v-chip>
                          overrides
                        </v-chip>
                      </v-badge>
                    </v-flex>
                  </v-layout>
                </template>

                <v-layout>
                  <v-flex xs4>
                    <div class="ml-2">
                      <v-chip
                              label
                              v-for="(sc, l) in subval.smart_classes"
                              :key="l"
                      >
                        {{sc}}
                      </v-chip>
                    </div>
                  </v-flex>
                  <v-flex xs8 mr-1>
                    <div v-if="subval.ovr_count" class="ml-2 mb-2">
                      <div
                              v-for="(ovr, l) in subval.overrides"
                              :key="l"
                      >
                        <v-label>Parameter: </v-label> {{ovr.parameter}}
                        <pre><code>{{ovr.value}}</code></pre>
                      </div>
                    </div>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout row wrap v-if="sourceLoaded && targetLoaded">
        <v-flex xs6>
          <v-card
                  v-for="(val, i) in pc"

                  :key="i"
          >
            <!--          <v-card-title><h3 class="headline mb-0">{{i}}</h3></v-card-title>-->
            <v-expansion-panel>
              <v-expansion-panel-content
                      v-for="(subval, j) in val"
                      :key="j"
              >
                <template v-slot:header>
                  <v-layout>
                    <v-flex xs8>
                      <h5 class="mb-0">{{subval.subclass}}</h5>
                    </v-flex>
                    <v-flex xs2 v-if="subval.param_count">
                      <v-badge left>
                        <template v-slot:badge>
                          <span>{{subval.param_count}}</span>
                        </template>
                        <v-chip>
                          parameters
                        </v-chip>
                      </v-badge>
                    </v-flex>
                    <v-flex xs2 v-if="subval.ovr_count">
                      <v-badge left>
                        <template v-slot:badge>
                          <span>{{subval.ovr_count}}</span>
                        </template>
                        <v-chip>
                          overrides
                        </v-chip>
                      </v-badge>
                    </v-flex>
                  </v-layout>
                </template>

                <v-layout row wrap>
                  <v-flex xs12 md4>
                    <div class="ml-2">
                      <v-chip
                              label
                              v-for="(sc, l) in subval.smart_classes"
                              :key="l"
                      >
                        {{sc}}
                      </v-chip>
                    </div>
                  </v-flex>
                  <v-flex xs12 md8 mr-1>
                    <div v-if="subval.ovr_count" class="ml-2 mb-2">
                      <div
                              v-for="(ovr, l) in subval.overrides"
                              :key="l"
                      >
                        <v-label>Parameter: </v-label> {{ovr.parameter}}
                        <pre><code>{{ovr.value}}</code></pre>
                      </div>
                    </div>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card>
        </v-flex>
        <v-flex xs6>
          <v-card
                  v-for="(val, i) in targPc"

                  :key="i"
          >
            <!--          <v-card-title><h3 class="headline mb-0">{{i}}</h3></v-card-title>-->
            <v-expansion-panel>
              <v-expansion-panel-content
                      v-for="(subval, j) in val"
                      :key="j"
              >
                <template v-slot:header>
                  <v-layout>
                    <v-flex xs8>
                      <h5 class="mb-0">{{subval.subclass}}</h5>
                    </v-flex>
                    <v-flex xs2 v-if="subval.param_count">
                      <v-badge left>
                        <template v-slot:badge>
                          <span>{{subval.param_count}}</span>
                        </template>
                        <v-chip>
                          parameters
                        </v-chip>
                      </v-badge>
                    </v-flex>
                    <v-flex xs2 v-if="subval.ovr_count">
                      <v-badge left>
                        <template v-slot:badge>
                          <span>{{subval.ovr_count}}</span>
                        </template>
                        <v-chip>
                          overrides
                        </v-chip>
                      </v-badge>
                    </v-flex>
                  </v-layout>
                </template>

                <v-layout row wrap>
                  <v-flex xs12 md4>
                    <div class="ml-2">
                      <v-chip
                              label
                              v-for="(sc, l) in subval.smart_classes"
                              :key="l"
                      >
                        {{sc}}
                      </v-chip>
                    </div>
                  </v-flex>
                  <v-flex xs12 md8 mr-1>
                    <div v-if="subval.ovr_count" class="ml-2 mb-2">
                      <div
                              v-for="(ovr, l) in subval.overrides"
                              :key="l"
                      >
                        <v-label>Parameter: </v-label> {{ovr.parameter}}
                        <pre><code>{{ovr.value}}</code></pre>
                      </div>
                    </div>
                  </v-flex>
                </v-layout>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card>
        </v-flex>
      </v-layout>
  </v-container>
</template>

<script>
  import GoService from "@/services/GoService";
  export default {
    data: () => ({
      hosts: [],
      hostGroups: [],
      targetHostGroup: [],
      hostGroupsFull: [],
      sHost: null,
      tHost: null,
      hostGroupId: null,
      hostGroup: null,
      hgError: null,
      hgErrorMsg: null,
      hgDone: null,
      hgDoneMsg: null,
      existData: null,
      hgExist: null,
      envExist: null,
      wip: false,
      targPc_count: 0,
      pc_count: 0,
      ovr_count: 0,
      targOvr_count: 0,
      Environments: ["any"],
      env: "any",
      pc: {},
      targPc: {},
      targSc: {},
      sc: {},
      ovr: {},
      targOvr: {},
      targetLoaded: false,
      sourceLoaded: false
    }),

    async mounted () {
      this.hosts = (await GoService.hosts()).data;
    },

    watch: {
      sHost: {
        async handler (val) {

          this.tHost = null;
          this.existData = null;
          this.hgExist = null;
          this.envExist = null;
          this.hostGroup = null;
          this.env = "any";


          this.hostGroups = (await GoService.hgList(val)).data;
          this.hostGroupsFull = (await GoService.hgList(val)).data;
          let tmpEnv = (await GoService.envList(val)).data;

          let reg = new RegExp('[0-9]');
          let result = [];
          for (let env in tmpEnv) {
            if (reg.test(tmpEnv[env])) {
              let uEnvId = tmpEnv[env].slice(3,6);
              if (result.indexOf(uEnvId) === -1) {
                result.push(uEnvId)
              }
            }
          }
          this.Environments = result;
          this.Environments.push("any");
        }
      },
      env: {
        async handler (val) {

          this.tHost = null;
          this.existData = null;
          this.hgExist = null;
          this.envExist = null;
          this.hostGroup = null;

          let filtredHG = [];
          for (let i in this.hostGroupsFull) {
            if (this.hostGroupsFull[i].name.includes(val)) {
              console.log(this.hostGroupsFull[i].name);
              filtredHG.push(this.hostGroupsFull[i]);
            }
          }
          this.hostGroups = filtredHG;
        }
      },
      hostGroupId: {
        async handler (val) {
          this.wip = true;
          let old_th = this.tHost;
          try {

            this.tHost = null;
            this.existData = null;
            this.hgExist = null;
            this.envExist = null;

            this.hostGroup = (await GoService.hg(this.sHost, val)).data;
          } catch (e) {
            if (e.message.includes("404")) {
              this.hgError = true;
              this.hgErrorMsg = `Host group ${val} not fond on spb01-puppet`;
            }
          }

          let pc = this.hostGroup.puppet_classes;

          this.pc_count = 0;
          this.ovr_count = 0;
          for (let i in pc) {
            this.pc_count++;
            this.pc[i] = [];

            for (let j in pc[i]) {
              let tmp = {};
              let param_count = 0;
              let ovr_curr_count = 0;

              tmp["subclass"] = pc[i][j]["subclass"];

              if ("smart_classes" in pc[i][j]) {
                let sc = pc[i][j]["smart_classes"];
                for (let l in sc) {
                  param_count++;
                  this.sc[l]= sc;
                }
                tmp["param_count"] = param_count;
                tmp["smart_classes"] = sc;
              }

              if ("overrides" in pc[i][j]) {
                let ovr = pc[i][j]["overrides"];
                for (let t in ovr) {
                  this.ovr_count++;
                  ovr_curr_count++;
                  this.ovr[t]= ovr;
                }
                tmp["ovr_count"] = ovr_curr_count;
                tmp["overrides"] = ovr;
              }

              this.pc[i].push(tmp);
            }
          }

          this.tHost = old_th;
          this.sourceLoaded = true;
          this.wip = false;
        }
      },
      tHost: {
        async handler (val) {
          this.wip = true;
          this.targetHostGroup = [];
          this.targetLoaded = false;

          let hgData = {
            source_host: this.sHost,
            target_host: val,
            hg_id: this.hostGroupId
          };
          let envData = {
            host: val,
            env: this.hostGroup.environment
          };
          this.hgExist = (await GoService.hgCheck(hgData)).data;
          this.envExist = (await GoService.envCheck(envData)).data !== -1;











          try {
            this.targetHostGroup = (await GoService.hg(this.tHost, this.hostGroupId)).data;
          } catch (e) {
            if (e.message.includes("404")) {
              this.hgError = true;
              this.hgErrorMsg = `Host group ${val} not fond on ${this.tHost}`;
            }
          }

          let pc = this.targetHostGroup.puppet_classes;

          for (let i in pc) {
            this.targPc_count++;
            this.targPc[i] = [];

            for (let j in pc[i]) {
              let tmp = {};
              let param_count = 0;
              let ovr_curr_count = 0;

              tmp["subclass"] = pc[i][j]["subclass"];

              if ("smart_classes" in pc[i][j]) {
                let sc = pc[i][j]["smart_classes"];
                for (let l in sc) {
                  param_count++;
                  this.targSc[l]= sc;
                }
                tmp["param_count"] = param_count;
                tmp["smart_classes"] = sc;
              }

              if ("overrides" in pc[i][j]) {
                let ovr = pc[i][j]["overrides"];
                for (let t in ovr) {
                  this.targOvr_count++;
                  ovr_curr_count++;
                  this.targOvr[t]= ovr;
                }
                tmp["ovr_count"] = ovr_curr_count;
                tmp["overrides"] = ovr;
              }

              this.targPc[i].push(tmp);
            }
          }

          this.targetLoaded = true;
          this.wip = false;
          this.existData = true;
        }
      }
    },
    methods: {
      showInfo () {
        this.existData = false;
        this.sHost = this.tHost;
      },
      async submit () {
        this.wip = true;
        let env = this.env;
        let data = {
          source_host: this.sHost,
          target_host: this.tHost,
          hg_id: this.hostGroupId
        };
        try {
          let response = (await GoService.hgSend(data));
          if (response.status === 200) {
            this.hgDone = true;
            this.hgDoneMsg = `HostGroup ${this.hostGroup.name} added to ${this.tHost}`;
          }
        } catch (e) {
          this.hgError = true;
          this.hgErrorMsg = e.message;
        }

        this.sHost = data.target_host;
        // this.tHost = null;
        // this.env = env;
        // this.hostGroupId = data.hg_id;
        this.wip = false;
      },
    }
  }
</script>

<style>

</style>
