(function () {

    const api = (function () {
        let _per_page = 100;
        let _token = null;
        function createHeaders() {
            if (!_token)
                return {};
            return {
                headers: { 'Authorization': `token ${_token}` }
            };
        }

        function setToken(token) {
            _token = token;
        }

        function fetchRaw(url) {
            return fetch(url, createHeaders()).then(resp => {
                let jsonPromise = resp.json();
                if (!resp.ok)
                    jsonPromise = jsonPromise.then(json => {
                        throw new Error(`Error fetching: ${resp.status} ${json.message}`);
                    });
                return jsonPromise;
            });
        }

        function fetchGivenStarsRaw(user, page) {
            return fetchRaw(`https://api.github.com/users/${user}/starred?page=${page}&per_page=${_per_page}`);
        }

        function fetchReposRaw(user, page) {
            return fetchRaw(`https://api.github.com/users/${user}/repos?page=${page}&per_page=${_per_page}`);
        }

        function fetchStargazersRaw(stargazers_url, page) {
            return fetchRaw(`${stargazers_url}?page=${page}&per_page=${_per_page}`);
        }

        return { setToken, fetchGivenStarsRaw, fetchReposRaw, fetchStargazersRaw };
    })();

    const apiMediator = (function () {

        async function* yieldGivenStars(user) {
            let page = 1;
            while (1) {
                let result = await api.fetchGivenStarsRaw(user, page);
                if (!result.length)
                    break;
                yield Object.groupBy(result.map(x => ({
                    login: x.owner.login,
                    avatar_url: x.owner.avatar_url,
                    user_url: x.owner.html_url,
                    repo: x.full_name,
                    url: x.html_url
                })), x => x.login);
                page++;
            }
            return;
        }

        async function* yieldPagesStargazers(stargazers_url) {
            let page = 1;
            while (1) {
                let result = await api.fetchStargazersRaw(stargazers_url, page);
                if (!result.length)
                    break;
                yield result;
                page++;
            }
            return;
        }

        async function* yieldPagesRepos(user) {
            let page = 1;
            while (1) {
                let result = await api.fetchReposRaw(user, page);
                if (!result.length)
                    break;
                yield result.map(x => ({
                    repo: x.full_name,
                    repo_html_url: x.html_url,
                    stargazers_url: x.stargazers_url
                }));
                page++;
            }
            return;
        }

        async function* yieldReceivedStars(user) {
            for await (let rs of yieldPagesRepos(user)) {
                for (let r of rs) {
                    for await (let s of yieldPagesStargazers(r.stargazers_url)) {
                        yield Object.groupBy(s.map(x => ({
                            login: x.login,
                            avatar_url: x.avatar_url,
                            user_url: x.html_url,
                            repo: r.repo,
                            url: r.repo_html_url
                        })), x => x.login);
                    }
                }
            }
        }

        function setToken(token) {
            api.setToken(token);
        }

        return {
            yieldGivenStars, yieldReceivedStars, setToken
        };
    })();

    window.apiMediator = apiMediator;
})();