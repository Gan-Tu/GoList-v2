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

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Button from "../Utilities/Button";
import Modal, { ModalActions } from "../Utilities/Modal";
import TextInput from "../Utilities/TextInput";
import { CheckCircleIcon, EnvelopeIcon } from "../Utilities/SvgIcons";
import { useEmailForSignIn } from "../../hooks/session";
import { FacebookLogo, GitHubLogo, GoogleLogo, XLogo } from "./ProviderLogos";

function EmailLogo({ className }) {
  return (
    <EnvelopeIcon className={className} strokeWidth={1.75} aria-hidden="true" />
  );
}

// Every provider gets the same neutral button. They used to be full-bleed brand
// colors — a rainbow in which the white-on-green and white-on-red labels failed
// contrast — and the only thing that needs to differ is the mark.
const PROVIDERS = [
  { key: "GOOGLE", label: "Continue with Google", Logo: GoogleLogo },
  { key: "GITHUB", label: "Continue with GitHub", Logo: GitHubLogo },
  { key: "FACEBOOK", label: "Continue with Facebook", Logo: FacebookLogo },
  // Still TWITTER underneath: the key names the Firebase auth provider.
  { key: "TWITTER", label: "Continue with X", Logo: XLogo },
  { key: "EMAIL", label: "Continue with email", Logo: EmailLogo }
];

// The saga reports success through the store (emailForSignIn) but a failure
// only as a toast, so the spinner is capped rather than left to wait for a
// signal that may never come. Editing the address ends it early.
const SEND_PENDING_MAX_MS = 4000;

function SignInWithEmailForm({ inputRef, onBack, onDone, onSignIn }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const emailForSignIn = useEmailForSignIn();
  const linkSent = Boolean(emailForSignIn);

  const updateEmail = (value) => {
    setEmail(value);
    setSending(false);
  };

  useEffect(() => {
    if (!sending) return undefined;
    const timer = window.setTimeout(
      () => setSending(false),
      SEND_PENDING_MAX_MS
    );
    return () => window.clearTimeout(timer);
  }, [sending]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (linkSent || sending || !email) return;
        setSending(true);
        onSignIn(email);
      }}
    >
      <TextInput
        ref={inputRef}
        inputId="email"
        labelText="Email"
        // Once sent, show the address the link went to, even if the dialog
        // was closed and reopened since.
        value={linkSent ? emailForSignIn : email}
        setValue={updateEmail}
        isEmail
        isRequired
        isDisabled={linkSent}
        autoComplete="email"
        autoFocus
        placeholder="you@example.com"
      />

      {linkSent && (
        <div
          className="mt-4 flex gap-2.5 rounded-xl bg-success-soft p-3 text-sm text-success-fg"
          role="status"
        >
          <CheckCircleIcon
            className="mt-px h-5 w-5 shrink-0"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium">Check your inbox for a sign-in link.</p>
            <p className="mt-0.5">If it isn’t there, check your spam folder.</p>
          </div>
        </div>
      )}

      <ModalActions>
        <Button onClick={onBack}>Back</Button>
        {linkSent ? (
          // Sending disables whatever had focus, so focus moves here rather
          // than dropping out of the dialog. Keyed so React mounts a new
          // button (autoFocus only acts on mount) instead of reusing Send's.
          <Button key="done" variant="primary" onClick={onDone} autoFocus>
            Done
          </Button>
        ) : (
          <Button
            key="send"
            type="submit"
            variant="primary"
            disabled={!email}
            loading={sending}
          >
            Send link
          </Button>
        )}
      </ModalActions>
    </form>
  );
}

export default function LogInModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  // Coming back from the email form, focus returns to the button that opened
  // it instead of falling to the top of the dialog.
  const [returnedFromEmail, setReturnedFromEmail] = useState(false);
  const firstProviderRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsEmailLogin(false);
      setReturnedFromEmail(false);
    }
  }, [isOpen]);

  const handleLogIn = (loginType) => {
    if (loginType === "EMAIL") {
      setIsEmailLogin(true);
      return;
    }
    dispatch({ type: "session/logIn", loginType });
  };

  return (
    <Modal
      title={isEmailLogin ? "Sign in with email" : "Sign in to GoList"}
      description={
        isEmailLogin
          ? "We’ll email you a link that signs you in. No password needed."
          : "Save your lists and edit them from any device."
      }
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      initialFocus={isEmailLogin ? emailInputRef : firstProviderRef}
    >
      {isEmailLogin ? (
        <SignInWithEmailForm
          inputRef={emailInputRef}
          onBack={() => {
            setIsEmailLogin(false);
            setReturnedFromEmail(true);
          }}
          onDone={onClose}
          onSignIn={(email) =>
            dispatch({ type: "session/logIn", loginType: "EMAIL", email })
          }
        />
      ) : (
        <>
          <div className="grid gap-2.5">
            {PROVIDERS.map(({ key, label, Logo }, index) => (
              <Button
                key={key}
                ref={index === 0 ? firstProviderRef : undefined}
                size="lg"
                className="w-full"
                autoFocus={key === "EMAIL" && returnedFromEmail}
                onClick={() => handleLogIn(key)}
              >
                {/* Pinned left so the marks line up in a column while each
                    label stays centered on the button. */}
                <Logo className="absolute left-4 h-5 w-5" />
                {label}
              </Button>
            ))}
          </div>

          <div className="my-4 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-hairline" />
            <span className="text-[13px] text-fg-muted">or</span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => {
              handleLogIn("GUEST");
              // A guest session is not an account, so nothing else would
              // close the dialog once it exists.
              onClose();
            }}
          >
            Continue as guest
          </Button>

          <p className="mt-5 text-center text-[13px] leading-5 text-fg-muted">
            By continuing you agree to our{" "}
            <Link
              to="/privacy"
              onClick={onClose}
              className="text-accent-fg underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </>
      )}
    </Modal>
  );
}
