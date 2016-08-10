module.exports = {
    baseUrl: process.env.BASE_URL,
    apiHost: process.env.API_HOST,
    coatDir: process.env.COAT_DIR,
    forum: {
    	"Vanilla": {
    		"baseUrl": process.env.FORUM_VANILLA_BASE_URL,
    		"signInPath": "/entry/signin",
    		"profilePath": "/profile/%s/%s",
    		"topicPath": "/discussion/%s",
    		"privateMessagePath": "/messages/add",
    		"apiPath" : "/api"
		  },
      "SMF": {
          "baseUrl": process.env.FORUM_SMF_BASE_URL,
          "topicPath": "/?topic=%s.0"
      }
    },
    sigUrl: process.env.SIG_URL,
    wikiUrl: process.env.WIKI_URL,
    vanillaCategoryAwards: 59,
    vanillaCategoryEnlistments: 62,
    vanillaCategoryPromotions: 59,
    vanillaCategoryTransfers: 58
};
