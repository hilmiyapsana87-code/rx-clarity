# RxLens — Safety-first upgrade plan

Extend the existing app (keep current UI, routes, real-upload/demo separation). Core loop:
SCAN → EXTRACT → CONFIDENCE CHECK → SAFETY GATE → VERIFY → EXPLAIN → OPTIONAL REMINDER.

## Phase 1 — Confidence & safety core (results page)
- Per-field confidence chips (green ≥85 / yellow 60–84 / red <60 or missing) for name, brand, generic, strength, form, frequency, duration, instructions. Never fill missing values.
- **Uncertainty Shield**: lists every low-confidence critical field, its value, % and why verification is needed. Overall score shown only alongside the lowest critical field.
- **Prescription Completeness** card (✓ / ⚠ / ✕) with "N details require verification".
- **Safety Gate** status: Educational info OK / Review Required / Incomplete Check, with a "Why?" explainer. Interaction view shows "Interaction check incomplete" whenever any medicine is unverified (never "No interaction").
- **Human Verification Required** section triggered by the listed conditions.
- Consistent colour logic: green = confidently read, yellow = verify, red = unreadable/concern, blue = educational, grey = unavailable. Green never means "safe to take".

## Phase 2 — Medicine understanding
- Brand → generic mapping for common Indian brands (Glycomet, Augmentin, Crocin, Dolo, Calpol, Pan, Omez, Brufen, Combiflam, Ecosprin, Amlong, Atorva, Cetzine…) shown as "Possible match — verify identity".
- Analyzer prompt extended to return brand/generic/form fields and text-region boxes.
- Abbreviation Decoder (BD, TDS, QID, OD, SOS, HS, 1-0-1, 1-1-1, AC/PC…) phrased as "commonly indicates… please confirm".
- Medicine card gains Interaction Status + Verification Status rows and Why? / Read Aloud buttons.

## Phase 3 — Verification-driven features
- **Handwriting difficulty map**: coloured boxes over the uploaded image (from AI-returned regions; demo uses fixed regions), tap a box for the reason, legend.
- **Confirmed timeline**: "Possible schedule detected" → user confirms each line → Morning/Afternoon/Night labelled "User-confirmed".
- Three-case demo picker: Clear / Messy handwriting / Unreadable ("RxLens does not guess").
- Data-origin labels: Real reading / Fictional demo / User-verified — never mixed.

## Phase 4 — Accessibility & people
- **Language selector** (English, Tamil, Hindi, Telugu, Malayalam, Kannada): educational explanations translated on demand by the AI service, medicine names kept as-is; Read Aloud uses the matching browser voice.
- **Ask RxLens**: text + microphone (browser speech recognition) question box answering only from the current results, with strict refusal of diagnosis/dosing.
- **Elder Mode**: large text/buttons, high contrast, one message per card, Listen buttons.
- **Caregiver summary**: counts, safety status, verification items; no patient name/details.
- **Privacy Center** page: honest — image sent to an external AI reading service over HTTPS for processing, not stored by RxLens, held only in browser memory, cleared on refresh, not shared by RxLens.

## Phase 5 — Home dashboard & copy
- Hero "RxLens — Read. Verify. Understand." with new subtitle and actions: Scan Prescription, View Demo, Ask RxLens, Elder Mode, Privacy.
- Updated disclaimer text; anti-hallucination wording ("I don't know confidently").

## Testing
Playwright run of: three demo cases, real upload (clear/blurry/unrelated), missing dosage/duration, unverified interaction, language switch, Read Aloud trigger, Elder Mode, caregiver view, privacy page, mobile and desktop widths.

## Technical notes
- New server functions: translate explanations, Ask RxLens (both Responses API, streamed, safety system prompt).
- Global settings (language, elder mode) in a small client store; prescription data stays in-memory only.
- New routes: /privacy, /ask (or a drawer); existing routes extended.
