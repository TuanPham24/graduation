// Edit everything about your invitation here. Leave a field "" if you don't know it yet.
window.GRAD_CONFIG = {
  graduateName: "Your Name",
  school: "Your University",
  major: "Your Major",
  classOf: "2026",
  photo: "", // e.g. "assets/me.jpg" — shows a round photo in the hero

  event: {
    // ISO date with timezone, e.g. "2026-12-20T08:00:00+07:00". Empty = "Coming soon".
    dateTime: "",
    displayDate: "", // e.g. "Sunday, 20 December 2026"
    displayTime: "", // e.g. "8:00 AM"
    venueName: "",
    venueAddress: "",
    mapUrl: "", // Google Maps link
    dressCode: "",
  },

  rsvpDeadline: "", // e.g. "10 December 2026"

  letter: {
    // Used when the link has no ?to=Name
    defaultRecipient: "my dear friend",
    paragraphs: [
      "After years of late nights, endless coffee, and more deadlines than I can count, I'm finally graduating!",
      "This journey wouldn't have been the same without you. You cheered me on, made me laugh when things got hard, and reminded me why it was all worth it.",
      "I would be so happy to have you there with me to celebrate this special day. Please come, take silly photos with me, and share the joy!",
    ],
    signOff: "With love and gratitude,",
  },

  // Paste your Google Apps Script Web App URL here (see README.md).
  // Empty = demo mode: forms work visually but nothing is saved.
  appsScriptUrl: "",

  musicUrl: "", // optional, e.g. "assets/music.mp3"
};
