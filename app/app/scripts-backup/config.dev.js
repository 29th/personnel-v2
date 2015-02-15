define(["jquery"], function ($) {
    return {
        baseUrl: "http://personnel.29th.org",
        apiHost: "/personnel-api",
        coatDir: "/personnel-api/coats",
        forum: {
        	"Vanilla": {
        		"baseUrl": "/forums",
        		"signInPath": "/entry/signin",
        		"profilePath": "/profile/%s/%s",
        		"topicPath": "/discussion/%s",
        		"privateMessagePath": "/messages/add"
			},
            "SMF": {
                "baseUrl": "http://29th.org/forums",
                "topicPath": "/?topic=%s.0"
            }
        },
        wikiUrl: "http://29th.org/wiki",
        vanillaCategoryEnlistments: 62
    };
});