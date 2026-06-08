import React from 'react';
import { renderToString } from 'react-dom/server';

// We can't easily import GroupsScreen because it has JSX and imports Vite CSS, etc.
// But we can extract the EXACT list.map logic to see if it throws!

const allGroups = [
  { id: '1', name: 'Test Group', description: 'Test', visibility: 'public', created_by: '123' },
  { id: '2', name: null, description: 'Test', visibility: 'restricted', caveat_type: 'electorate', caveat_value: 'Sydney' }
];

const myProfile = null;
const myMemberships = new Set();
const tab = 'joined';
const user = { id: '123' };

try {
  const list = allGroups.map(g => {
    let allowed = true;
    let restrictionMessage = "";

    if (g.visibility === "restricted") {
      if (g.caveat_type === "electorate" && myProfile?.federal_electorate !== g.caveat_value) {
        allowed = false;
        restrictionMessage = `Must be in the ${g.caveat_value} electorate to join.`;
      } else if (g.caveat_type === "party" && myProfile?.party !== g.caveat_value) {
        allowed = false;
        restrictionMessage = `Must be affiliated with ${g.caveat_value} to join.`;
      } else if (g.caveat_type === "tradition" && myProfile?.tradition !== g.caveat_value) {
        allowed = false;
        restrictionMessage = `Must share the ${g.caveat_value} tradition to join.`;
      }
    }

    return {
      id: g.id,
      name: g.name,
      desc: g.description,
      members: 1, // Optional: You can do a count query later
      joined: myMemberships.has(g.id),
      visibility: g.visibility,
      created_by: g.created_by,
      allowed,
      restrictionMessage
    };
  }).filter(g => {
    if (tab === "joined") return g.joined;
    if (tab === "discover") return !g.joined;
    if (tab === "yours") return g.created_by === user?.id;
    return false;
  });
  
  console.log("Map successful!", list);
  
  // Test GroupCard name logic
  for (const g of list) {
    const initials = (g.name || "").split(" ").map((w) => w[0] || "").slice(0, 2).join("");
    console.log("Initials:", initials);
  }
} catch (e) {
  console.error("CRASH:", e);
}
