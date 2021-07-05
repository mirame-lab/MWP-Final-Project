var adminfs = require("firebase-admin");
var serviceAccount = require("./mwp2021-firebase-key.json");

adminfs.initializeApp({
    credential: adminfs.credential.cert(serviceAccount),
    //databaseURL: "https://mwp2021-6cc36-default-rtdb.firebaseio.com"
});

var dbfs = adminfs.firestore();

var config = {
    'dbfs': dbfs
};
module.exports = config;