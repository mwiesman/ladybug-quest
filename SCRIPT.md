# The Ladybug Quest - Complete Script
**All Dialog, Cutscenes, and Story Beats**

---

## Table of Contents
1. [Opening Cutscene](#opening-cutscene)
2. [Intro Animation & Boy's Dialog](#intro-animation--boys-dialog)
3. [NPC Dialog by Character](#npc-dialog-by-character)
4. [System Messages](#system-messages)
5. [Ending Cutscene](#ending-cutscene)
6. [Credits](#credits)
7. [Dialog Flow Reference](#dialog-flow-reference)

---

## Opening Cutscene

**Trigger:** Game start
**Skippable:** Yes (SPACE key)
**Duration:** ~24 seconds (auto-advances)

### Beat 1 (3 seconds)
```
"Under the old oak tree..."
```
**Visual:** Establishing shot - oak tree, boy and girl lying on grass

### Beat 2 (3 seconds)
```
"Two friends lay on soft grass,
watching clouds drift by."
```
**Visual:** Same scene, peaceful

### Beat 3 (3 seconds)
```
"Both wore masks,
as the world had taught them to."
```
**Visual:** Close enough to see masks on their faces

### Beat 4 (4 seconds)
```
"A tiny ladybug landed
gently on his hand."
```
**Visual:** Ladybug sprite appears on boy's hand

### Beat 5 (3 seconds)
```
"She reached out,
wanting to share the moment..."
```
**Visual:** Implication of movement toward his hand

### Beat 6 (4 seconds)
```
"But as their hands touched,
the ladybug took flight."
```
**Visual:** Ladybug sprite disappears

### Beat 7 (3 seconds)
```
"It disappeared into the sky."
```
**Visual:** Empty scene, ladybug gone

### Beat 8 (3 seconds)
```
"She stood up,
determined to find it again."
```
**Visual:** Girl begins to stand (transition to animation)

---

## Intro Animation & Boy's Dialog

**Trigger:** After opening cutscene completes
**Duration:** ~3-4 seconds
**Skippable:** No (automatic transition)

### Animation Phase
- Girl sprite stands up from lying position
- Boy remains seated under tree
- Camera follows girl
- ~60 frames of standing animation

### Boy's Dialog (appears as dialog box)
**When:** Animation frame 60

#### Line 1
```
"Wait, where are you—"
```
**Tone:** Surprised, caught off-guard
**Delivery:** Quick, interrupted thought

#### Line 2
```
"Good luck out there!"
```
**Tone:** Supportive, trusting, slightly playful
**Delivery:** Calls after her

**Player Action:** Press SPACE to continue (transitions to gameplay)

---

## NPC Dialog by Character

### Format Notes:
- **dialogBefore:** Shown when player doesn't have required item
- **dialog:** Shown when player has required item (neutral recognition, before trade prompt)
- **Trade Prompt:** Appears after dialog lines end — `[SPACE] Yes  [ESC] No`
- **dialogAfterTrade:** Shown after player accepts trade
- **dialogDecline:** Shown if player presses ESC to decline
- **dialogComplete:** Shown on all subsequent interactions after trade is done
- **All dialog:** Press SPACE to advance through lines

---

### Coffee Cart Vendor

**Location:** Park (x: 100, y: 100)
**Trade:** None (vendor — gives coffee for free after dialog)
**Completed After:** Player takes coffee

#### Dialog
```
Line 1: "Morning! One coffee coming up."
Line 2: "Perfect day for the park."
Line 3: "*hands you a warm cup*"
Line 4: "Oh — check the bird feeder next to me."
Line 5: "Someone left fresh seeds there!"
```
**Tone:** Professional but friendly, helpful — hints at birdseed location
**Action:** Trade prompt after dialog, gives Coffee

#### After Dialog (Complete)
```
Line 1: "Enjoy the coffee!"
Line 2: "Come back anytime."
```

---

### Hippie

**Location:** Park (x: 150, y: 200) - Sitting cross-legged
**Trade:** Gum → Flower

#### dialogBefore (No Gum)
```
Line 1: "*sketching peacefully*"
Line 2: "Beautiful day. Perfect for existing."
Line 3: "You seem like you're on a mission though."
```
**Tone:** Chill, observant, present-focused

#### dialog (Has Gum)
```
Line 1: "*sketching clouds* Oh hey."
Line 2: "Is that gum? I could really use some..."
```
**Tone:** Neutral recognition — trade prompt appears after these lines
**Action:** `*Give hippie the Gum?* [SPACE] Yes  [ESC] No`

#### dialogAfterTrade
```
Line 1: "Take this flower. It wants to travel with you."
Line 2: "Peace."
```

#### dialogDecline
```
"No gum? Bummer, man."
```

#### dialogComplete
```
Line 1: "*still sketching*"
Line 2: "The flower found its way. Cool."
```

---

### Bird

**Location:** Gate Area (x: 200, y: 120) - Flies back and forth (sine wave, stops when interacted with)
**Trade:** Birdseed → Key

#### dialogBefore (No Birdseed)
```
Line 1: "*Chirp chirp!* *hops around*"
Line 2: "*eyes the birdseed hopefully*"
```

#### dialog (Has Birdseed)
```
Line 1: "*chirp chirp*"
Line 2: "*eyes the birdseed in your hand*"
```
**Action:** Trade prompt appears after these lines

#### dialogAfterTrade
```
Line 1: "A key for some seeds? Deal!"
Line 2: "*hops happily*"
Line 3: "Sometimes you must unlock what holds others back."
Line 4: "*winks*"
```
**Philosophy:** Most overtly philosophical NPC

#### dialogDecline
```
"*sad chirp* But I have a shiny key for you..."
```

#### dialogComplete
```
Line 1: "*content chirping*"
Line 2: "*pecking at seeds happily*"
```

---

### Squirrel

**Location:** Gate Area (x: 340, y: 200) - Near gate, runs inside when unlocked
**Trade:** Gate Unlocked → Ball
**Special:** Position changes when gate unlocked (runs through gate to leaf pile at 500, 140)

#### dialogBefore (Gate Locked)
```
Line 1: "*desperate chittering near the gate*"
Line 2: "*points at acorns on the other side*"
Line 3: "Please! I need my acorns!"
```
**Tone:** Frantic, desperate, single-minded

#### dialog (Gate Unlocked)
```
Line 1: "*CHITTER!* The gate's open!"
Line 2: "*scurries to acorn pile*"
Line 3: "*rummaging through leaves*"
Line 4: "Look what I found in here — a ball!"
Line 5: "No use to me! Here, take it!"
```
**Tone:** Overjoyed, grateful — finds a ball while rummaging
**Action:** Trade prompt after dialog, gives Ball

#### dialogAfterTrade
```
"*happy chittering*"
```

#### dialogComplete
```
Line 1: "*munching happily on acorns*"
Line 2: "*happy chittering sounds*"
```

**Animation:** When gate unlocks, squirrel runs through gate opening via 3-leg waypoint path (approach gate → pass through → leaf pile). Stays at inside position permanently.

---

### Dog

**Location:** Park (x: 350, y: 350)
**Trade:** Ball → Leash (Rope)

#### dialogBefore (No Ball)
```
Line 1: "*Woof woof!* *tail wagging*"
Line 2: "*sniffs you* I've got this leash but..."
Line 3: "I'm so bored without my ball!"
```
**Tone:** Friendly but bored, hopeful

#### dialog (Has Ball)
```
Line 1: "*Woof!* Hey there!"
Line 2: "Is that... my BALL?!"
```
**Tone:** Excited recognition
**Action:** Trade prompt appears after these lines

#### dialogAfterTrade
```
Line 1: "*Happy bark!* Here, take my leash!"
Line 2: "I'm a good dog! *tail wagging intensifies*"
```
**Wisdom:** "What binds us can also free others" — leash becomes rope

#### dialogDecline
```
"*whimpers* But I really want that ball..."
```

#### dialogComplete
```
"*Happy bark!* My ball! *tail wagging intensifies*"
```

---

### Kid

**Location:** Playground (x: 200, y: 300) - Running around
**Trade:** Flower → Axe
**Special:** Runs over to parent when parent is talked to (interrupts parent dialog on line 3)

#### dialogBefore (No Flower)
```
Line 1: "*running around* Wheeee!"
Line 2: "Are you looking for something? I like flowers!"
```

#### dialog (Has Flower)
```
Line 1: "*runs up* Hi! Hi!"
Line 2: "Wow, that flower is so pretty!"
```
**Tone:** Excited recognition
**Action:** Trade prompt appears after these lines

#### dialogAfterTrade
```
Line 1: "Thank you! Here, I found this heavy thing earlier!"
Line 2: "*runs off giggling*"
```
**Action:** Gives Axe

#### dialogDecline
```
"Aww... but I have this heavy thing I don't even want!"
```

#### dialogComplete
```
Line 1: "*smelling the flower* Wheee!"
Line 2: "This is the best day ever!"
```

---

### Parent

**Location:** Playground (x: 250, y: 320) - Watching kid
**Trade:** None (observational character)
**Special:** Kid runs over on dialog line 3 (interrupts conversation)

#### dialog
```
Line 1: "*watching their kid*"
Line 2: "Beautiful day, isn't it?"
Line 3: "*the kid runs over* Hi!! Are you new here?!"
Line 4: "Ha, sorry — they get excited about everything."
```
**Tone:** Relaxed, content — kid interrupts the conversation

#### dialogComplete
```
Line 1: "*still watching their kid*"
Line 2: "Kids have so much energy!"
```

---

### Fisherman

**Location:** Boathouse (x: 550, y: 150) - By the water with fishing rod
**Trade:** Leash (Rope) → Net
**Final NPC:** This completes the main quest chain

#### dialogBefore (No Leash/Rope)
```
Line 1: "Ah, looking for something? I've got a net..."
Line 2: "But I need rope first. Broke my line on the big one."
```
**Tone:** Gruff but helpful, experienced
**Metaphor:** "The big one" foreshadows the ending theme

#### dialog (Has Leash/Rope)
```
Line 1: "Ah, is that rope you've got there?"
Line 2: "That's just what I've been looking for..."
```
**Action:** Trade prompt appears after these lines

#### dialogAfterTrade
```
Line 1: "Here's the net. Hope it helps you catch what you're looking for."
Line 2: "Oh, and I saw a little red ladybug resting on a leaf..."
Line 3: "Near that big old oak tree back in the meadow."
```
**Irony:** The net won't work — but he doesn't know that
**Hint:** Directs player back to meadow where ladybug appears

#### dialogDecline
```
"Well, let me know if you change your mind about that rope."
```

#### dialogComplete
```
Line 1: "Hope that net helps you out."
Line 2: "Oh, and check near that big old oak tree..."
Line 3: "I saw a little red ladybug resting on a leaf."
```

---

## System Messages

### Inventory Management
**When item received (pickup or trade):**
```
"Received: [Item Name]"
```
Gold text notification appears at top of screen for ~2 seconds. Also updates inventory sidebar.

### Object Interactions

#### Birdseed (Found Item)
**Trigger:** Walk near bird feeder in park (proximity-based, no SPACE needed)
**Message:** "Received: Birdseed" notification appears

#### Gold Doubloons (Secret Item)
**Trigger:** Walk near leaf pile in woods (proximity-based)
**Message:** "Received: Gold Doubloons" notification appears
**Note:** NPCs have no dialog for this item - it's genuinely useless

#### Gate (Using Key)
**Trigger:** Walk near gate with Key in inventory, press SPACE
**Message:** 
```
[Visual only: Gate opens, Key removed from inventory]
```
No dialog - immediate visual feedback

#### Logs (Using Axe)
**Trigger:** Walk near logs in gate_area, press SPACE
**With Axe:** Logs cleared, Axe removed from inventory (visual + SFX)
**Without Axe:**
```
"*Looks like you'll need more than just your arms to get past these logs.*"
```

### Navigation Hints
**When near screen edge with exit:**
```
[Visual only: Arrow + "Park" / "Woods" / etc.]
```
No dialog - just visual indicator

### Interaction Prompts
**When near interactable object/NPC:**
```
"Press SPACE"
```
**Visual:** White text in black box at top of screen

---

## Ending Sequence (Animated)

**Trigger:** Player approaches ladybug near oak tree with Net in inventory
**Two-stage:** First approach shows prompt dialog, second SPACE press starts animation
**Duration:** ~15 seconds of animation + dialog pauses + fade to black
**Not skippable** (plays as in-game animation, not text cutscene)

### Prompt (before animation starts)
```
"*You spot the ladybug resting on a leaf...*"
"*Press [SPACE] to try to catch it!*"
```

### Phase 1: The Attempt (frames 0-90)
**Visual:** Ladybug rests on leaf near oak tree. Girl nearby. Boy under tree at (280, 200).
- Frames 0-50: Ladybug on leaf, girl standing still
- Frames 50-90: Girl swings net — ladybug flies up and to the right

### Phase 2: The Miss (frame 90)
```
"*Misses!*"
```
**Action:** Animation freezes. Player presses SPACE to continue.

### Phase 3: The Hover (frames 90-160)
**Visual:** Ladybug hovers in the air, drifting gently on a sine wave
**Feeling:** Suspended moment, uncertainty

### Phase 4: The Return (frames 160-200)
**Visual:** Ladybug gently descends and lands on the boy's hand (285, 195)
**Payoff:** Returns to where it all began — cyclical

### Phase 5: The Landing (frame 200)
```
"*The ladybug lands gently on his hand...*"
```
**Action:** Animation freezes. Player presses SPACE to continue.

### Phase 6: Boy's Line (frame 220)
```
"Ain't that just the way."
```
**Tone:** Knowing, accepting, bittersweet
**Action:** Animation freezes. Player presses SPACE to continue.

### Phase 7: Fade to Black (frames 250+)
**Visual:** Screen gradually fades to black over ~50 frames
**Transition:** Credits appear after full fade

---

## Credits

**Trigger:** After ending cutscene completes
**Skippable:** No (but can restart with R key)

### Display
```
The Ladybug Quest

A story of infinite beginnings

[larger gap]

for Adielle

[larger gap]

Press R to restart
```

**Visual:** Center-aligned, fading in after fade-to-black
**Music:** Stops (silence during credits)
**Implication:** Loop continues — she'd do it all again. The ladybug landing on the boy's hand mirrors the opening.

---

## Dialog Flow Reference

### Quest Chain Dialog Sequence

When player follows the main path, dialog flows:

1. **Coffee Cart** → Get Coffee (hints at bird feeder with birdseed)
2. **Birdseed** → Pick up from bird feeder (no dialog, "Received: Birdseed" notification)
3. **Bird** → Trade Birdseed for Key
4. **Gate** → Unlock with Key (squirrel runs through gate opening)
5. **Squirrel** → Get Ball (found while rummaging in leaves)
6. **Dog** → Trade Ball for Leash (Rope)
7. **Fisherman** → Trade Leash (Rope) for Net (hints at ladybug location)
8. **Ladybug** → Approach with Net → Ending animation

Side chain (can be done anytime):
1. **Hippie** → Trade Gum for Flower
2. **Kid** → Trade Flower for Axe
3. **Logs** → Clear with Axe → Opens path to Woods

Other interactions:
- **Parent** → Kid runs over and interrupts dialog on line 3
- **Camperdown Elm** → Read plaque at boathouse
- **Logs** → "Need more than just your arms" message without Axe

### Discovery-Based Dialog

Players can talk to NPCs before having required items:

- **All trading NPCs** have `dialogBefore` that hints at what they need
- **Dialog preview** system lets players explore and learn the quest web
- **No dead ends** - all conversations are useful, either for trade or hints
- **Trade flow:** dialog (neutral) → trade prompt → dialogAfterTrade (accept) or dialogDecline (ESC)

### Dialog Statistics

- **Total NPCs:** 8 (9 including Boy)
- **Total Dialog Lines:** ~85
- **Average NPC Interaction:** 3-5 lines
- **Longest Dialog:** Squirrel (5 lines in main sequence)
- **Shortest Dialog:** Coffee Cart (3 lines total)

### Tone Consistency Notes

**Avoid:**
- Excessive exclamation points (except Kid)
- Overly formal language
- Info-dumping or tutorials
- Breaking character

**Maintain:**
- Each NPC's unique voice
- Natural, conversational flow
- Subtext over exposition
- Character through action descriptions (*wags tail*, *sketching*)

### Dialog Timing (Future Enhancement)

**Suggested character text speed:**
- **Kid:** Fast (matches energy)
- **Hippie:** Slow (matches zen nature)
- **Dog:** Medium-fast (enthusiasm)
- **Bird:** Medium (thoughtful)
- **Squirrel:** Very fast when desperate, normal after
- **Fisherman:** Slow (gruff, weathered)
- **Parent:** Medium (conversational)
- **Coffee Cart:** Medium (professional)

---

## Special Dialog States

### Unused Items

If player tries to show NPCs the Gold Doubloons:

**All NPCs:**
```
[No special dialog - they ignore it or look confused]
```
**Purpose:** Teaching moment - not everything has utility

### Revisiting After Trades

All NPCs can be re-interacted with after their trade:
- Short, contextual dialog
- References completed trade
- Maintains character voice
- No new trades available

### Boy During Quest

Boy remains under tree throughout the game. If player returns:

**Dialog:**
```
"Still looking?"
```
**Tone:** Patient, trusting, no judgment
**Implication:** He knows she needs to do this

### Alternative Interaction Attempts

**Trying to catch ladybug without net:**
```
[Visual only: Ladybug flies away when approached]
```
**Message:** Need proper tool (net)

---

## Voice & Writing Guidelines

### General Principles

1. **Show, don't tell** - Use action descriptions (*wags tail*)
2. **Trust the player** - Don't over-explain
3. **Character first** - Every line serves personality
4. **Economy of words** - No wasted dialogue
5. **Subtext matters** - What's unsaid is important

### NPC Voice Quick Reference

| Character | Key Traits | Common Phrases | Avoid |
|-----------|-----------|----------------|-------|
| Hippie | Zen, artistic, detached | "Peace", "existing", "...but" | Preachy, hippie cliches |
| Kid | Fast, excited, innocent | "Hi! Hi!", repeated words | Adult vocabulary |
| Dog | Friendly, simple, loyal | "*Woof!*", "*tail wagging*" | Complex thoughts |
| Bird | Wise, poetic, brief | "path forward", philosophical | Over-explaining |
| Squirrel | Frantic (then grateful) | "*CHITTER*", "my acorns!" | Calm before freedom |
| Fisherman | Gruff, experienced, brief | "the big one", practical | Overly friendly |
| Parent | Observant, accepting | "Kids...", "*shrugs*" | Judgy or stressed |
| Coffee Cart | Professional, routine | "Morning!", functional | Personal/emotional |

---

## Localization Notes (Future)

When translating dialog:

1. **Maintain character voices** - A zen hippie reads differently in every language
2. **Action descriptions** - Some may need cultural adaptation
3. **"Peace"** - Hippie's closing may need equivalent in other languages
4. **Barks/Chittering** - Animal sounds transcribed differently per language
5. **Politeness levels** - Japanese etc. need proper hierarchy
6. **Kid's enthusiasm** - Maintain energy across languages
7. **Subtext** - Core themes must translate (trust vs force)

---

## Script Change Log

**v1.0** - Initial script (Feb 8, 2026)
- All dialog established
- Quest chain finalized
- Character voices defined

**v2.0** - Dialog & ending rework (Feb 10, 2026)
- Split dialog into dialogBefore/dialog/dialogAfterTrade/dialogDecline/dialogComplete
- Trade confirmation now appears AFTER neutral dialog lines, not mixed in
- Dog moved to Park, gives Leash (Rope) instead of Rope
- Squirrel gives Ball instead of Axe; Kid gives Axe instead of Dog Toy
- Coffee cart now hints at bird feeder with birdseed
- Parent dialog includes kid interruption (runs over on line 3)
- Fisherman hints at ladybug location in meadow after trade
- Ending replaced text cutscene with animated sequence
- Ladybug lands on boy's hand (cyclical return to opening)
- Added dialog prompts: "*Misses!*", "*The ladybug lands gently on his hand...*"
- Boy's closing line: "Ain't that just the way."
- Fade to black before credits
- Credits: "infinite beginnings" (was "infinite pursuit"), "for Adielle"

---

**For Actors/Voice Artists (Future):**
- See CHARACTER_VOICES.md for audio direction
- Each character needs distinct voice
- Emotional range per character defined
- Pacing notes included

**For Writers/Editors:**
- Maintain this document as source of truth
- All dialog changes must be reflected here
- Test dialog in-game for pacing
- Preserve character voice consistency

**For Translators:**
- Full context in DESIGN.md
- Character personalities critical
- Subtext and themes must carry over
- Test in-game after translation
