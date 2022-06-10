const functions = require("firebase-functions");
const axios = require("axios").default;
const cheerio = require("cheerio");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.getUrlMetadata = functions.https.onCall(async (url) => {
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
      return parsedData;
    })
    .catch((err) => {
      throw new functions.https.HttpsError('internal', `Fail to get url metadata: ${err}`);
    });
});
