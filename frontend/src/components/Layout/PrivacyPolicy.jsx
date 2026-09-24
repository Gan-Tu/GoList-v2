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

import { useDocumentTitle } from "../../hooks/session";

// Styling lives in these few pieces so the policy below reads as the document
// it is, and so every paragraph is guaranteed the same treatment — the markup
// used to repeat (and occasionally misspell) the same classes forty times.

const LINK =
  "text-accent-fg underline decoration-accent-fg/30 underline-offset-2 transition-colors hover:decoration-accent-fg";

function Section({ id, title, children }) {
  return (
    <section>
      {/* scroll-mt keeps an anchored heading clear of the sticky header. */}
      <h2
        id={id}
        className="mt-12 scroll-mt-20 text-balance text-lg font-semibold tracking-tight text-fg"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Subsection({ title, children }) {
  return (
    <>
      <h3 className="mt-8 text-balance text-[15px] font-semibold text-fg">
        {title}
      </h3>
      {children}
    </>
  );
}

function P({ children }) {
  return <p className="mt-3 text-pretty">{children}</p>;
}

function List({ children }) {
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-fg-subtle">
      {children}
    </ul>
  );
}

// Previously this lived only inside a modal launched from the footer, so it
// had no URL of its own — it could not be linked to, bookmarked, or crawled,
// which is a problem for a document you are legally expected to publish.
export default function PrivacyPolicy() {
  useDocumentTitle("Privacy Policy · GoList");

  return (
    <article className="mx-auto w-full max-w-2xl text-[15px] leading-7 text-fg/80">
      <header className="border-b pb-8">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[13px] leading-5 text-fg-muted">
          Last updated <time dateTime="2022-07-10">10 July 2022</time>
        </p>
      </header>

      <div className="mt-8">
        <p className="text-pretty">
          Your privacy is important to us. It is GoList&#39;s policy to
          respect your privacy and comply with any applicable law and
          regulation regarding any personal information we may collect about
          you, including across our website,{" "}
          <a href="https://goli.st" className={LINK}>
            https://goli.st
          </a>
          , and other sites we own and operate.
        </p>
        <P>
          This policy is effective as of 10 July 2022 and was last updated on
          10 July 2022.
        </P>
      </div>

      <Section id="information-we-collect" title="Information We Collect">
        <P>
          Information we collect includes both information you knowingly and
          actively provide us when using or participating in any of our
          services and promotions, and any information automatically sent by
          your devices in the course of accessing our products and services.
        </P>

        <Subsection title="Log Data">
          <P>
            When you visit our website, our servers may automatically log the
            standard data provided by your web browser. It may include your
            device’s Internet Protocol (IP) address, your browser type and
            version, the pages you visit, the time and date of your visit, the
            time spent on each page, other details about your visit, and
            technical details that occur in conjunction with any errors you
            may encounter.
          </P>
          <P>
            Please be aware that while this information may not be personally
            identifying by itself, it may be possible to combine it with other
            data to personally identify individual persons.
          </P>
        </Subsection>

        <Subsection title="Personal Information">
          <P>
            We may ask for personal information which may include one or more
            of the following:
          </P>
          <List>
            <li>Name</li>
            <li>Email</li>
            <li>Social media profiles</li>
          </List>
        </Subsection>

        <Subsection title="Legitimate Reasons for Processing Your Personal Information">
          <P>
            We only collect and use your personal information when we have a
            legitimate reason for doing so. In which instance, we only collect
            personal information that is reasonably necessary to provide our
            services to you.
          </P>
        </Subsection>

        <Subsection title="Collection and Use of Information">
          <P>
            We may collect personal information from you when you do any of
            the following on our website:
          </P>
          <List>
            <li>Use a mobile device or web browser to access our content</li>
            <li>
              Contact us via email, social media, or on any similar
              technologies
            </li>
            <li>When you mention us on social media</li>
          </List>
          <P>
            We may collect, hold, use, and disclose information for the
            following purposes, and personal information will not be further
            processed in a manner that is incompatible with these purposes:
          </P>
          <P>
            We may collect, hold, use, and disclose information for the
            following purposes, and personal information will not be further
            processed in a manner that is incompatible with these purposes:
          </P>
          <List>
            <li>
              to enable you to customise or personalise your experience of our
              website
            </li>
            <li>to contact and communicate with you</li>
            <li>
              for analytics, market research, and business development,
              including to operate and improve our website, associated
              applications, and associated social media platforms
            </li>
            <li>
              to enable you to access and use our website, associated
              applications, and associated social media platforms
            </li>
            <li>for internal record keeping and administrative purposes</li>
            <li>
              for security and fraud prevention, and to ensure that our sites
              and apps are safe, secure, and used in line with our terms of use
            </li>
          </List>
          <P>
            Please be aware that we may combine information we collect about
            you with general information or research data we receive from
            other trusted sources.
          </P>
        </Subsection>

        <Subsection title="Security of Your Personal Information">
          <P>
            When we collect and process personal information, and while we
            retain this information, we will protect it within commercially
            acceptable means to prevent loss and theft, as well as
            unauthorized access, disclosure, copying, use, or modification.
          </P>
          <P>
            Although we will do our best to protect the personal information
            you provide to us, we advise that no method of electronic
            transmission or storage is 100% secure, and no one can guarantee
            absolute data security. We will comply with laws applicable to us
            in respect of any data breach.
          </P>
          <P>
            You are responsible for selecting any password and its overall
            security strength, ensuring the security of your own information
            within the bounds of our services.
          </P>
        </Subsection>

        <Subsection title="How Long We Keep Your Personal Information">
          <P>
            We keep your personal information only for as long as we need to.
            This time period may depend on what we are using your information
            for, in accordance with this privacy policy. If your personal
            information is no longer required, we will delete it or make it
            anonymous by removing all details that identify you.
          </P>
          <P>
            However, if necessary, we may retain your personal information for
            our compliance with a legal, accounting, or reporting obligation
            or for archiving purposes in the public interest, scientific, or
            historical research purposes or statistical purposes.
          </P>
        </Subsection>
      </Section>

      <Section id="childrens-privacy" title="Children’s Privacy">
        <P>
          We do not aim any of our products or services directly at children
          under the age of 13, and we do not knowingly collect personal
          information about children under 13.
        </P>
      </Section>

      <Section
        id="disclosure-to-third-parties"
        title="Disclosure of Personal Information to Third Parties"
      >
        <P>We may disclose personal information to:</P>
        <List>
          <li>a parent, subsidiary, or affiliate of our company</li>
          <li>
            third party service providers for the purpose of enabling them to
            provide their services, for example, IT service providers, data
            storage, hosting and server providers, advertisers, or analytics
            platforms
          </li>
          <li>our employees, contractors, and/or related entities</li>
          <li>our existing or potential agents or business partners</li>
          <li>
            sponsors or promoters of any competition, sweepstakes, or
            promotion we run
          </li>
          <li>
            courts, tribunals, regulatory authorities, and law enforcement
            officers, as required by law, in connection with any actual or
            prospective legal proceedings, or in order to establish, exercise,
            or defend our legal rights
          </li>
          <li>
            third parties, including agents or sub-contractors, who assist us
            in providing information, products, services, or direct marketing
            to you third parties to collect and process data
          </li>
        </List>
      </Section>

      <Section
        id="international-transfers"
        title="International Transfers of Personal Information"
      >
        <P>
          The personal information we collect is stored and/or processed where
          we or our partners, affiliates, and third-party providers maintain
          facilities. Please be aware that the locations to which we store,
          process, or transfer your personal information may not have the same
          data protection laws as the country in which you initially provided
          the information. If we transfer your personal information to third
          parties in other countries: (i) we will perform those transfers in
          accordance with the requirements of applicable law; and (ii) we will
          protect the transferred personal information in accordance with this
          privacy policy.
        </P>
      </Section>

      <Section
        id="your-rights"
        title="Your Rights and Controlling Your Personal Information"
      >
        <P>
          You always retain the right to withhold personal information from
          us, with the understanding that your experience of our website may
          be affected. We will not discriminate against you for exercising any
          of your rights over your personal information. If you do provide us
          with personal information you understand that we will collect, hold,
          use and disclose it in accordance with this privacy policy. You
          retain the right to request details of any personal information we
          hold about you.
        </P>
        <P>
          If we receive personal information about you from a third party, we
          will protect it as set out in this privacy policy. If you are a
          third party providing personal information about somebody else, you
          represent and warrant that you have such person’s consent to provide
          the personal information to us.
        </P>
        <P>
          If you have previously agreed to us using your personal information
          for direct marketing purposes, you may change your mind at any time.
          We will provide you with the ability to unsubscribe from our
          email-database or opt out of communications. Please be aware we may
          need to request specific information from you to help us confirm
          your identity.
        </P>
        <P>
          If you believe that any information we hold about you is inaccurate,
          out of date, incomplete, irrelevant, or misleading, please contact
          us using the details provided in this privacy policy. We will take
          reasonable steps to correct any information found to be inaccurate,
          incomplete, misleading, or out of date.
        </P>
        <P>
          If you believe that we have breached a relevant data protection law
          and wish to make a complaint, please contact us using the details
          below and provide us with full details of the alleged breach. We
          will promptly investigate your complaint and respond to you, in
          writing, setting out the outcome of our investigation and the steps
          we will take to deal with your complaint. You also have the right to
          contact a regulatory body or data protection authority in relation
          to your complaint.
        </P>
      </Section>

      <Section id="cookies" title="Use of Cookies">
        <P>
          We use &ldquo;cookies&rdquo; to collect information about you and
          your activity across our site. A cookie is a small piece of data
          that our website stores on your computer, and accesses each time you
          visit, so we can understand how you use our site. This helps us
          serve you content based on preferences you have specified.
        </P>
      </Section>

      <Section id="limits" title="Limits of Our Policy">
        <P>
          Our website may link to external sites that are not operated by us.
          Please be aware that we have no control over the content and
          policies of those sites, and cannot accept responsibility or
          liability for their respective privacy practices.
        </P>
      </Section>

      <Section id="changes" title="Changes to This Policy">
        <P>
          At our discretion, we may change our privacy policy to reflect
          updates to our business processes, current acceptable practices, or
          legislative or regulatory changes. If we decide to change this
          privacy policy, we will post the changes here at the same link by
          which you are accessing this privacy policy.
        </P>
        <P>
          If required by law, we will get your permission or give you the
          opportunity to opt in to or opt out of, as applicable, any new uses
          of your personal information.
        </P>
      </Section>

      <Section id="contact" title="Contact Us">
        <P>
          For any questions or concerns regarding your privacy, you may
          contact us using the following details:
        </P>
        <address className="mt-3 not-italic">
          GoList Developers
          <br />
          <a href="mailto:golist-developers@googlegroups.com" className={LINK}>
            golist-developers@googlegroups.com
          </a>
        </address>
      </Section>
    </article>
  );
}
