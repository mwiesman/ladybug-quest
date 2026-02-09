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
    x: 350, y: 350, area: 'park',
    dialog: [
      "*Woof!* Hey there!",
      "I could help you with that rope situation...",
      "But I lost my ball somewhere! *whimpers*"
    ],
    dialogBefore: [
      "*Woof woof!* *tail wagging*",
      "*sniffs you* I've got this leash but...",
      "I'm so bored without my ball!"
    ],
    dialogComplete: [
      "*Happy bark!* My ball! Here, take my leash!",
      "I'm a good dog! *tail wagging intensifies*"
    ],
    needsItem: 'Ball',
    givesItem: 'Rope',
    completed: false
  },
  kid: {
    x: 200, y: 300, area: 'playground',
    dialog: [
      "*runs up* Hi! Hi!",
      "Wow, that's so pretty! For me?!",
      "Thank you! Here, I found this heavy thing earlier!",
      "*runs off giggling*"
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
    dialogComplete: [
      "*still sketching*",
      "The flower found its way. Cool."
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
      "Here! I found this ball in my stash!",
      "No use to me! *shows teeth proudly*"
    ],
    dialogBefore: [
      "*desperate chittering behind gate*",
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
    dialogComplete: [
      "*content chirping*",
      "*pecking at seeds happily*"
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
    dialogComplete: [
      "Enjoy the coffee!",
      "Come back anytime."
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
    dialogComplete: [
      "*still watching their kid*",
      "Kids have so much energy!"
    ]
  }
};
