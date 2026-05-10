Revise the existing Christians in Politics / CiP member portal prototype.

Do not create a completely different product. Keep the core concept, but improve the design maturity, information architecture, privacy posture and user experience.

Overall design direction:
The current design relies too heavily on repeated tiles/cards and warm coloured backgrounds. Redesign it to feel more refined, calm, professional and SaaS-grade.

Use only true light mode and true dark mode backgrounds:
- Light mode background: white / near-white / very light neutral grey
- Dark mode background: deep charcoal / near-black / deep navy
- Do not use beige, gold, blue or other brand colours as full-page backgrounds
- Use CiP branding colours only for accents, CTAs, icons, active states, badges, dividers and highlights
- Keep the tone serious, trustworthy, non-partisan and privacy-first

Navigation redesign:
The current member sidebar has too many individual options. Consolidate navigation into fewer high-level areas.

Replace the long nav with:
- Home
- Profile
- Explore
- Requests
- Events
- Admin, only visible to admins
- Settings

Keep Donate as a persistent top-right button, not a full sidebar item.

Suggested grouping:
Home should contain:
- Announcements
- Upcoming events
- Recommended resources
- Current support request status
- Profile completion
- Quick actions

Explore should contain:
- Political Pathways
- Optional Party Guidance
- Resources
- Affiliated Groups

Requests should contain:
- Support requests
- Introduction requests
- Previous request history
- Request status tracking

Settings should contain:
- Account
- Privacy
- Consent
- Data export
- Account deletion
- Light/dark mode

Use a layout more like a refined Facebook / LinkedIn / modern SaaS home screen:
- Main central feed column
- Right-hand contextual rail for upcoming events, quick actions, donate CTA and profile completion
- Left nav should be simple and restrained
- Avoid making every feature a separate nav item

Sign-up flow improvements:

1. Account creation page
The current checkbox says the user agrees to Terms and Conditions, Privacy Policy and member conduct expectations, but there are no links.

Replace with:
“I agree to CiP’s Terms of Use, Privacy Policy and Member Conduct Agreement.”

Each item must be an underlined clickable link:
- Terms of Use
- Privacy Policy
- Member Conduct Agreement

Clicking each link should open a modal or side drawer with readable prototype content and a “Back to sign-up” action.

Add footer links to:
- Terms of Use
- Privacy Policy
- Member Conduct Agreement
- Contact CiP

2. Create prototype Terms of Use page/modal
Create a clean legal-style page with clear headings. This does not need to be final legal text, but it should look realistic.

Include sections:
- About Christians in Politics
- Eligibility for membership
- Requirement to affirm the Nicene Creed
- Account responsibilities
- Member conduct
- No endorsement of parties, candidates or policies
- Platform use
- No public member directory or member-to-member messaging
- Events and registrations
- Donations
- Suspension or removal of access
- Changes to the terms
- Contact

Use plain English, not heavy legalese.

3. Create prototype Privacy Policy page/modal
Create a privacy-first policy page that explains:
- What personal information CiP collects
- Why CiP collects it
- Sensitive information collected, including religious background and political involvement
- How information is used
- Who information may be shared with, only with consent where required
- How support requests and introductions work
- How event registration data is used
- How donation link/click data may be handled
- How users can access, correct, export or delete their data
- How users can withdraw consent
- How to contact CiP about privacy

Make the privacy policy visually easy to scan with section anchors, accordions or a sticky contents rail.

4. Create Member Conduct Agreement page/modal
Include:
- Christian first, politics second
- Speak with charity and respect
- No harassment, abuse, intimidation or factional campaigning
- No use of the platform for party recruitment without CiP approval
- No public debate forum
- No member-to-member contact without consent and CiP facilitation
- Respect confidentiality
- Admin moderation and account removal

Nicene Creed flow:
Keep the Nicene Creed affirmation as a hard gate.

The user cannot proceed unless they affirm the Nicene Creed.

