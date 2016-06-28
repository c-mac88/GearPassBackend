// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
    databaseURI: databaseUri || 'mongodb://localhost:27017/GearPass',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || '3fb0ee849bd515e37bd07f69771f5d47',
    masterKey: process.env.MASTER_KEY || '662f22623934b6da38c191f1506d96cf', //Add your master key here. Keep it secret!
    serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
    // emailAdapter: SimpleSendGridAdapter({
    //     apiKey: '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',
    //     fromAddress: 'noreply@gearpass.com',
    // }),
    liveQuery: {
        classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
    },
    oauth: {
        facebook: {
            appIds: "284143441935321"
        }
    }
});

var dashboard = new ParseDashboard({
    "apps": [{
        "serverURL": process.env.SERVER_URL || 'http://localhost:1337/parse',
        "appId": process.env.APP_ID || '3fb0ee849bd515e37bd07f69771f5d47',
        "masterKey": process.env.MASTER_KEY || '662f22623934b6da38c191f1506d96cf',
        "appName": "GearPass"
    }],
    "users": [{
        "user": "gearpass",
        "pass": "pass123"
    }]
}, true);

var app = express();

var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.use('/dashboard', dashboard);

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server running on port ' + port + '.');
});
