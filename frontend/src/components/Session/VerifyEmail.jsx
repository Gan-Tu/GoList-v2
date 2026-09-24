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

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Utilities/Button";
import StatusMessage from "../Utilities/StatusMessage";
import TextInput from "../Utilities/TextInput";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  Spinner
} from "../Utilities/SvgIcons";
import {
  useDocumentTitle,
  useEmailVerificationStatus
} from "../../hooks/session";
import { prefetchMyLists } from "../Layout/prefetch";

export default function VerifyEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useEmailVerificationStatus();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle("Signing in · GoList");

  useEffect(() => {
    dispatch({ type: "session/verifyEmail" });
  }, [dispatch]);

  useEffect(() => {
    if (status !== "success") return undefined;
    const timer = window.setTimeout(() => navigate("/_/myList"), 1200);
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  // The success message stays up for a beat before moving on; that is time
  // enough to fetch the lazy My Lists route so it opens without a spinner.
  useEffect(() => {
    if (status === "success") prefetchMyLists();
  }, [status]);

  if (status === "success") {
    return (
      <StatusMessage
        icon={CheckCircleIcon}
        tone="success"
        title="You’re signed in"
        role="status"
      >
        Taking you to your lists…
      </StatusMessage>
    );
  }

  // Opening the link on a different device from the one that requested it
  // means the email is not in this browser's storage. The old code called
  // window.prompt() here.
  if (status === "needsEmail") {
    return (
      <div className="mx-auto w-full max-w-md py-4 sm:py-8">
        <div className="rounded-2xl border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-fg">
            <EnvelopeIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-balance text-xl font-semibold tracking-tight text-fg">
            Confirm your email address
          </h1>
          <p className="mt-2 text-pretty text-[15px] leading-6 text-fg-muted">
            It looks like you opened this link on a different device. Enter the
            address you requested the link with to finish signing in.
          </p>
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitting(true);
              dispatch({ type: "session/verifyEmail", email });
            }}
          >
            <TextInput
              inputId="confirm-email"
              labelText="Email"
              value={email}
              setValue={setEmail}
              isEmail
              isRequired
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
            />
            {/* Pending until the saga settles on success or failed, and
                either one replaces this form. */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-5 w-full"
              disabled={!email}
              loading={submitting}
            >
              Finish signing in
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <StatusMessage
        icon={ExclamationTriangleIcon}
        tone="danger"
        title="This sign-in link didn’t work"
        actions={
          <Button as={Link} to="/" variant="primary" size="lg">
            Back to GoList
          </Button>
        }
      >
        Sign-in links expire and can only be used once. Request a new one to
        try again.
      </StatusMessage>
    );
  }

  // Held back for 300ms, like the route fallback in App.jsx: a link that is
  // checked quickly (or found invalid at once) never flashes a spinner.
  return (
    <StatusMessage
      icon={Spinner}
      title="Signing you in…"
      role="status"
      className="animate-[fade-in_200ms_ease-out_300ms_both]"
    />
  );
}
