<template>
    <v-container>
        <v-item-group>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-progress-linear v-if="wip" :indeterminate="wip"></v-progress-linear>
                    <v-flex
                            v-for="n in locations"
                            :key="n.host"
                            xs12
                            md4
                    >
                        <v-item>
                            <v-card>
                                <v-card-title class="pr-0 pl-3 pt-0 pb-0">
                                    <h4 @click="setHost(n.host)">{{n.host}}</h4>
                                    <v-spacer></v-spacer>
<!--                                    <v-btn icon flat><a target="_blank" :rel="n.host" :href="`https://${n.host}`"><v-icon>link</v-icon></a></v-btn>-->
                                    <v-menu bottom left>
                                        <template v-slot:activator="{ on }">
                                            <v-btn
                                                    icon
                                                    v-on="on"
                                            >
                                                <v-icon>more_vert</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-list>
                                            <v-list-tile  @click="" >
                                                <a target="_blank" :rel="n.host" :href="`https://${n.host}`">to foreman</a>
                                            </v-list-tile>
                                            <v-list-tile  @click="updateLoc(n.host)" >
                                                <v-list-tile-title>update locations</v-list-tile-title>
                                            </v-list-tile>
                                            <v-list-tile  @click="updateEnv(n.host)" >
                                                <v-list-tile-title>update environments</v-list-tile-title>
                                            </v-list-tile>
                                        </v-list>
                                    </v-menu>
                                </v-card-title>
                                <v-divider></v-divider>
                                <v-hover v-for="c in n.locations" :key="c">
                                    <v-chip
                                            slot-scope="{ hover }"
                                            :class="`elevation-${hover ? 2 : 1} ml-1`"
                                            class="mx-auto"
                                            label >{{c}}</v-chip>
                                </v-hover>
                            </v-card>
                        </v-item>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-item-group>
    </v-container>
</template>

<script>

    import { environmentService, locationsService } from "../../_services"

    export default {
        data: () => ({
            wip: false,
        }),
        props: [
            "locations"
        ],
        async mounted () {},
        watch: {},
        methods: {
            async setHost (host) {
                await this.$store.dispatch("setHost", host);
            },
            async updateEnv (host) {
                this.wip = true;
                try {
                    await environmentService.Update(host);
                    this.$emit('envUpdated');
                } catch (e) {
                    console.error(e);
                } finally {
                    this.wip = false;
                }
            },
            async updateLoc (host) {
                this.wip = true;
                try {
                    await locationsService.Update(host);
                    this.$emit('locUpdated');
                } catch (e) {
                    console.error(e);
                } finally {
                    this.wip = false;
                }
            }
        }
    }
</script>

<style></style>
