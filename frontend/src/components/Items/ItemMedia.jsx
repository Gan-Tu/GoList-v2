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

import { useState } from "react";
import Monogram from "../Utilities/Monogram";
import { classNames } from "../Utilities/Helpers";

// Suffixes under which the name is the label just before them: bbc.co.uk,
// redux.js.org, someone.github.io. (A pocket version of the public suffix
// list — only the shared hosts links commonly point at.)
const SHARED_SUFFIX =
  /\.(?:(?:ac|co|com|edu|gov|ne|net|or|org)\.[a-z]{2}|js\.org|github\.io|gitlab\.io|vercel\.app|netlify\.app|pages\.dev|web\.app|substack\.com|blogspot\.com|wordpress\.com)$/i;

/**
 * The name a site goes by, for its monogram letter: "en.wikipedia.org" is W,
 * not E, and "news.ycombinator.com" is Y. The hue still comes from the full
 * host, so every link to one site gets the same tile.
 */
export function siteName(host) {
  const value = String(host || "");
  const suffix = value.match(SHARED_SUFFIX);
  const base = suffix
    ? value.slice(0, suffix.index)
    : value.replace(/\.[^.]+$/, "");
  const labels = base.split(".").filter(Boolean);
  return labels[labels.length - 1] || value;
}

/** A site's monogram tile: the stand-in wherever a link has no image. */
export function SiteMonogram({ host, className = "", letterClassName }) {
  return (
    <Monogram
      seed={host}
      label={siteName(host)}
      className={className}
      letterClassName={letterClassName}
    />
  );
}

// A preview image is whatever the page declared as its og:image. Most are
// 1.91:1 banners and fill the card's image area exactly, but some sites hand
// out a square app icon or a portrait photo instead. Cropping a 192px icon to
// a banner blows it up and cuts it in half, so the shape is read once the
// image has loaded (it is invisible until then, so nothing visibly changes).
function shapeOf(image) {
  const { naturalWidth: width, naturalHeight: height } = image;
  if (!width || !height) return "wide";
  const ratio = width / height;
  if (ratio < 0.8) return "tall";
  if (ratio < 1.3) return "square";
  return "wide";
}

function usePreviewImage() {
  const [state, setState] = useState({ status: "loading", shape: "wide" });
  const handlers = {
    onLoad: (event) =>
      setState({ status: "loaded", shape: shapeOf(event.currentTarget) }),
    onError: () => setState({ status: "failed", shape: "wide" })
  };
  return [state, handlers];
}

// The first row of cards is what a visitor sees on arrival, so those images
// load eagerly at high priority; everything further down waits until it is
// scrolled near. React 18 does not know the camelCase `fetchPriority` prop
// and warns about it; the lowercase attribute passes straight through. The
// spread goes before `src` so both attributes are set before the fetch starts.
function loadingProps(priority) {
  return priority
    ? { loading: "eager", fetchpriority: "high" }
    : { loading: "lazy" };
}

// A hairline drawn over the image rather than around its box: a white
// screenshot on a white card otherwise has no visible edge. Callers position
// it (over the whole box, or over the centered icon tile).
function ImageEdge({ className }) {
  return (
    <div
      aria-hidden="true"
      className={classNames(
        "pointer-events-none absolute ring-1 ring-inset ring-black/5 dark:ring-white/10",
        className
      )}
    />
  );
}

const TILE_CLASS =
  "absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-2xl";

function MediaImage({ src, seed, priority }) {
  const [{ status, shape }, handlers] = usePreviewImage();

  // A dead image URL is common (the page changed, the CDN expired it), so it
  // degrades to the same tile a link without any image gets.
  if (status === "failed") {
    return (
      <SiteMonogram host={seed} className="absolute inset-0" letterClassName="text-4xl" />
    );
  }

  const isTile = shape === "square";

  return (
    // The hover zoom lives on a wrapper so it can run slower than the image's
    // own fade-in without the two transitions fighting over one element.
    <div className="absolute inset-0 transition-transform duration-500 ease-smooth motion-safe:group-hover:scale-[1.03]">
      <img
        alt=""
        {...loadingProps(priority)}
        src={src}
        width="1200"
        height="630"
        decoding="async"
        referrerPolicy="no-referrer"
        {...handlers}
        className={classNames(
          "transition-opacity duration-200 ease-out",
          status === "loaded" ? "opacity-100" : "opacity-0",
          isTile
            ? classNames(TILE_CLASS, "object-cover shadow-card")
            : "h-full w-full object-cover",
          // Portraits are usually people; keep the top of the frame (the
          // face) rather than the middle.
          shape === "tall" && "object-top"
        )}
      />
      {isTile && status === "loaded" && <ImageEdge className={TILE_CLASS} />}
    </div>
  );
}

/**
 * The image area at the top of a link card. Its box is fixed at 1.91:1 — the
 * OpenGraph shape, so the common preview shows uncropped — and reserved
 * before anything loads, so images arriving never shift the grid.
 *
 * `pending` shows a placeholder pulse while a just-added link's preview is
 * still being fetched; with no image at all the site's monogram fills it.
 */
export function ItemMedia({ src, seed, priority = false, pending = false }) {
  return (
    <div className="relative aspect-[1.91/1] overflow-hidden border-b border-hairline bg-subtle">
      {src ? (
        // Keyed by URL so editing the thumbnail URL starts a fresh load
        // rather than keeping the previous image's failed/loaded state.
        <MediaImage key={src} src={src} seed={seed} priority={priority} />
      ) : pending ? (
        <div className="absolute inset-0 animate-pulse bg-subtle" />
      ) : (
        <SiteMonogram host={seed} className="absolute inset-0" letterClassName="text-4xl" />
      )}
    </div>
  );
}

function ThumbnailImage({ src, seed }) {
  const [{ status, shape }, handlers] = usePreviewImage();

  if (status === "failed") {
    return (
      <SiteMonogram host={seed} className="absolute inset-0" letterClassName="text-sm" />
    );
  }

  return (
    <>
      <img
        alt=""
        loading="lazy"
        src={src}
        width="76"
        height="40"
        decoding="async"
        referrerPolicy="no-referrer"
        {...handlers}
        className={classNames(
          "absolute inset-0 h-full w-full transition-opacity duration-200 ease-out",
          status === "loaded" ? "opacity-100" : "opacity-0",
          shape === "square" ? "object-contain" : "object-cover",
          shape === "tall" && "object-top"
        )}
      />
      <ImageEdge className="inset-0 rounded-[inherit]" />
    </>
  );
}

/**
 * The small preview at the start of a compact row. `wide` gives it the card's
 * own 1.91:1 shape from `sm` up, so a banner reads the same in both places;
 * it stays square on phones, where the row has little width to spare.
 */
export function ItemThumbnail({ src, seed, wide = false, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={classNames(
        "relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-subtle",
        wide && "sm:w-[76px]",
        className
      )}
    >
      {src ? (
        <ThumbnailImage key={src} src={src} seed={seed} />
      ) : (
        <SiteMonogram host={seed} className="absolute inset-0" letterClassName="text-sm" />
      )}
    </div>
  );
}
