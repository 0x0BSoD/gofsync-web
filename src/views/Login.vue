<template>
    <v-container fluid fill-height>

        <vue-particles
                class="back"
                color="#dedede"
                :particleOpacity="0.7"
                :particlesNumber="80"
                shapeType="circle"
                :particleSize="4"
                linesColor="#dedede"
                :linesWidth="1"
                :lineLinked="true"
                :lineOpacity="0.4"
                :linesDistance="150"
                :moveSpeed="3"
                :hoverEffect="true"
                hoverMode="grab"
                :clickEffect="true"
                clickMode="push"
        ></vue-particles>

        <v-layout align-center justify-center>
            <v-flex xs12 sm8 md4>

                <v-card class="elevation-12">
                    <v-toolbar dark color="primary">
                        <v-toolbar-title>Login</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text>
                        <v-alert
                                v-model="error"
                                dismissible
                                type="error"
                        >
                            User or password invalid.
                        </v-alert>
                        <v-form>
                            <v-text-field
                                    :rules="[rules.required]"
                                    prepend-icon="person"
                                    name="username"
                                    label="Username"
                                    type="text"
                                    v-model="username"
                                    v-on:keyup.enter="login()"
                            ></v-text-field>
                            <v-text-field
                                    :rules="[rules.required]"
                                    id="password"
                                    prepend-icon="lock"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    v-model="password"
                                    v-on:keyup.enter="login()"
                            ></v-text-field>
                            <v-checkbox v-model="remember_me" label="Remember me"></v-checkbox>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>

                        <v-btn
                                block
                                :loading="loading"
                                color="primary"
                                :disabled="(!username && !password) || loading"
                                @click="login()"
                        >Login
                            <template v-slot:loader>
                                <span class="custom-loader">
                                  <v-icon light>cached</v-icon>
                                </span>
                            </template>
                        </v-btn>

                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>

</template>

<script>
    // @ is an alias to /src
    import { userService } from '../_services';
    export default {
        name: 'login',
        data: () => ({
            drawer: null,
            username: null,
            password: null,
            remember_me: null,
            error: false,
            loading: false,
            rules: {
                required: value => !!value || 'Required.',
            },
        }),
        props: {
            source: String
        },
        async mounted() {
        },
        methods: {
            async login () {
                this.loading = true;
                try {
                    let resp = await userService.login(this.username,
                                                       this.password,
                                                       this.remember_me);
                    let userData = parseADString(resp.data);
                    localStorage.setItem('userData', JSON.stringify(userData));
                    let exp = "30m";
                    if (this.remember_me) {
                        exp = "24h";
                    }
                    this.$router.push({name: "hostgroup"});
                } catch (err) {
                    this.error = true;
                    console.error(err);
                } finally {
                    this.loading = false;
                }
            },
        }
    }

    function parseADString (str) {
        let splitted = str.split(",");
        let AD_obj = {};
        for (let s in splitted) {
            let tmp = splitted[s].split("=");
            AD_obj[tmp[0]] = [];
        }
        for (let s in splitted) {
            let tmp = splitted[s].split("=");
            AD_obj[tmp[0]].push(tmp[1]);
        }

        if ("CN" in AD_obj) {
            return AD_obj;
        } else {
            console.error("No CN in AD entry!");
            return null;
        }
    }
</script>

<style scoped>
    #particles-js {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .custom-loader {
        animation: loader 1s infinite;
        display: flex;
    }
    @-moz-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
    @-webkit-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
    @-o-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
    @keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

</style>