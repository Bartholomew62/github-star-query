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
                let finalResult = Object.assign({}, this.filteredData);
                for (let [login, s] of Object.entries(givenStars)) {
                    finalResult[login] ??= { login: login, givenStars: [], receivedStars: [] };
                    finalResult[login].givenStars.push(...s);
                    finalResult[login].avatar_url ??= s[0]?.avatar_url;
                    finalResult[login].user_url ??= s[0]?.user_url;
                }
                this.filteredData = finalResult;
            },

            async fetchReceivedStars() {
                console.log('fetchReceivedStars');
                for await (let v of apiMediator.yieldReceivedStars(this.query)) {
                    this.mergeReceivedStars(v);
                }
            },

            mergeReceivedStars(receivedStars) {
                let finalResult = Object.assign({}, this.filteredData);
                for (let [login, s] of Object.entries(receivedStars)) {
                    finalResult[login] ??= { login: login, givenStars:[], receivedStars: [] };
                    finalResult[login].receivedStars.push(...s);
                    finalResult[login].avatar_url ??= s[0]?.avatar_url;
                    finalResult[login].user_url ??= s[0]?.user_url;
                }
                this.filteredData = finalResult;
            }
        }
    });
});