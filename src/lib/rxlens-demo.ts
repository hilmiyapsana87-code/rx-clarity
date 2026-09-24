import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  HeartPulse,
  Info,
  Microscope,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Volume2,
} from "lucide-react";

export const demoPrescription = {
  patient: "Demo Patient",
  label: "FICTIONAL DEMO — NOT A REAL PRESCRIPTION",
  date: "Fictional sample",
  confidence: 91, // fictional demo value only
  medicines: [
    {
      name: "Amoxicillin",
      strength: "500 mg",
      frequency: "Example frequency: 3 times/day",
      duration: "Example duration: 5 days",
      purpose: "Antibiotic commonly used to treat certain bacterial infections.",
      why: "This medicine can be prescribed for certain conditions. Only your healthcare professional can confirm why it was prescribed for you.",
      confidence: 94,
      needsVerification: false,
    },
    {
      name: "Metformin",
      possibleReading: "Possible reading: Metformin",
      strength: "500 mg",
      frequency: "Example frequency: after meals",
      duration: "Example duration: verify with prescriber",
      purpose: "Medicine commonly used as part of diabetes care plans.",
      why: "This medicine can be prescribed for certain conditions. Only your healthcare professional can confirm why it was prescribed for you.",
      confidence: 64,
      needsVerification: true,
    },
  ],
  details: ["Patient: Demo Patient", "Date: fictional sample", "Prescription type: educational prototype"],
};

export const benefitCards = [
  {
    icon: FileImage,
    title: "READ",
    text: "Helps interpret difficult prescription handwriting.",
  },
  {
    icon: ClipboardCheck,
    title: "UNDERSTAND",
    text: "Organizes medicine information in simple language.",
  },
  {
    icon: ShieldCheck,
    title: "VERIFY",
    text: "Encourages confirmation with a healthcare professional when uncertain.",
  },
];

export const workflowSteps = [
  {
    number: "01",
    title: "UPLOAD",
    text: "Upload a prescription image.",
    icon: FileImage,
  },
  {
    number: "02",
    title: "READ",
    text: "RxLens analyzes the visible prescription text.",
    icon: Microscope,
  },
  {
    number: "03",
    title: "ORGANIZE",
    text: "Medicines and prescription details are presented clearly.",
    icon: ClipboardCheck,
  },
  {
    number: "04",
    title: "UNDERSTAND",
    text: "Users receive general educational information and verification guidance.",
    icon: HeartPulse,
  },
];

export const safetyChecks = [
  "Check the medicine name",
  "Check the strength",
  "Follow your doctor's instructions",
  "Ask a pharmacist if anything is unclear",
  "Never change the dose yourself",
];

export const accessibilityFeatures = [
  { icon: Volume2, title: "Optional text-to-speech", text: "Medicine explanations can be read aloud in supported browsers." },
  { icon: ShieldCheck, title: "High contrast mode", text: "The navigation control increases contrast across the interface." },
  { icon: CheckCircle2, title: "Screen-reader-friendly labels", text: "Core upload and navigation actions include clear accessible names." },
  { icon: Info, title: "Simple language", text: "Explanations avoid unnecessary technical terminology." },
];

export const innovationCards = [
  {
    icon: Pill,
    title: "HANDWRITING → STRUCTURED INFORMATION",
    text: "Transforms difficult prescription text into an easier-to-read format.",
  },
  {
    icon: AlertTriangle,
    title: "CONFIDENCE-AWARE READING",
    text: "Instead of silently guessing unclear handwriting, RxLens highlights uncertainty.",
  },
  {
    icon: Stethoscope,
    title: "UNDERSTANDING + VERIFICATION",
    text: "Provides general educational explanations while directing users back to healthcare professionals for confirmation.",
  },
];

export const processingSteps = [
  { label: "Image received", state: "complete" },
  { label: "Text detected", state: "complete" },
  { label: "Organizing information", state: "active" },
  { label: "Preparing explanation", state: "pending" },
] as const;

export const brandIcon = Sparkles;
