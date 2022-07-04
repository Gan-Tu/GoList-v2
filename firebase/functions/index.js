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

const functions = require("firebase-functions");
const axios = require("axios").default;
const cheerio = require("cheerio");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

async function getUrlMetadataImpl(url) {
  return axios
    .get(url)
    .then((resp) => {
      const $ = cheerio.load(resp.data);
      const parsedData = {
        url: url,
        title: $("title").text(),
        icon: $("link[rel='icon']").attr("href"),
        description: $("meta[name='description']").attr("content"),
        ogTitle: $("meta[property='og:title']").attr("content"),
        ogSiteName: $("meta[property='og:site_name']").attr("content"),
        ogDescription: $("meta[property='og:description']").attr("content"),
        ogImage: $("meta[property='og:image']").attr("content"),
        twitterTitle: $("meta[name='twitter:title']").attr("content"),
        twitterSite: $("meta[name='twitter:site']").attr("content"),
        twitterDescription: $("meta[name='twitter:description']").attr(
          "content"
        ),
        twitterImage: $("meta[name='twitter:image']").attr("content"),
      };
      const origin = new URL(url).origin;
      if (origin && origin !== "null") {
        for (const key of Object.keys(parsedData)) {
          if (parsedData[key] && parsedData[key].startsWith("/")) {
            parsedData[key] = `${origin}${parsedData[key]}`;
          }
        }
      }
      return [parsedData, null];
    })
    .catch((err) => {
      return [null, err];
    });
}

exports.getUrlMetadata = functions.https.onCall(async (url) => {
  const [data, err] = await getUrlMetadataImpl(url);
  if (err) {
    throw new functions.https.HttpsError(
      "internal",
      `Fail to get url metadata: ${err}`
    );
  } else {
    return data;
  }
});

exports.onCreateDataGroups = functions.firestore
  .document("DataGroups/{id}")
  .onCreate(async (snap, _context) => {
    const data = snap.data();
    let itemsData = data?.items || {};
    for (const [itemId, itemData] of Object.entries(itemsData)) {
      if (itemData.link) {
        const [metadata, err] = await getUrlMetadataImpl(itemData.link);
        if (err) {
          console.error(err);
          continue;
        }
        itemsData[itemId] = {
          ...itemData,
          title:
            itemData?.title ||
            metadata?.twitterTitle ||
            metadata?.ogTitle ||
            metadata?.title ||
            metadata?.twitterSite ||
            "",
          snippet:
            itemData?.snippet ||
            metadata?.twitterDescription ||
            metadata?.ogDescription ||
            metadata?.description ||
            "",
          imageUrl:
            itemData?.imageUrl ||
            metadata?.twitterImage ||
            metadata?.ogImage ||
            metadata?.icon ||
            "",
        };
      }
    }
    snap.ref.set({ items: itemsData }, { merge: true });
  });
