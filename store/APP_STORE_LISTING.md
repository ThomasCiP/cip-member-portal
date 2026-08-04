# CiP Network — App Store submission package (draft for sign-off)

Prepared 31 July 2026. Everything below is a draft for Thomas to approve before
it is entered into App Store Connect. Items marked **[YOU]** need a decision or
action only you can take.

---

## 1. App Store listing

| Field | Value |
|---|---|
| App name (30 chars max) | `CiP Network` |
| Subtitle (30 chars max) | `Christians in public life` |
| Category | Primary: Social Networking. Secondary: Lifestyle |
| Price | Free |
| Availability | Australia (add other storefronts later if wanted) |
| Support URL | `https://christiansinpolitics.com/support` (live) |
| Marketing URL | `https://christiansinpolitics.com` |
| Privacy Policy URL | `https://christiansinpolitics.com/privacy` (live, revised 31 July 2026) |
| Copyright | `© 2026 Christians in Politics Australia Ltd` |

### Promotional text (170 chars max, editable without review)

> A private, non-partisan network for Australian Christians in politics and
> public life. Connect, encourage and take your next faithful step.

### Description (draft)

> **Christian first. Politics second. Kingdom before tribe.**
>
> CiP Network is the private member network of Christians in Politics, an
> Australian, non-partisan, cross-denominational community for Christians who
> are involved in, or exploring, politics and public life.
>
> **Connect with people who understand the journey.** Find members by state,
> electorate, profession and tradition. Send connection requests, message your
> connections, and follow the organisations active in the network.
>
> **A feed without the noise.** Posts, polls, events and documents from the
> community and from groups you join. No advertising, no algorithmic outrage,
> no data sold to anyone.
>
> **Groups for your context.** State and electorate groups, party-affiliated
> groups, tradition-based groups, or start your own.
>
> **Events that matter.** Discover CiP events, register in a tap, add them to
> your calendar, and see who else is attending.
>
> **Get personal support.** Request prayer, mentoring, or guidance on your next
> step. Requests go to the CiP team, not the public feed.
>
> **Privacy first.** You control what your profile shares — down to individual
> fields — or opt out of the member directory entirely. Sensitive details such
> as tradition and political affiliation are private unless you choose to share
> them.
>
> Membership is open to those who affirm the Nicene Creed, the shared statement
> of faith across Catholic, Orthodox and Protestant Christianity. CiP does not
> endorse any political party, candidate or policy.

### Keywords (100 chars max, comma-separated, no spaces needed)

`christian,politics,faith,network,australia,church,community,prayer,parliament,civic,ministry`

(97 chars. Don't repeat "CiP" or "Network" — the app name already ranks for them.)

---

## 2. Age rating questionnaire (Apple)

Answer "None" to all violence/sexual/horror/gambling/contests items. The ones
that matter:

| Question | Answer |
|---|---|
| Unrestricted web access | No (in-app browser only opens links members post — answer No; Apple treats this as curated) |
| User-generated content | **Yes** — the app has all three required protections: content reporting, AI + human moderation with removal, and user blocking |
| Frequency of mature/suggestive themes | None |

Expected rating: **4+** (possibly 12+ if UGC pushes it; either is fine).

---

## 3. App Privacy "nutrition labels" — declare exactly this

All data is **linked to the user's identity** (it's an account-based network).
**Nothing is used for tracking** (no ads, no analytics SDKs, no data brokers —
the app talks only to CiP's own Supabase backend and Resend for email).

Collected, linked to identity, used for **App Functionality** only:

| Apple category | What it actually is |
|---|---|
| Contact Info → Name | First/last name at sign-up |
| Contact Info → Email Address | Account email |
| Contact Info → Phone Number | Optional mobile at sign-up |
| Sensitive Info | **Religious beliefs** (Christian tradition, church, Creed affirmation) and **political affiliation** (optional party, shown only if the member opts in) |
| User Content → Photos or Videos | Profile photo, post images |
| User Content → Other User Content | Posts, comments, messages, support requests, employer, bio |
| Coarse Location | State / electorate (typed by the user, not GPS — declare under User Content if preferred, but Coarse Location is the safer over-declaration) |
| Identifiers → User ID | Account UUID, push device token |

Declare **no** third-party advertising, **no** tracking across apps, **no**
data selling. "Data used to track you: None."

> Sanity check before submitting: these labels must match the privacy policy
> text. The current draft policy already describes this collection — good — but
> finalise it first (see §1).

---

## 4. App Review information

| Field | Value |
|---|---|
| Sign-in required | Yes |
| Demo account | `thomas.mynott+appreview@fireant.com.au` |
| Demo password | `CiP-Review-2026!` |
| Contact | Thomas Mynott, thomas.mynott@fireant.com.au **[YOU]** + phone number |

The demo account exists in production, is pre-onboarded (no Creed/profile steps
will block the reviewer), and 2FA is off. **Don't delete or suspend it while
review is in progress.**

### Review notes (paste into the Notes field)

> CiP Network is the private member app of Christians in Politics Australia
> Ltd, a registered charity (ABN 93 697 747 630). Membership requires
> affirming the Nicene Creed at sign-up; the demo account has already
> completed this.
>
> User-generated content protections: every post/comment can be reported
> (··· menu), reported content is reviewed by moderators and an automated
> conduct monitor and can be removed, and any member can be blocked from
> their profile (Block button) — blocking hides their content and prevents
> contact both ways. Account deletion is available in Settings → Danger Zone.
>
> The Donate button intentionally shows a "coming soon" notice — no payment
> flow exists in the app. Push notifications are optional and requested only
> after an explicit in-app action, never at launch.

---

## 5. Screenshots

Apple requires 6.9" (iPhone 16/17 Pro Max) and accepts 6.5" reuse. The repo's
`scripts/store-screenshots.mjs` already produces branded frames — regenerate
after the current UI round so shots show: feed, member profile, groups, events,
messaging, and the notifications permission card. **[YOU]** pick the 5–8 final
shots (or tell me the order you want and I'll regenerate).

---

## 6. Submission checklist (in order)

1. **[YOU]** Finalise + host the privacy policy (blocker for §1 and §3).
2. I regenerate screenshots and enter all §1–§4 content into App Store Connect.
3. Cut build 10 (`npm run release:ios`) so the reviewed build includes member
   blocking; select it for the version.
4. Submit for review. Typical first review: 1–3 days. A first-time rejection
   with a specific fix is common — we fix and resubmit, usually same-day.

---

## 7. Google Play (parallel track)

* **[YOU]** Finish the Play Console org account (CiP Google account + USD $25).
  Org accounts skip the 12-tester/14-day requirement personal accounts have.
* The signed `.aab` builds today (`npm run release:android`).
* Listing reuses §1 copy; Data Safety form mirrors §3 exactly (same categories,
  "no sharing, no selling, data encrypted in transit, deletion available").
* Content rating (IARC questionnaire): same answers as §2 → likely "Everyone"
  / PEGI 3 with UGC disclosure.
* Decide: ship Android v1 without push, or set up a free Firebase project
  first (`google-services.json`) — push is the only feature gap vs iOS.
