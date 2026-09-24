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

import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button, { buttonClasses } from "../Utilities/Button";
import Monogram from "../Utilities/Monogram";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  LinkIcon,
  PencilSquareIcon,
  QueueListIcon,
  ShareIcon
} from "../Utilities/SvgIcons";
import { validateShortUrl } from "../Utilities/Helpers";
import {
  CreateCollectionDialog,
  ShortUrlField
} from "../Collections/CreateCollectionModal";

// The landing page ships in the main bundle, so everything here is markup and
// CSS: the product preview is drawn with the same tokens and Monogram tiles as
// the real collection page — no screenshots, no images, no requests.

const HINT = "Letters, numbers, - and +. At least 6 characters.";

// Contents for the preview card: public, non-commercial pages under their own
// names, so the card neither invents an article for a real company nor reads
// as a partner's endorsement. Plain-text hosts only, no logos.
const PREVIEW_LINKS = [
  { host: "wikipedia.org", title: "Slow travel" },
  { host: "gutenberg.org", title: "Walking, by Henry David Thoreau" },
  { host: "apod.nasa.gov", title: "Astronomy Picture of the Day" },
  { host: "openlibrary.org", title: "Open Library" }
];

// The soft glow behind the preview, in the logo's green, cyan and blue.
// Radial gradients rather than a blur filter: a large blurred layer is
// expensive to paint and composite, and this looks the same. `closest-side`
// makes each one fade out exactly at the box's edge, so it never shows one.
const GLOW_STYLE = {
  backgroundImage: [
    "radial-gradient(closest-side at 24% 55%, rgb(5 150 105 / 0.34), rgb(5 150 105 / 0))",
    "radial-gradient(closest-side at 50% 40%, rgb(8 145 178 / 0.26), rgb(8 145 178 / 0))",
    "radial-gradient(closest-side at 76% 55%, rgb(0 113 227 / 0.34), rgb(0 113 227 / 0))"
  ].join(", ")
};

const STEPS = [
  {
    icon: QueueListIcon,
    title: "Paste your links",
    body: "Drop in up to 10 links, one per line. Titles and previews fill in on their own."
  },
  {
    icon: PencilSquareIcon,
    title: "Pick a short URL",
    body: (
      <>
        Claim a name like{" "}
        <span className="whitespace-nowrap">goli.st/weekend-reading</span>{" "}
        that’s easy to say and type.
      </>
    )
  },
  {
    icon: ShareIcon,
    title: "Share it anywhere",
    body: "Send one link in a chat, an email or a bio. Everything opens from there."
  }
];

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <ProductPreview />
      <HowItWorks />
    </div>
  );
}

