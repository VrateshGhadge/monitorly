export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: "◉",
    title: "Website monitoring",
    description:
      "Check HTTP and HTTPS endpoints on a schedule that fits your service, with clear up/down status at a glance.",
  },
  {
    icon: "⌁",
    title: "API monitoring",
    description:
      "Watch the endpoints your product depends on and know the moment a response starts failing.",
  },
  {
    icon: "✉",
    title: "Email alerts",
    description:
      "Get notified by email the instant a monitor goes down, and again the moment it recovers.",
  },
  {
    icon: "▣",
    title: "Fast detection",
    description:
      "Frequent checks catch problems early, so you hear about issues before your customers do.",
  },
  {
    icon: "⌘",
    title: "Reliable uptime",
    description:
      "A steady, dependable check history for every monitor, with uptime percentage tracked over time.",
  },
  {
    icon: "↗",
    title: "Clean dashboard",
    description:
      "One calm view of every monitor's status, response time, and recent alerts.",
  },
];