Improve the flow:
- Show the creed in a beautifully typeset reading panel
- Add a short explanation above it
- The Continue button remains disabled until the user checks “I affirm the Nicene Creed”
- Include a secondary link: “I cannot affirm this”

If the user clicks “I cannot affirm this”, show a kind blocking screen:
Title:
“Thanks for your interest in CiP”

Body:
“CiP is a Christian network built around a shared confession of faith. Because affirmation of the Nicene Creed is required for membership, we’re unable to progress your membership application at this time. You’re still welcome to learn more about CiP through our public website and public events where appropriate.”

Buttons:
- Return to website
- Contact CiP

Denomination / Christian tradition field:
Remove all free-text denomination or church fields from onboarding.

Replace with a controlled dropdown only.

Label:
“Christian tradition or church family”

Dropdown options:
- Anglican
- Baptist
- Catholic
- Churches of Christ
- Eastern Orthodox
- Oriental Orthodox, including Coptic Orthodox
- Lutheran
- Pentecostal / Charismatic
- Presbyterian / Reformed
- Salvation Army
- Seventh-day Adventist
- Uniting Church
- Independent / Non-denominational
- Maronite Catholic
- Assyrian / Chaldean
- Other recognised Christian tradition

Do not include non-Christian religions.
Do not include a free-text denomination input.
Make this optional after the Nicene Creed affirmation, but if completed it must use the dropdown.

Home page redesign:
The current dashboard has too many separate cards.

Redesign Home as a refined feed-based layout:
- Top welcome header
- Profile completion compact progress bar
- Main feed column with CiP announcements, opportunities, new resources and upcoming event highlights
- Right rail with:
  - Next upcoming event
  - Open support request status
  - Quick actions
  - Donate CTA
  - Privacy reminder

Feed item types:
- Announcement
- Event
- Resource
- Opportunity
- Support update
- Admin message

Each feed item should look like a polished announcement block, not a tile grid.
No comments, likes or reactions.
Include only private CTAs such as:
- Register
- Express interest
- Request support
- Save resource
- Ask CiP

Political pathways redesign:
The political pathways section is strong conceptually, but it currently risks becoming another tile grid.

Redesign Political Pathways as an interactive guided journey.

Do not use a grid of tiles.

Use one of these patterns:
- A horizontal journey map
- A vertical timeline
- A step-by-step pathway builder
- A split-pane explorer
- A “choose your route” civic journey map

Suggested structure:
Page title:
“Explore your next faithful step”

Intro:
“CiP helps Christians think wisely about where they may serve. We do not endorse any party, candidate or policy.”

Create a pathway map with stages:
1. Learn
2. Discern
3. Join
4. Serve
5. Lead
6. Support others

Within each stage, show expandable rows or timeline stops, not tiles:
- Join a political party
- Find a local branch
- Volunteer on a campaign
- Explore local council
- Explore public service
- Explore staffer roles
- Explore advocacy groups
- Understand candidate selection
- Mentor or support others

When a pathway is selected, open a right-side detail panel with:
- What this pathway involves
- Time commitment
- Who it suits
- First practical step
- Risks / cautions
- How CiP can help
- CTA: Request support

Optional Party Guidance workflow:
Keep this as a voluntary workflow, not mandatory onboarding.

Entry point:
A subtle module in Explore:
“Not sure which party to join?”

The Party Guidance workflow should feel like a serious reflection tool, not a quiz game.

Use a progressive stepper:
1. About this tool
2. Issues
3. Importance
4. Vocation and temperament
5. Results
6. Save or request support

The UI should be survey-like and elegant:
- One question at a time or grouped by topic
- Progress indicator
- Clear neutral language
- Likert scale answers
- Importance weighting
- Ability to skip questions
- Save and return later

Results should not look like CiP is telling someone what party to choose.

