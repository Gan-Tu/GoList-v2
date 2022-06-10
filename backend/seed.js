const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

var serviceAccount = require("./golist-v2-firebase-adminsdk.json");
var seedDb = require("./db.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();


async function main() {
  for (const data of seedDb.collections) {
    const docRef = db.collection('collections').doc(data.id);
    await docRef.set(data);
  }

  for (const data of seedDb.items) {
    const docRef = db.collection('collections').doc(data.collectionId).collection("items").doc(data.id);
    await docRef.set(data);
  }
}

main();