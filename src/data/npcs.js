// NPC definitions - all dialog, trades, and positions
// Source of truth for character data (see DESIGN.md and SCRIPT.md)

export const NPC_DATA = {
  fisherman: {
    x: 550, y: 150, area: 'boathouse',
    dialog: [
      "Ah, looking for something? I've got a net...",
      "But I need rope first. Broke my line on the big one."
    ],
    dialogComplete: [
      "Here's the net. Hope it helps you catch what you're looking for.",
      "Oh, and I saw a little red ladybug resting on a leaf...",
      "Near that big old oak tree back in the meadow."
    ],
    needsItem: 'Rope',
    givesItem: 'Net',
    completed: false
  },
  dog: {
    x: 400, y: 250, area: 'woods',
    dialog: [
      "*Woof!* Hey there!",
      "I could help you with that rope situation...",
      "But I really miss having a toy! *whimpers*"
    ],
    dialogBefore: [
      "*Woof woof!* *tail wagging*",
      "*sniffs you* I've got this leash but...",
      "I'm so bored without my toy!"
    ],
    dialogComplete: [
      "*Happy bark!* Thanks! Here, take my leash!",
      "I'm a good dog! *tail wagging intensifies*"
    ],
    needsItem: 'Dog Toy',
    givesItem: 'Rope',
    completed: false
  },
  kid: {
    x: 200, y: 300, area: 'playground',
    dialog: [
      "*runs up* Hi! Hi!",
      "Wow, that's so pretty! For me?!",
      "Thank you! Here, I found this earlier!",
      "*runs off giggling*"
    ],
    dialogBefore: [
      "*running around* Wheeee!",
      "Are you looking for something? I like flowers!"
    ],
    needsItem: 'Flower',
    givesItem: 'Dog Toy',
    completed: false
  },
  hippie: {
    x: 150, y: 200, area: 'park',
    dialog: [
      "*sketching clouds* Oh hey.",
      "Gum? Lifesaver. Been here for hours.",
      "Take this flower. It wants to travel with you.",
      "Peace."
    ],
    dialogBefore: [
      "*sketching peacefully*",
      "Beautiful day. Perfect for existing.",
      "You seem like you're on a mission though."
    ],
    needsItem: 'Gum',
    givesItem: 'Flower',
    completed: false
  },
  squirrel: {
    x: 320, y: 180, area: 'gate_area',
    dialog: [
      "*CHITTER!* Oh thank goodness!",
      "My acorns! I can finally get to them!",
      "*happy dance*",
      "Here! Take this heavy thing.",
      "I've got teeth! *shows teeth proudly*"
    ],
    dialogBefore: [
      "*desperate chittering behind gate*",
      "*points at acorns on the other side*",
      "Please! I need my acorns!"
    ],
    needsItem: 'Gate Unlocked',
    givesItem: 'Axe',
    completed: false,
    behindGate: true
  },
  bird: {
    x: 280, y: 140, area: 'gate_area',
    dialog: [
      "*chirp chirp* Seeds! My favorite!",
      "A key for some seeds? I know where one is...",
      "*hops happily*",
      "Sometimes you must unlock what holds others back.",
      "*winks*"
    ],
    dialogBefore: [
      "*Chirp chirp!* *hops around*",
      "*eyes the birdseed hopefully*"
    ],
    needsItem: 'Birdseed',
    givesItem: 'Key',
    completed: false
  },
  coffeeCart: {
    x: 100, y: 100, area: 'park',
    dialog: [
      "Morning! One coffee coming up.",
      "Perfect day for the park.",
      "*hands you a warm cup*"
    ],
    givesItem: 'Coffee',
    completed: false,
    isVendor: true
  },
  parent: {
    x: 250, y: 320, area: 'playground',
    dialog: [
      "*watching their kid*",
      "Beautiful day, isn't it?"
    ],
    dialogAfterToy: [
      "*looking around* Where'd that toy go?",
      "Kids... *shrugs*"
    ]
  }
};
