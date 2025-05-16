const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-webapp-3a6fb-default-rtdb.firebaseio.com/", // 🔁 Replace this
});

const db = admin.database();
module.exports = db;
