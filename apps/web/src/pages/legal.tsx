import { Link } from "wouter";

export default function Legal() {
  return (
    <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <p className="text-sm uppercase tracking-widest text-accent">
        Pure Shade Blinds
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl">Terms of use &amp; privacy</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated: 10 November 2026
      </p>
      <div className="prose prose-neutral mt-10 max-w-none prose-headings:font-serif prose-a:text-accent">
        <h2>Using this website</h2>
        <p>
          This website provides information about made-to-measure blinds and
          shutters, lets you save a shortlist, and lets you request a home
          consultation. The website and consultation request are provided
          without charge. Submitting a request is not an order and does not
          create a contract to buy products or services.
        </p>
        <p>
          Product photographs, fabrics, colours, and descriptions are for
          guidance. Appearance can vary between screens and physical materials.
          Availability, measurements, specification, fitting arrangements, and
          any price will be discussed with you before you decide whether to
          place an order.
        </p>
        <p>
          Please provide accurate contact details and use the website lawfully.
          We may update or withdraw website content and cannot guarantee
          uninterrupted availability. These terms do not affect rights that
          cannot legally be excluded under UK law.
        </p>

        <h2>Consultation requests</h2>
        <p>
          When you submit a consultation request, we use the details you provide
          to review the request, check the preferred appointment window, contact
          you, and arrange a consultation. A preferred appointment is a request
          and is not confirmed until we contact you. Please do not include
          sensitive personal information in the optional message.
        </p>

        <h2>Privacy notice</h2>
        <h3>Information we collect</h3>
        <p>
          For a consultation request, we collect your name, phone number, email
          address, postcode, preferred date and time, optional message, and
          selected products. We also process a security token through Cloudflare
          Turnstile to help prevent automated abuse. A shortlist is stored in
          your browser. Website hosting and security services may process
          technical request data such as IP address, browser details, and access
          logs.
        </p>
        <h3>How we use and share it</h3>
        <p>
          We use booking information to respond to you and manage the requested
          consultation. It is stored in our Cloudflare-hosted database and may
          be sent to our configured email provider for business notification.
          Cloudflare provides hosting, storage, access security, and Turnstile
          verification. We do not sell consultation data or use it for unrelated
          marketing through this website.
        </p>
        <h3>Retention and your rights</h3>
        <p>
          We keep information only for as long as needed to manage the request,
          maintain business records, and meet legal obligations. The precise
          retention period depends on those needs. Depending on your
          circumstances, UK data protection law gives you rights to access,
          correct, erase, restrict, or object to processing, and to{" "}
          <a href="https://ico.org.uk/make-a-complaint/">
            complain to the Information Commissioner’s Office
          </a>
          . To make a privacy request or ask a question, contact us using the
          details on our <Link href="/quote">consultation page</Link>.
        </p>
        <h3>Cookies and local storage</h3>
        <p>
          The shortlist feature uses browser local storage so your selected
          products remain available on your device. The booking form uses
          Cloudflare Turnstile for security. Cloudflare says Turnstile processes
          data needed for this security function and does not access form
          entries; read the{" "}
          <a
            href="https://www.cloudflare.com/turnstile-privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Turnstile privacy policy
          </a>
          . Cloudflare may use additional security storage depending on
          configuration. This site does not currently provide a separate
          analytics or advertising cookie feature.
        </p>
        <h3>Changes and contact</h3>
        <p>
          We may revise this notice when the website or our data practices
          change. The date above shows the latest revision. For questions, use
          the contact options shown on this website.
        </p>
      </div>
    </article>
  );
}
