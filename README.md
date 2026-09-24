# Rx Clarity

Build a polished, professional, responsive healthcare web application called RxLens.

CORE IDEA

RxLens helps patients understand a doctor's handwritten prescription more easily.

User workflow:

Upload prescription → Read prescription → Identify medicines → Explain what each medicine is generally used for → Show prescription information clearly → Safety guidance

IMPORTANT:

RxLens is an educational prescription-understanding assistant, NOT a doctor, pharmacist, diagnosis system, or prescription-changing system.

It must NEVER recommend changing dosage, stopping medicines, replacing medicines, or taking a medicine without professional advice.

If handwriting/OCR confidence is low, clearly say:

"RxLens couldn't confidently read this part. Please verify it with your doctor or pharmacist."

---

DESIGN DIRECTION

Create a premium healthcare technology startup aesthetic.

Visual style:

- Clean white/light background

- Professional healthcare blue as the primary accent

- Very subtle secondary colors

- Modern rounded cards

- Excellent spacing

- Large readable typography

- Minimal but attractive icons

- Soft shadows

- Subtle gradients

- Smooth micro-animations

- Fully responsive for mobile, tablet and desktop

- Accessible contrast

- Do NOT make it look like a generic AI website

- Do NOT use excessive glowing effects

- Do NOT overcrowd the screen

The website should look impressive enough.

Brand:

RxLens

Tagline:

"See your prescription clearly."

Secondary tagline:

"Turning difficult-to-read prescriptions into understandable information."

---

PAGE 1 — LANDING PAGE

Create a strong hero section.

Left side:

RxLens

"See your prescription clearly."

"Understand what your prescription says — without replacing the guidance of your doctor or pharmacist."

Buttons:

Analyze Prescription

See How It Works

Right side:

Create a realistic but clearly fictional prescription card/illustration with a scanning lens effect.

Add a small floating label:

"Prescription detected"

Add another:

"Information organized"

Below hero create 3 benefit cards:

1. READ

   "Helps interpret difficult prescription handwriting."

2. UNDERSTAND

   "Organizes medicine information in simple language."

3. VERIFY

   "Encourages confirmation with a healthcare professional when uncertain."

Add a prominent safety banner:

"RxLens provides information, not medical advice."

---

PAGE 2 — HOW IT WORKS

Create a simple 4-step visual workflow.

01 — UPLOAD

Upload a prescription image.

02 — READ

RxLens analyzes the visible prescription text.

03 — ORGANIZE

Medicines and prescription details are presented clearly.

04 — UNDERSTAND

Users receive general educational information and verification guidance.

Use a clean horizontal timeline on desktop and vertical timeline on mobile.

---

PAGE 3 — PRESCRIPTION ANALYZER

This is the MAIN DEMO PAGE.

Create a large upload area.

Title:

"Analyze your prescription"

Subtitle:

"Upload a clear image of your prescription."

Upload box:

- Drag & drop

- Browse image

- Camera/upload option on mobile

- JPG, PNG supported

- Show maximum recommended file size

Also provide a "Try Demo Prescription" button.

IMPORTANT:

Because this is a prototype, include a fictional built-in demo prescription so the complete workflow can be demonstrated without requiring a real patient's prescription.

Use a clearly fictional sample such as:

Patient: Demo Patient

Medicine: Amoxicillin 500 mg

Frequency: Example only

Duration: Example only

Clearly label the entire sample:

"FICTIONAL DEMO — NOT A REAL PRESCRIPTION"

Do not use real patient information.

After upload, show:

Image preview

→ Analyze Prescription button

→ Loading animation

→ Results

---

PAGE 4 — ANALYSIS SCREEN

Create a beautiful processing screen.

Show:

"Reading prescription..."

Animated progress steps:

✓ Image received

✓ Text detected

● Organizing information

○ Preparing explanation

After processing, automatically show the results.

If OCR confidence is low, show an obvious warning.

Example:

"Some handwriting may be unclear."

"Please verify uncertain information with your doctor or pharmacist."

---

PAGE 5 — RESULTS DASHBOARD

Title:

"Prescription Summary"

Show a confidence indicator:

"Overall reading confidence: 91%"

Make clear that this is prototype confidence, not medical certainty.

Create medicine cards.

Each card should contain:

Medicine name

Strength

Frequency

Duration

General purpose

Confidence

Example:

Amoxicillin

500 mg

"Example frequency: 3 times/day"

"Example duration: 5 days"

General purpose

"Antibiotic commonly used to treat certain bacterial infections."

Then show:

"Why might this medicine be prescribed?"

Use simple educational language.

IMPORTANT:

Never claim that the medicine is definitely appropriate for the patient.

