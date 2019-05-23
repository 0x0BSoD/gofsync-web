<template>
    <v-container>
        <v-layout class="text-sm-center">
            <div class="error pa-5">
                <div><v-icon>warning</v-icon></div>
                <h2 class="headline">Backend not reachable or in errored state </h2>
            </div>
        </v-layout>
    </v-container>
</template>

<script>
</script>

<style scoped>
    .error {
        background: rgb(240,10,0);
        box-shadow: 2px 4px 5px black;
        border-radius: 5px;
        margin: 0 auto;
    }
</style>