Results page should show:
- Alignment map
- Issue clusters
- “Parties you may wish to research further”
- “Questions to pray and reflect on”
- “Next steps”
- Button: Request CiP support

Include parties:
- Liberal Party
- Australian Labor Party
- National Party
- Australian Greens
- One Nation
- Independents
- Other minor parties

Disclaimer:
“This is a reflection tool, not voting advice. CiP does not endorse any party, candidate or policy. Your results are private unless you choose to attach them to a support request.”

Profile page redesign:
The profile currently uses too many cards.

Redesign as a single profile page with:
- Left-side section index
- Main form area
- Sticky save bar
- Collapsible sections
- Completion status per section

Sections:
- Personal details
- Faith background
- Political engagement
- Support and contribution
- Privacy and consent

Use form groups and dividers rather than separate large cards for every section.

Events page redesign:
Make Events feel like a native platform feature, not a tile library.

Use:
- Calendar/list toggle
- Featured event as a hero row, not a large card
- Table/list style for events
- Filters in a compact top bar
- Event detail page with native registration form

All events are CiP events only.
No Humanitix or Eventbrite links.

Resources page redesign:
Avoid card overload.

Use a resource library layout:
- Search bar
- Left filter sidebar
- Main list view
- Compact rows with title, type, source, estimated time and save/open actions
- Featured resources can appear at top, but do not make the whole page a card grid

Affiliated Groups page redesign:
Use a curated directory table/list, not large tiles.

Approved groups only:
- Freedom for Faith
- Rebuild Australia
- Christians for Labor

Each group row should show:
- Name
- Category
- Short description
- Point of contact
- Request introduction button

Do not expose member profiles.
Introductions must go through CiP Admin.

Support Requests redesign:
Use a case-management style layout.

Member view:
- New request button
- Active request timeline
- Previous requests table/list
- Status labels:
  - Submitted
  - In review
  - Awaiting member response
  - Matched / introduced
  - Closed

Request detail:
- Timeline of updates
- Messages from CiP Admin
- Consent controls
- Attached party guidance result, optional

Admin redesign:
Keep admin screens, but make them feel like a professional operations console.

Admin nav:
- Overview
- Members
- Requests
- Events
- Content
- Data & Privacy
- Settings

Consolidate:
- Resources, announcements and affiliated groups should sit under Content
- Deletion/export/consent withdrawal should sit under Data & Privacy

Admin layout:
- Use tables, queues, split panes and drawers
- Avoid card grids except for top-level metrics
- Request queue should feel like a CRM/helpdesk pipeline
- Member records should have audit notes and consent status clearly visible

Light/dark mode:
Add a light/dark mode toggle in Settings and user menu.

Light mode:
- White / light neutral background
- Navy text
- Gold accents only

Dark mode:
- Deep navy / charcoal background
- White text
- Gold accents only
- Avoid high-saturation backgrounds

Design polish:
- Use fewer borders
- Use more whitespace
- Use subtle dividers
- Use refined typography hierarchy
- Use compact lists where appropriate
- Use tables for admin and history areas
- Use drawers for detail views
- Use accordions for long information
- Use stepper workflows for guidance and onboarding
- Reduce generic dashboard tiles by at least 50%

Member isolation:
Keep members invisible from each other:
- No member directory
- No search members
- No public profiles
- No member-to-member messaging
- No comments
- No likes
- No reactions
- No community discussion forum

Communication should be:
- CiP Admin to member
- Member to CiP Admin
- Admin-facilitated introductions only, with consent

Donation:
Keep Donate as a top-right CTA.
Donation processing will be external URL/embed capable.
Do not build a full payment processor UI yet.
Label:
“Donate”
Modal/page:
“Help grow the movement”
Button:
“Continue to donation page”

Output:
Update the prototype so it feels less like a collection of cards and more like a polished, privacy-first SaaS platform with a modern feed, grouped navigation, guided workflows, native events, controlled forms, linked legal pages and a stronger information architecture.