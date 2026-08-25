# FaultLab — Visual Direction

## Three Possible Approaches

### 1. Signal Room
**Very Brief Intro:** An instrument-panel workspace inspired by mission control and systems research labs. It uses chart-paper neutrals, precision typography, and urgent amber markers to make risk visible without resorting to cyberpunk conventions.

**Probability:** 0.06

### 2. Dark Matter Console
**Very Brief Intro:** A nocturnal command center with deep indigo surfaces, spectral data lines, and bright status indicators. The feeling is focused, technical, and slightly cinematic.

**Probability:** 0.03

### 3. Industrial Field Notes
**Very Brief Intro:** A warm, modular interface based on engineering notebooks, equipment labels, and hand-annotated diagnostics. It makes chaos engineering feel tactile, practical, and team-oriented.

**Probability:** 0.08

---

## Chosen Direction — Signal Room

**Design Movement:** Contemporary information design mixed with control-room instrumentation and the restraint of Swiss editorial systems.

**Core Principles:**

1. Treat every screen as an operational surface: information density is high, but hierarchy remains calm and legible.
2. Use signal color sparingly and semantically: amber signals risk or a running experiment, coral signals a degraded condition, and green confirms healthy systems.
3. Prefer framed data modules, ruled dividers, and annotated microcopy over generic cards or decorative gradients.
4. Use asymmetry intentionally: an anchored sidebar and a broad analysis field echo a laboratory bench rather than a marketing layout.

**Color Philosophy:** The base is an almost-black carbon field with blue-gray instrument panels to reduce visual glare. Bone-white type makes technical information feel printed and deliberate. The signature amber appears only for active controls, live state, and primary calls to action; it is the bright indicator light in a quiet lab.

**Layout Paradigm:** A persistent vertical instrument rail holds navigation and system posture. The main plane follows a calibration-sheet rhythm: contextual heading band, primary canvas, then offset evidence panels. The topology is deliberately allowed to breathe while operational controls sit near the point of action.

**Signature Elements:**

1. Hairline measurement rules with tiny coordinates and labels.
2. A "fault pulse" motif — dashed signal paths with a traveling amber node.
3. Large, bordered numeric readouts paired with precise units and compact trend labels.

**Interaction Philosophy:** Actions feel controlled rather than playful. A run operation creates a visible state transition, progress timeline, and signal animation. Hovers brighten instrument labels; destructive controls require a brief confirm surface.

**Animation:** Use 160–240ms snappy ease-out transitions for hover, panel, and control feedback. Use a low-frequency signal pulse only for a live experiment and moving topology packet. Respect reduced-motion preferences by freezing all travel animations and leaving status legible.

**Typography System:** Space Grotesk is the geometric display face for titles, numerical readouts, and product marking. IBM Plex Mono provides labels, metrics, infrastructure names, and all operational values. UI copy uses Space Grotesk at normal weight with an emphatic medium weight for key decisions.

**Brand Essence:** A controlled failure-testing laboratory for engineers who need to prove distributed systems under pressure — **disciplined, incisive, dependable**.

**Brand Voice:** Calm under pressure, concise, and technically specific. Headlines state the operational moment; microcopy describes the reversible outcome.

> “Break the dependency, not the deployment.”

> “Inject 500 ms latency into `payments-api` for 60 seconds.”

**Wordmark & Logo:** A compact fault-line glyph: two interrupted rectangular signal traces bridged by an amber pulse, paired with a custom-tension wordmark. The mark can operate alone at dashboard scale and as a favicon.

**Signature Brand Color:** **Signal Amber — #FFB020**

## Style Decisions

- The compact fault-line mark and FaultLab wordmark remain visible in the persistent instrument rail on every operational view.
- Framed modules use calibration coordinates, section rules, and labeled readouts instead of relying on generic rounded-card styling.
- The fault pulse is a shared visual grammar: amber nodes and dashed routes link the active experiment, topology, latency chart, and event stream.
- Copy names the target, fault type, duration, probability, or blast-radius posture wherever a user makes or observes an operational decision.
