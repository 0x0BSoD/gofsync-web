// TODO: this
export default async function auth({next, router}) {

    // User check ==========================================
    const loggedIn = localStorage.getItem('userData');
    const token = this.$cookies.isKey("token");
    if (token && !!loggedIn) {
        let userData = JSON.parse(loggedIn);
        let username = userData.CN[0];
        let userGroups = userData.OU.join("|");
        this.$store.dispatch("setUsername", username);
        try {
            await userService.refreshjwt();
        } catch (e) {
            // console.log("token is ok");
        }
    } else {
        return router.push({name: 'login'});
    }

    return next();
}