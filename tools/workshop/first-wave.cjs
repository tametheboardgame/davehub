'use strict';
/* First-wave PUBLIC-SAFE nominations, not approvals or deployed catalogue records.
 * The local Workshop copies these into private storage with every gate reset.
 */
const firstWave=[
  {
    "id": "unicorn-valley",
    "slug": "unicorn-valley",
    "title": "Unicorn Valley",
    "recordType": "work",
    "workType": "game",
    "lifecycle": "active",
    "views": [
      "games",
      "projects"
    ],
    "synopsis": "A colourful browser-based unicorn life-adventure with an explorable magical valley, customisation, friendships, discoveries, quests, races and activities. The main playable build is available while the wider world continues to grow.",
    "sourceUrl": "https://github.com/tametheboardgame/unicorn-valley",
    "sourceKind": "repository",
    "linkUrl": "https://unicorn-valley.pages.dev/",
    "linkLabel": "Play Unicorn Valley (main version)",
    "linkKind": "play",
    "status": "needs_review",
    "notes": "Verify main playable link, title and public-safe synopsis. No game assets copied.",
    "review": {
      "rights": false,
      "metadata": false,
      "links": false,
      "media": false
    },
    "ownerApproved": false,
    "approvedOn": ""
  },
  {
    "id": "stephen-martin-project",
    "slug": "stephen-martin-project",
    "title": "The Stephen Martin Project",
    "recordType": "work",
    "workType": "game",
    "lifecycle": "completed",
    "views": [
      "games",
      "projects"
    ],
    "synopsis": "A fictional adult-comedy browser adventure with a bizarre rescue mission, illustrated scenes, puzzles and three different playable endings. Version 1 is complete; this links to the existing main game rather than copying its artwork or recordings.",
    "sourceUrl": "https://github.com/tametheboardgame/stephen-martin-project",
    "sourceKind": "repository",
    "linkUrl": "https://stephen-martin-project.pages.dev/",
    "linkLabel": "Play the completed browser game",
    "linkKind": "play",
    "status": "needs_review",
    "notes": "Verify the live game URL and adult-comedy description; no artwork, voices, likenesses or recordings may be copied.",
    "review": {
      "rights": false,
      "metadata": false,
      "links": false,
      "media": false
    },
    "ownerApproved": false,
    "approvedOn": ""
  },
  {
    "id": "tame-the-board-game",
    "slug": "tame-the-board-game",
    "title": "Tame The Board Game",
    "recordType": "work",
    "workType": "other",
    "lifecycle": "active",
    "views": [
      "games",
      "writing",
      "memory-lane"
    ],
    "synopsis": "A collaborative board-games blog founded in 2013 with Miriam, exploring reviews, rules, strategy and stories from the tabletop. The site has a substantial archive and has continued publishing into 2026.",
    "sourceUrl": "https://tametheboardgame.com/",
    "sourceKind": "official",
    "linkUrl": "https://tametheboardgame.com/",
    "linkLabel": "Visit Tame The Board Game",
    "linkKind": "official",
    "status": "needs_review",
    "notes": "Verify co-creator Miriam's credit, About link and wording. No articles or media may be copied.",
    "review": {
      "rights": false,
      "metadata": false,
      "links": false,
      "media": false
    },
    "ownerApproved": false,
    "approvedOn": ""
  }
];
module.exports={firstWave};