function Hero() {
  const inputRef = useRef(null);
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [claimedUrl, setClaimedUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const check = (value) =>
    value ? validateShortUrl(value) : "Choose a short URL first.";

  const onChange = (value) => {
    setShortUrl(value);
    // Once an error is showing, it follows the input so it clears the moment
    // the value is fixed. Before that, typing is never interrupted.
    if (error) setError(value.trim() ? check(value.trim()) : "");
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const value = shortUrl.trim();
    const message = check(value);
    setError(message);
    if (message) {
      inputRef.current?.focus();
      return;
    }
    // Same event, so the dialog opens already seeded with this URL.
    setClaimedUrl(value);
    setIsDialogOpen(true);
  };

  return (
    <section className="mx-auto max-w-4xl pt-4 text-center sm:pt-12 lg:pt-16">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[13px] font-medium text-fg-muted shadow-card ring-1 ring-hairline">
        <CheckIcon
          className="h-4 w-4 text-accent-fg"
          strokeWidth={2}
          aria-hidden="true"
        />
        No sign-up required
      </p>

      <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:mt-6 sm:text-6xl">
        One short URL for every link that{" "}
        {/* The one place color comes from outside the tokens: the logo's
            gradient. Every stop clears 3:1 against the canvas as large text
            in its theme. `box-decoration-clone` restarts it on each line. */}
        <span className="box-decoration-clone bg-gradient-to-r from-[#059669] via-[#0891b2] to-[#0071e3] bg-clip-text text-transparent dark:from-[#34d399] dark:via-[#22d3ee] dark:to-[#40a2ff]">
          belongs together
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-fg-muted sm:mt-6 sm:text-xl">
        Bundle links into a collection and share it as{" "}
        <span className="whitespace-nowrap font-medium text-fg">
          goli.st/slug
        </span>
        .
      </p>

      {/* Phones: field, hint, then a full-width button. From `sm` the button
          moves up beside the field and the hint spans underneath. */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-3 text-left sm:mt-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-2.5"
      >
        <div>
          <label htmlFor="claim-url" className="sr-only">
            Short URL
          </label>
          <ShortUrlField
            ref={inputRef}
            id="claim-url"
            size="lg"
            value={shortUrl}
            onChange={onChange}
            invalid={Boolean(error)}
            placeholder="slug"
            enterKeyHint="go"
            aria-describedby={error ? "claim-url-error" : "claim-url-hint"}
          />
        </div>
        {error ? (
          <p
            id="claim-url-error"
            role="alert"
            className="px-4 text-[13px] leading-5 text-danger-fg sm:col-span-2"
          >
            {error}
          </p>
        ) : (
          <p
            id="claim-url-hint"
            className="px-4 text-[13px] leading-5 text-fg-muted sm:col-span-2"
          >
            {HINT}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="sm:col-start-2 sm:row-start-1"
        >
          Create
          <ArrowRightIcon
            className="h-4 w-4"
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
      </form>

      <Link
        to="/demo"
        className="group mt-4 inline-flex h-10 items-center gap-1 rounded-full px-3 text-[15px] font-medium text-accent-fg hover:underline hover:underline-offset-4"
      >
        See an example
        <ArrowRightIcon
          className="h-4 w-4 transition-transform duration-200 ease-smooth group-hover:translate-x-0.5"
          strokeWidth={2}
          aria-hidden="true"
        />
      </Link>

      <CreateCollectionDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        initialShortUrl={claimedUrl}
      />
    </section>
  );
}

/** A still of a collection page. Decorative: hidden from assistive tech. */
function ProductPreview() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative isolate mx-auto mt-14 max-w-5xl select-none py-8 sm:mt-20 sm:py-12 lg:px-16"
    >
      <div
        className="absolute inset-0 -z-10 dark:opacity-70"
        style={GLOW_STYLE}
      />

      <div className="mx-auto max-w-3xl overflow-hidden rounded-[22px] bg-surface shadow-popover ring-1 ring-hairline">
        <div className="flex h-11 items-center gap-3 border-b border-hairline px-4">
          <div className="hidden w-12 gap-1.5 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <span className="truncate rounded-full bg-subtle px-3 py-1 font-mono text-[12px] text-fg-muted">
              goli.st/weekend-reading
            </span>
          </div>
          {/* Balances the dots so the address sits dead center. */}
          <div className="hidden w-12 sm:block" />
        </div>

        <div className="p-4 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 text-left">
              <p className="truncate text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                Weekend reading
              </p>
              <p className="mt-0.5 text-[13px] tabular-nums text-fg-muted">
                {PREVIEW_LINKS.length} links
              </p>
            </div>
            <div className="hidden shrink-0 sm:block">
              <span className={buttonClasses({ size: "sm" })}>
                <LinkIcon className="h-4 w-4" strokeWidth={2} />
                Copy link
              </span>
            </div>
          </div>

          <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-6 sm:grid-cols-2 sm:gap-3">
            {PREVIEW_LINKS.map((link) => (
              <li
                key={link.host}
                className="flex items-center gap-3 rounded-2xl bg-surface p-3 text-left shadow-card ring-1 ring-hairline"
              >
                <Monogram
                  seed={link.host}
                  className="h-10 w-10 shrink-0 rounded-xl"
                  letterClassName="text-[15px]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold leading-snug text-fg">
                    {link.title}
                  </p>
                  <p className="truncate text-[13px] text-fg-muted">
                    {link.host}
                  </p>
                </div>
                <ArrowUpRightIcon
                  className="h-4 w-4 shrink-0 text-fg-subtle"
                  strokeWidth={2}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works"
      className="mx-auto mt-12 max-w-5xl pb-4 sm:mt-16"
    >
      <h2
        id="how-it-works"
        className="text-center text-xl font-semibold tracking-tight text-fg sm:text-2xl"
      >
        How it works
      </h2>
      {/* Icon beside the text on a phone, where three stacked columns would
          be mostly air; from `sm`, centered columns under the heading. */}
      <ol className="mt-8 grid grid-cols-1 gap-7 sm:mt-10 sm:grid-cols-3 sm:gap-6 lg:gap-10">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex gap-4 sm:flex-col sm:items-center sm:gap-0 sm:text-center"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-fg">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div className="min-w-0 sm:mt-4">
              <h3 className="text-[15px] font-semibold leading-snug text-fg">
                {title}
              </h3>
              <p className="mt-1 text-pretty text-[15px] leading-6 text-fg-muted">
                {body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
