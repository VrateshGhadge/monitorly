export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "How quickly can I start monitoring?",
    answer:
      "Most teams add their first monitor in under two minutes. Add a URL, choose a check interval, and Monitorly starts checking it right away.",
  },
  {
    question: "What can I monitor?",
    answer:
      "Monitorly currently supports website monitoring and API monitoring, so you can keep an eye on any HTTP or HTTPS endpoint.",
  },
  {
    question: "How am I notified when something goes down?",
    answer:
      "Monitorly sends an email alert the moment a monitor goes down, and a follow-up email when it recovers.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. Monitorly is currently free to use, with no credit card required to get started.",
  },
  {
    question: "What's coming next?",
    answer:
      "We're actively building new capabilities on top of the current dashboard, monitors, and email alerts. Sign up to be notified as new features ship.",
  },
];
