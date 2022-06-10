const functions = require("firebase-functions");
const axios = require("axios").default;
const cheerio = require("cheerio");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.getUrlMetadata = functions.https.onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.sendStatus(404);
  }
  return axios
      .get(req.body.url)
      .then((resp) => {
        const $ = cheerio.load(resp.data);
        const parsedData = {
          url: req.body.url,
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
        const origin = new URL(req.body.url).origin;
        if (origin && origin !== "null") {
          for (const key of Object.keys(parsedData)) {
            if (parsedData[key] && parsedData[key].startsWith("/")) {
              parsedData[key] = `${origin}${parsedData[key]}`;
            }
          }
        }
        return res.json(parsedData);
      })
      .catch((err) => res.status(500).json(err));
});
