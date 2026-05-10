Change the member portal from a SaaS dashboard into a privacy-first Christian civic social platform.

The core layout should feel like a blend of LinkedIn and Facebook:
- LinkedIn-style professionalism, opportunities, events, articles and civic networking
- Facebook-style community groups, profile pages and group-based discussion
- But avoid the noisy, addictive or casual feel of mainstream social media

Home feed:
The main Home feed should be controlled by CiP Admin only.
Members cannot create posts on the main Home feed.
The Home feed should show:
- CiP announcements
- upcoming CiP events
- opportunities
- resources
- public life reflections
- support pathway prompts
- donation prompts
- admin messages

Main feed posts should support:
- headline
- category tag
- date
- body copy
- image or link preview where relevant
- CTA button such as Register, Read more, Express interest, Request support, View resource
- no public comments
- no public reactions
- no public member discussion

Profile feed:
A member’s own profile feed should not be a personal posting wall.
It should show relevant CiP announcements, events, resources and activity summaries only.
Members should not post to their personal profile feed in v1.

Groups:
Members can voluntarily join groups.
Inside groups, members can create posts and participate in discussion.
Group feeds can support:
- text posts
- image uploads
- link sharing
- comments
- reactions
- pinned posts
- group announcements
- group events
- group resources

Groups should feel like Facebook groups but more professional and values-led.
The tone should be warm, respectful and civic-minded, not casual or argumentative.

Each group should have:
- group name
- description
- visibility setting
- join/request-to-join button
- group rules
- pinned announcement
- group feed
- members tab, subject to privacy settings
- events tab
- resources tab
- admin/moderator controls

Important:
The main CiP platform is not an open discussion forum.
Discussion is only available inside opt-in groups.
Each group should have clear conduct expectations and moderation tools.

Design:
Use a three-column social platform layout:
- left column: profile summary, navigation and joined groups
- centre column: main feed or group feed
- right column: upcoming events, suggested groups, support request status, donate CTA and quick links

The design should feel more like a professional social network than a SaaS admin dashboard.
Avoid excessive dashboard tiles.
Use feeds, tabs, profile headers, group pages, post composers, event lists, side rails and contextual panels. Add a privacy-first group participation model.

When a member joins a group, they should join in “Anonymous Watch Mode” by default.

Anonymous Watch Mode:
- The member can view group posts, events, resources and pinned announcements
- The member is not visible in the group member list
- Their name, profile photo, political interests, church tradition and location are not shown
- They cannot be contacted by other members
- They receive a clear privacy notice: “You are currently watching anonymously. Other members cannot see that you are in this group.”

Inside each group, show a privacy status control near the group header:
Current status: “Watching anonymously”
CTA: “Reveal my profile to this group”

When the user clicks “Reveal my profile to this group”, open a confirmation modal.

Modal title:
“Reveal your profile to this group?”

Modal body:
“You can choose to become visible to members of this group. This will allow others in the group to see your selected profile details and interact with your posts and comments. You can change your visibility later.”

Visibility options:
- Show first name only
- Show full name
- Show profile photo
- Show state/territory
- Show short bio
- Show political party interest, optional
- Show church tradition, optional

Default selected visibility:
- First name
- Profile photo
- Short bio

Keep political party interest and church tradition off by default.

Confirmation buttons:
- “Stay anonymous”
- “Reveal my profile”

After revealing, the member can:
- post in the group
- comment
- react
- appear in the group member list
- be seen by other visible group members

Members who remain anonymous can:
- read posts
- view events
- view resources
- save resources
- request support from CiP
- choose to reveal later

Anonymous members should not be able to:
- post
- comment
- react
- appear in member lists
- message other members

Group profile visibility should be group-specific.
A member can be visible in one group and anonymous in another.

Add privacy controls to every group:
- Watching anonymously
- Visible in this group
- Hide my profile from this group
- Leave group

Add a global privacy settings page:
Section: Group visibility
Show a list of joined groups with current visibility status:
- Anonymous
- Visible
- Pending approval
- Left group

Include controls:
- Change visibility
- Hide profile
- Leave group

Design language:
Make this feel calm and reassuring, not scary.
Use subtle lock/shield icons.
Use clear plain-English privacy copy.
Avoid dark patterns.
Always make it obvious who can see what. Add LinkedIn-style connection and messaging rules inside groups.

Direct messaging should only be available between members who:
1. Belong to the same group
2. Have both chosen to reveal their identity within that group
3. Have accepted a connection request

Anonymous members cannot send or receive direct messages.

Visible group members can view other visible members in the group member list, subject to each person’s privacy settings.

Group member list:
Each visible member row/card should show only the profile details that member has chosen to reveal:
- Profile photo, optional
- First name or full name
- Short bio
- State/territory, optional
- Political party interest, optional and off by default
- Church tradition, optional and off by default
- Button: “Connect”

Connection request flow:
When a user clicks “Connect”, open a modal.

Modal title:
“Send connection request?”

Modal body:
“You can send a connection request to this member because you are both visible in this group. Direct messaging will only become available if they accept.”

Fields:
- Optional short message
- Buttons:
  - Cancel
  - Send request

Connection states:
- Connect
- Request sent
- Accept
- Decline
- Connected
- Remove connection

Messaging:
Once a connection request is accepted, unlock a private direct message thread between the two members.

Messaging UI should feel professional and restrained, closer to LinkedIn than Facebook Messenger.

Message thread should include:
- Member name and visible profile details
- Shared group context, for example: “Connected through: NSW Politics & Prayer”
- Message input
- Basic text messages
- Optional link sharing
- Report conversation
- Block member
- Remove connection

Do not include:
- group chat in v1
- read receipts in v1
- typing indicators in v1
- voice notes
- disappearing messages
- public DMs
- unsolicited messages

Privacy rules:
- Being visible in one group does not make a member visible in other groups
- Being connected to someone in one group does not automatically expose all private profile details
- Members can remove a connection at any time
- Members can block or report another member
- Members can hide their profile from a group, but existing direct connections should remain unless removed
- Members should have a global “Connections & Messages” settings page

Add a Connections page:
This page should show:
- Pending received requests
- Pending sent requests
- Accepted connections
- Message inbox
- Blocked members
- Privacy settings

Connections page layout:
Use a LinkedIn-style professional layout:
- Left column: inbox and connection filters
- Main column: message thread or connection request details
- Right rail: shared group context, safety reminder and profile summary

Safety and conduct:
Add a message at the top of the messaging area:
“CiP connections are intended for encouragement, support and faithful participation in public life. Please communicate with charity and respect.”

Admin safety controls:
Admins should be able to:
- View reports
- Suspend messaging access
- Remove users from groups
- Remove posts or comments
- Disable a group
- Review connection abuse reports

Admins should not have casual access to private messages by default, but reported conversations should be reviewable for safety and moderation purposes.

Design principle:
Messaging should feel like a trust-based professional connection system, not open social chat.