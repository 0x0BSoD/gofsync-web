<template>
    <v-container>
        <v-layout class="text-sm-center">
            <div class="error pa-5">
                <div>
                    <v-icon>warning</v-icon>
                </div>
                <h2 class="headline">Backend not reachable or in errored state </h2>
            </div>
        </v-layout>
    </v-container>
</template>

<script>
    import {hostService} from '../_services';

    export default {
        name: 'error',
        data: () => ({}),
        async mounted() {
            // Load Hosts ==========================================
            try {
                await hostService.hosts();
                await this.$router.push({name: "app"});
            } catch (e) {
            }
        },
    }
</script>

<style scoped>
    .error {
        background: rgb(240, 10, 0);
        box-shadow: 2px 4px 5px black;
        border-radius: 5px;
        margin: 0 auto;
    }
</style>