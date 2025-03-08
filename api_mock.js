// Mock apiMediator for testing
window.apiMediator = {
    yieldGivenStars: async function* (user) {
        yield {
            "user1": [
                {
                    login: "user1",
                    avatar_url: "https://avatars.githubusercontent.com/u/445767?v=4",
                    user_url: "https://github.com/user1",
                    repo: "user1/repo1",
                    url: "https://github.com/user1/repo1"
                }
            ]
        };
    },
    yieldReceivedStars: async function* (user) {
        yield {
            "user2": [
                {
                    login: "user2",
                    avatar_url: "https://avatars.githubusercontent.com/u/4964569?v=4",
                    user_url: "https://github.com/user2",
                    repo: "user1/repo1",
                    url: "https://github.com/user1/repo1"
                },
                {
                    login: "user2",
                    avatar_url: "https://avatars.githubusercontent.com/u/4964569?v=4",
                    user_url: "https://github.com/user2",
                    repo: "user1/repo2",
                    url: "https://github.com/user1/repo1"
                }
            ]
        };
    },
    setToken: function (token) {
        console.log(`Mock token set: ${token}`);
    }
};