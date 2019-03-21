<template>
  <v-container>
    <v-alert
            v-model="hgError"
            dismissible
            type="error"
    >
      {{hgErrorMsg}}
    </v-alert>
    <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
    <v-layout>
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
        >
        </v-autocomplete>
      </v-flex>
      <v-flex xs1>
        <v-btn :disabled="hgExist || !envExist" @click="submit()">Upload</v-btn>
      </v-flex>

    </v-layout>

    <div v-if="hostGroup">
      <v-layout row wrap>
        <v-flex xs12 pb-2>
          <v-card>
            <v-layout>
              <v-flex xs8>
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <h3 class="headline mb-0">Host Group info</h3>
                    </div>
                  </v-card-title>
                  <v-card-text>
                    <p>Name: {{hostGroup.name}}</p>
                    <p>Environment: <v-chip label>{{hostGroup.environment}}</v-chip></p>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs4 v-if="existData" class="text-xs-center" pt-5>
                <v-chip v-if="hgExist"><h3>Host Group exist on host</h3></v-chip>
                <v-chip v-else ><h3 >Host Group not exist on host</h3></v-chip>
                <v-chip v-if="!envExist" ><h3 >Environment not exist on host</h3></v-chip>
                <!--<p v-if="exist" @click="showInfo()"><v-btn>show hg info on target</v-btn></p>-->
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout row wrap>
        <v-flex xs6>
          <v-expansion-panel>
            <v-expansion-panel-content
                    v-for="(val, i) in hostGroup.puppet_classes"
                    :key="i"
            >
              <template v-slot:header>
                <div>{{i}}</div>
              </template>

              <v-card v-for="(subval, j) in val" :key="j">
                <v-card-text>
                  <h4>{{subval.subclass}}</h4>
                  <v-chip
                          v-for="sc, l in subval.smart_classes"
                          :key="l"
                          >
                    {{sc}}
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>
        <v-flex xs6 pl-2>

          <v-card>
            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">Overrides</h3>
              </div>
            </v-card-title>

            <v-card-text>
              <div v-for="(val, i) in hostGroup.puppet_classes" :key="i">
                <div v-for="(subval, j) in val" :key="j">
                  <div v-if="subval.hasOwnProperty('overrides')"
                     v-for="(ovr, k) in subval.overrides"
                     :key="k">
                    <v-card>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">{{ovr.parameter}}</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        <div>Value: <p><v-chip label>{{ovr.value}}</v-chip></p></div>
                        <div>Match: <p><v-chip label>{{ovr.match}}</v-chip></p></div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </div>


  </v-container>
</template>

<script>
  import GoService from "@/services/GoService";
  export default {
    data: () => ({
      hosts: [],
      hostGroups: [],
      hostGroupsFull: [],
      sHost: null,
      tHost: null,
      hostGroupId: null,
      hostGroup: null,
      hgError: null,
      hgErrorMsg: null,
      existData: null,
      hgExist: null,
      envExist: null,
      wip: false,
      Environments: ["any"],
      env: "any"
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
          let old_th = this.tHost;
          try {

            this.tHost = null;
            this.existData = null;
            this.hgExist = null;
            this.envExist = null;

            console.log(val);
            this.hostGroup = (await GoService.hg(this.sHost, val)).data;
          } catch (e) {
            if (e.message.includes("404")) {
              this.hgError = true;
              this.hgErrorMsg = `Host group ${val} not fond on spb01-puppet`;
            }
          }
          console.log(this.hostGroup);
          this.tHost = old_th;
        }
      },
      tHost: {
        async handler (val) {
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
          console.log(this.hgExist);
          console.log(this.envExist);
          this.existData = true;
        }
      }
    },
    methods: {
      showInfo () {
        this.existData = false;
        this.sHost = this.tHost;
        // let oldHg = this.hostGroupId;
        // this.tHost = null;
        // this.hostGroupId = oldHg;
      },
      async submit () {
        this.wip = true;
        let data = {
          source_host: this.sHost,
          target_host: this.tHost,
          hg_id: this.hostGroupId
        };
        let resposnse = (await GoService.hgSend(data)).data;
        console.log(resposnse);
        this.wip = false;
      },
    }
  }
</script>

<style>

</style>
