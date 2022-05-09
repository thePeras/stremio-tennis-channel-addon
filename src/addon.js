const {addonBuilder} = require("stremio-addon-sdk");
const constants = require("./constants");
const request = require("request-promise");
const m3u8 = require("m3u8-stream-list");

async function init() {
    const manifest = {
        "id": "com.sleeyax.dlive-addon",
        "name": "Tennis Channel",
        "version": "1.0.0",
        "description": "Watch Tennis games",
        "catalogs": [{
            "id": "dlive_catalog", "type": "tv", "name": "Tennis", "genres": [], "extra": [{
                "name": "search", "isRequired": false
            }, {
                "name": "genre", "isRequired": false
            }, {
                "name": "skip", "isRequired": false
            }]
        }],
        "resources": ["stream", "meta", "catalog"],
        "types": ["tv"],
        "logo": constants.avatar,
        "idPrefixes": ["tennis_tv"]
    };

    const builder = new addonBuilder(manifest);

    builder.defineCatalogHandler(async (args) => {
        console.log("catalog: ", args);

        streams = [ 
            {
                id: "tennis_tv:11",
                type: "tv",
                name: "Tennis Channel",
                poster: constants.thumbnail,
                posterShape: "landscape",
                logo: constants.avatar,
                banner: constants.thumbnail
            }]
        
        
        return Promise.resolve({metas: streams, cacheMaxAge:  10}); // cache for 7 minutes (streamers can go online any second, we don't want this value to be too high)
    });

    builder.defineStreamHandler(async (args) => {
        console.log("stream: ", args);

        const streamSources = await request(constants.source).then(response => {
            //console.log(response)
            return m3u8(response);
        });

        const streams = streamSources.map(stream => {
            return {
                url: stream.url,
                title: stream.RESOLUTION
            };
        });

        return Promise.resolve({streams});
    });

    builder.defineMetaHandler(async args => {
        console.log("meta: ", args);

        return Promise.resolve({
            meta: {
                id: args.id,
                type: "tv",
                name: "Tennis Channel",
                poster: constants.avatar,
                posterShape: "landscape",
                background: constants.thumbnail,
                logo: constants.avatar,
                description: "See who is playing now on Tennis Channel",
            },
            cacheMaxAge: 4 * 3600 // cache for 4 hours
        });
    });

    return builder.getInterface();
}

module.exports = init;
