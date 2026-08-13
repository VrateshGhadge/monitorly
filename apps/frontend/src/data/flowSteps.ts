export interface FlowStep {
  num: string;
  title: string;
  description: string;
}

export const flowSteps: FlowStep[] = [
  {
    num: "01 / CHECK",
    title: "We see it first",
    description:
      "Independent checks verify your site or API before it becomes your problem.",
  },
  {
    num: "02 / ALERT",
    title: "You hear about it instantly",
    description:
      "An email lands the moment a monitor goes down, so nothing sits unnoticed.",
  },
  {
    num: "03 / RESOLVE",
    title: "Recovery is confirmed",
    description:
      "A follow-up email confirms when the monitor is back up, with the full history logged.",
  },
];
