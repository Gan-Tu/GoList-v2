// Copyright 2022 Gan Tu
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./golist-v2-firebase-adminsdk.json");
var seedDb = require("./db.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// async function main() {
//   for (const data of seedDb.collections) {
//     const docRef = db.collection('collections').doc(data.id);
//     await docRef.set(data);
//   }

//   for (const data of seedDb.items) {
//     const docRef = db.collection('collections').doc(data.collectionId).collection("items").doc(data.id);
//     await docRef.set(data);
//   }
// }

async function main() {
  let documents = new Map();
  for (const data of seedDb.collections) {
    documents.set(data.id, { ...data, items: {} });
  }

  for (const data of seedDb.items) {
    let collection = documents.get(data.collectionId);
    collection.items[data.id] = data;
    delete collection.items[data.id].collectionId;
  }

  for (const [id, data] of documents) {
    const docRef = db.collection("DataGroups").doc(id);
    await docRef.set(data);
  }
}

main();
