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

const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const cheerio = require("cheerio");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* GET site metadata. */
router.post("/getMetadata", function (req, res, next) {
  axios
    .get(req.body.url)
    .then((resp) => {
      const $ = cheerio.load(resp.data);
      res.json({
        title: $("title").text(),
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
      });
    })
    .catch((err) => res.status(500).json(err));
});

module.exports = router;