Instead say:

"This medicine can be prescribed for certain conditions. Only your healthcare professional can confirm why it was prescribed for you."

---

UNCERTAINTY / VERIFICATION SYSTEM

This is one of the most important RxLens features.

If the system is uncertain about a medicine name, display:

⚠️ "Needs verification"

Example:

"Possible reading: Metformin"

"Confidence: 64%"

"Please verify the medicine name before using this information."

Add button:

Verify with Pharmacist/Doctor

Do NOT automatically guess silently.

---

PAGE 6 — SAFETY CENTER

Create a dedicated safety section.

Title:

"Before you act"

Cards:

✓ Check the medicine name

✓ Check the strength

✓ Follow your doctor's instructions

✓ Ask a pharmacist if anything is unclear

✓ Never change the dose yourself

Red/amber warning card:

"RxLens does not diagnose conditions, prescribe medicines, or tell you to start, stop, or change treatment."

Add:

"Always follow the prescription and advice provided by your qualified healthcare professional."

---

PAGE 7 — ACCESSIBILITY

Add accessibility-focused features because RxLens should be useful to a wide range of people.

Include:

- Large readable text

- High contrast mode

- Simple language

- Mobile-friendly interface

- Screen-reader-friendly labels

- Clear icons

- Minimal technical terminology

- Optional text-to-speech button for explanations

Create a small "Accessibility" control in the navigation.

---

NAVIGATION

Create a clean navbar:

RxLens logo

Home

How It Works

Analyze

Safety

About

Right side:

Analyze Prescription

On mobile, convert this into a hamburger menu.

---

ABOUT SECTION

Explain:

"RxLens is a prototype designed to reduce confusion caused by difficult-to-read prescriptions by converting prescription information into a clearer, structured format."

Add three innovation cards:

1. HANDWRITING → STRUCTURED INFORMATION

Transforms difficult prescription text into an easier-to-read format.

2. CONFIDENCE-AWARE READING

Instead of silently guessing unclear handwriting, RxLens highlights uncertainty.

3. UNDERSTANDING + VERIFICATION

Provides general educational explanations while directing users back to healthcare professionals for confirmation.

IMPORTANT:

Do not claim that these features are clinically validated.

---

DEMO MODE

Add a small "Demo Mode" indicator.

Create a complete working fictional demonstration:

Landing page

→ Analyze Prescription

→ Demo Prescription

→ Processing animation

→ Results

→ Safety verification

The judges should be able to complete the entire journey in less than 60 seconds.

Make the demo visually impressive.

---

DATA & PRIVACY

Create a small privacy section:

"Your prescription contains sensitive information."

For this prototype:

- Do not store real patient data.

- Do not expose uploaded images publicly.

- Use fictional demo data.

- Clearly indicate that production deployment would require secure healthcare-grade infrastructure and appropriate privacy/compliance controls.

---

TECHNICAL REQUIREMENTS

Build the application as a modern responsive web app.

Use:

- React

- TypeScript

- Modern component architecture

- Clean reusable components

- Responsive CSS

- Accessible HTML

- Client-side demo workflow

Use mock/demo data where external OCR or medical APIs are unavailable.

Do NOT create fake claims that real OCR or clinical validation is occurring.

If an OCR integration is added, clearly separate:

1. OCR output

2. RxLens interpretation

3. Educational medicine information

Keep the code organized and easy to modify.

---

VISUAL DETAILS

Add subtle animations:

- Prescription scanning animation

- Upload hover effect

- Progress animation

- Card entrance animation

- Smooth page transitions

- Button hover effects

But keep animations professional and fast.

Avoid:

- excessive neon

- excessive glassmorphism

- cartoon medical illustrations

- clutter

- huge paragraphs

- fake statistics

- fake hospital logos

- fake patient testimonials

- fake clinical validation badges

---

FINAL JUDGE EXPERIENCE

The final website should communicate this story immediately:

Problem

"Prescription handwriting can be difficult for patients to understand."

↓

RxLens

"Reads, organizes and explains prescription information."

↓

Innovation

"Confidence-aware interpretation + explicit verification."

↓

Safety

"Never replaces doctors or pharmacists."

↓

Impact

"Less confusion. Better understanding. Safer verification."

Make the overall experience feel like a real healthcare startup prototype rather than a student HTML project.

Before finishing, test:

- Every navigation button

- Upload interaction

- Demo prescription

- Analyze button

- Results page

- Mobile responsiveness

- Safety warnings

- Back/home navigation

Fix any broken interactions or visual overflow.

Do not add features that are unnecessary.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a8287314-6b06-4757-b913-c318cecf83b2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
