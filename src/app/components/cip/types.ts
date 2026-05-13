export type Screen =
  // Public flow
  | "signup"
  | "signin"
  | "account"
  | "creed"
  | "blocked"
  | "welcome"
  | "deleted-account"
  // Member area (social platform)
  | "dashboard"        // admin-controlled home feed
  | "profile"          // own profile (editable)
  | "network"          // accepted connections directory
  | "groups"           // discover/joined groups
  | "group-detail"     // single group page
  | "events"           // events list
  | "event-detail"
  | "messages"         // direct messaging hub
  | "support"          // CiP-led support pathways
  | "donate"
  | "settings"
  | "privacy"
  // Admin
  | "admin-overview"
  | "admin-members"
  | "admin-support"
  | "admin-support-detail"
  | "admin-events"
  | "admin-content"
  | "admin-resources"
  | "admin-announcements"
  | "admin-affiliated"
  | "admin-donations"
  | "admin-privacy";
