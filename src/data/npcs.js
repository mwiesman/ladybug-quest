// NPC definitions - all dialog, trades, and positions
// Source of truth for character data (see DESIGN.md and SCRIPT.md)

export const NPC_DATA = {
  fisherman: {
    x: 450, y: 255, area: 'boathouse',
    dialog: [
      "Ah, is that rope you've got there?",
      "That's just what I've been looking for..."
    ],
    dialogAfterTrade: [
      "Here's the net. Hope it helps you catch what you're looking for.",
      "Oh, and I saw a little red ladybug resting on a leaf...",
      "Near that big old oak tree back in the meadow."
    ],
    dialogDecline: [
      "Well, let me know if you change your mind about that rope."
    ],
    dialogBefore: [
      "Ah, looking for something? I've got a net...",
      "But I need rope first. Broke my line on the big one."
    ],
    dialogComplete: [
      "Hope that net helps you out.",
      "Oh, and check near that big old oak tree...",
      "I saw a little red ladybug resting on a leaf."
    ],
    needsItem: 'Leash (Rope)',
    givesItem: 'Net',
    completed: false,
    congratsSaid: false,
    dialogPostProposal: [
      "Heard the news on the breeze!",
      "That's a fine catch, you two. Congratulations."
    ]
  },
  dog: {
    x: 350, y: 350, area: 'park',
    dialog: [
      "*Woof!* Hey there!",
      "Is that... my BALL?!"
    ],
    dialogAfterTrade: [
      "*Happy bark!* Here, take my leash!",
      "I'm a good dog! *tail wagging intensifies*"
    ],
    dialogDecline: [
      "*whimpers* But I really want that ball..."
    ],
    dialogBefore: [
      "*Woof woof!* *tail wagging*",
      "*sniffs you* I've got this leash but...",
      "I'm so bored without my ball!"
    ],
    dialogComplete: [
      "*Happy bark!* My ball! *tail wagging intensifies*"
    ],
    needsItem: 'Ball',
    givesItem: 'Leash (Rope)',
    completed: false,
    congratsSaid: false,
    dialogPostProposal: [
      "*EXCITED BARKING* CONGRATS! CONGRATS!",
      "*runs in circles* *tail wagging intensifies*"
    ]
  },
  kid: {
    x: 200, y: 300, area: 'playground',
    dialog: [
      "*runs up* Hi! Hi!",
      "Wow, that flower is so pretty!"
    ],
    dialogAfterTrade: [
      "Thank you! Here, I found this heavy thing earlier!",
      "*runs off giggling*"
    ],
    dialogDecline: [
      "Aww... but I have this heavy thing I don't even want!"
    ],
    dialogBefore: [
      "*running around* Wheeee!",
      "Are you looking for something? I like flowers!"
    ],
    dialogComplete: [
      "*smelling the flower* Wheee!",
      "This is the best day ever!"
    ],
    needsItem: 'Flower',
    givesItem: 'Axe',
    completed: false,
    congratsSaid: false,
    dialogPostProposal: [
      "WAIT — you're getting MARRIED?!",
      "That's the BEST news EVER!",
      "*spins in a circle*"
    ]
  },
  hippie: {
    x: 150, y: 200, area: 'park',
    dialog: [
      "*sketching clouds* Oh hey.",
      "Is that gum? I could really use some..."
    ],
    dialogAfterTrade: [
      "Take this flower. It wants to travel with you.",
      "Peace."
    ],
    dialogDecline: [
      "No gum? Bummer, man."
    ],
    dialogBefore: [
      "*sketching peacefully*",
      "Beautiful day. Perfect for existing.",
      "You seem like you're on a mission though."
    ],
    dialogComplete: [
      "*still sketching*",
      "The flower found its way. Cool."
    ],
    needsItem: 'Gum',
    givesItem: 'Flower',
    completed: false,
    congratsSaid: false,
    dialogPostProposal: [
      "*sketches a heart in the clouds*",
      "Two souls, one path. Beautiful, man.",
      "Congrats."
    ]
  },
  squirrel: {
    x: 360, y: 300, area: 'gate_area',
    dialog: [
      "*CHITTER!* The gate's open!",
      "*scurries to acorn pile*",
      "*rummaging through leaves*",
      "Look what I found in here — a ball!",
      "No use to me! Here, take it!"
    ],
    dialogAfterTrade: [
      "*happy chittering*"
    ],
    dialogBefore: [
      "*desperate chittering near the gate*",
      "*points at acorns on the other side*",
      "Please! I need my acorns!"
    ],
    dialogComplete: [
      "*munching happily on acorns*",
      "*happy chittering sounds*"
    ],
    needsItem: 'Gate Unlocked',
    givesItem: 'Ball',
    completed: false,
    behindGate: true,
    congratsSaid: false,
    dialogPostProposal: [
      "*joyful chittering*",
      "Acorns AND a wedding?! What a day!",
      "Congrats!"
    ]
  },
  bird: {
    x: 200, y: 120, area: 'gate_area',
    flies: true,
    dialog: [
      "*chirp chirp*",
      "*eyes the birdseed in your hand*"
    ],
    dialogAfterTrade: [
      "A key for some seeds? Deal!",
      "*hops happily*",
      "Sometimes you must unlock what holds others back.",
      "*winks*"
    ],
    dialogDecline: [
      "*sad chirp* But I have a shiny key for you..."
    ],
    dialogBefore: [
      "*Chirp chirp!* *hops around*",
      "*eyes the birdseed hopefully*"
    ],
    dialogComplete: [
      "*content chirping*",
      "*pecking at seeds happily*"
    ],
    needsItem: 'Birdseed',
    givesItem: 'Key',
    completed: false,
    congratsSaid: false,
    dialogPostProposal: [
      "*celebratory chirp chirp*",
      "Two souls building one nest...",
      "Sweetest song there is. Congrats."
    ]
  },
  coffeeCart: {
    x: 100, y: 100, area: 'park',
    dialog: [
      "Morning! One coffee coming up.",
      "Perfect day for the park.",
      "*hands you a warm cup*",
      "Oh — check the bird feeder next to me.",
      "Someone left fresh seeds there!"
    ],
    dialogComplete: [
      "Enjoy the coffee!",
      "Come back anytime."
    ],
    givesItem: 'Coffee',
    completed: false,
    isVendor: true,
    congratsSaid: false,
    dialogPostProposal: [
      "Word travels fast in the park!",
      "Coffee's on the house — congratulations!"
    ]
  },
  parent: {
    x: 250, y: 320, area: 'playground',
    dialog: [
      "*watching their kid*",
      "Beautiful day, isn't it?",
      "Hi!! Are you new here?!",
      "Ha, sorry — they get excited about everything."
    ],
    lineSpeakers: [null, null, 'kid', null],
    dialogComplete: [
      "*still watching their kid*",
      "Kids have so much energy!"
    ],
    congratsSaid: false,
    dialogPostProposal: [
      "Oh my — congratulations to you both!",
      "What a wonderful thing."
    ]
  }
};
