document.addEventListener('DOMContentLoaded', () => {

    function exportTxt(filename, csvContent) {
        let bom = '\uFEFF';
        let blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement('a');
        let url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    new Vue({
        el: '#app',
        data: {
            query: '',
            token: '',
            error: '',
            loading: false,
            filteredData: { },
            totalGivenStars: 0,
            totalReceivedStars: 0
        },
        methods: {
            async filterData() {
                this.error = '';
                this.filteredData = {};
                this.totalGivenStars = 0;
                this.totalReceivedStars = 0;
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
                    this.totalGivenStars += s.length;
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
                    this.totalReceivedStars += s.length;
                }
            },

            exportDiff() {
                let uns = Object.entries(this.filteredData).filter(d => !d[1].receivedStars.length).map(d => d[0]).sort();
                let dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                exportTxt(`${dateStr}_diff.txt`, uns.join('\n'));
            }
        }
    });
});