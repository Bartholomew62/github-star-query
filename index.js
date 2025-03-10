document.addEventListener('DOMContentLoaded', () => {
    new Vue({
        el: '#app',
        data: {
            query: '',
            token: '',
            error: '',
            loading: false,
            filteredData: {}
        },
        methods: {
            async filterData() {
                this.error = '';
                this.filteredData = {};
                if (!this.query)
                    return;
                this.loading = true;
                apiMediator.setToken(this.token);
                try {
                    await Promise.all([this.fetchGivenStars(), this.fetchReceivedStars()]);
                }
                catch (e) {
                    this.error = e.message;
                }
                finally {
                    this.loading = false;
                }
            },

            async fetchGivenStars() {
                console.log('fetchGivenStars');
                for await (let v of apiMediator.yieldGivenStars(this.query)) {
                    this.mergeGivenStars(v);
                }
            },

            mergeGivenStars(givenStars) {
                for (let [login, s] of Object.entries(givenStars)) {
                    if (!this.filteredData[login])
                        this.$set(this.filteredData, login, { login: login, givenStars: [], receivedStars: [] });
                    this.filteredData[login].givenStars.push(...s);
                    this.filteredData[login].avatar_url ??= s[0]?.avatar_url;
                    this.filteredData[login].user_url ??= s[0]?.user_url;
                }
            },

            async fetchReceivedStars() {
                console.log('fetchReceivedStars');
                for await (let v of apiMediator.yieldReceivedStars(this.query)) {
                    this.mergeReceivedStars(v);
                }
            },

            mergeReceivedStars(receivedStars) {
                for (let [login, s] of Object.entries(receivedStars)) {
                    if (!this.filteredData[login])
                        this.$set(this.filteredData, login, { login: login, givenStars: [], receivedStars: [] });
                    this.filteredData[login].receivedStars.push(...s);
                    this.filteredData[login].avatar_url ??= s[0]?.avatar_url;
                    this.filteredData[login].user_url ??= s[0]?.user_url;
                }
            }
        }
    });
});