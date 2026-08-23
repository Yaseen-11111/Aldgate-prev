# Secure admin portal with Cloudflare Access (free)

The public website stays at `pureshadeblinds.co.uk`. The admin portal runs at
`admin.pureshadeblinds.co.uk/admin` and is protected by Cloudflare Access before
the Worker receives a request. Staff sign in with a one-time code sent to their
approved email address. There is no website admin password to store, reset, or leak.

## One-time Cloudflare setup

1. In the Cloudflare dashboard, open **Workers & Pages** > **aldergate** >
   **Settings** > **Domains & Routes**, then add the custom domain
   `admin.pureshadeblinds.co.uk`.
2. Open **Zero Trust** > **Access** > **Applications** > **Add an application**
   > **Self-hosted**. Set the application domain to `admin.pureshadeblinds.co.uk`
   and path to `/*`. Do not protect the public hostname.
3. Add an **Allow** policy. Include only the individual staff email addresses
   (or a domain you completely control), and require **One-time PIN** as the
   login method. Never use **Everyone** or an unrestricted One-time PIN rule.
4. In that Access application, copy the **Audience (AUD) tag**. In Zero Trust,
   note your team domain, such as `your-team.cloudflareaccess.com`.
5. In **Workers & Pages** > **aldergate** > **Settings** > **Variables and
   Secrets**, add these production variables:

   ```text
   CF_ACCESS_TEAM_DOMAIN=your-team.cloudflareaccess.com
   CF_ACCESS_AUD=the-AUD-tag-copied-from-the-Access-application
   ```

   These are identifiers, not passwords. Do not add the former
   `ADMIN_PASSWORD` or `SESSION_SECRET` variables.
6. Deploy the Worker, then open `https://admin.pureshadeblinds.co.uk/admin` in
   a private browser window. Cloudflare should request an approved email, send
   a one-time code, and only then show the portal.

## Admin users and passwords

Cloudflare Access is the admin account manager. Add or remove staff email
addresses in the application policy above. The portal shows the currently
authenticated email address; other admin access is managed in Zero Trust so
the website never receives a list of staff identities or password data.

Because access uses email one-time codes, there is deliberately no password
change screen. A lost device or staff departure is handled by removing that
email from the Access policy, which immediately prevents new sessions.

## Security controls in this codebase

- Every privileged API operation verifies the `Cf-Access-Jwt-Assertion` using
  Cloudflare's public signing keys, expected issuer, expiration, and AUD tag.
- Public catalogue, gallery, and quotation submission endpoints remain public.
- The API does not issue its own admin tokens and does not use browser storage
  for credentials.
- The API no longer sends wildcard CORS headers; the admin calls are same-origin.

## Recommended free Cloudflare settings

- Add a WAF rate-limiting rule for `admin.pureshadeblinds.co.uk/*` to slow
  repeated requests. Keep the Access policy as the primary gate.
- Enable Cloudflare Web Analytics for anonymous visitor counts rather than
  collecting named visitor accounts.
- Add Turnstile to the public quotation form before accepting high volumes of
  submissions. Validate every Turnstile token on the Worker.

