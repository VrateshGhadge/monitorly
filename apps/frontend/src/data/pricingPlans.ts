export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  cta: string;
  ctaVariant: "outline" | "primary";
  featured?: boolean;
  tag?: string;
  features: string[];
  disabled?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Everything you need to start monitoring today.",
    price: "$0",
    cta: "Start for free",
    ctaVariant: "primary",
    featured: true,
    tag: "AVAILABLE NOW",
    features: [
      "Up to 10 monitors",
      "5-minute monitoring intervals",
      "Website & API monitoring",
      "Email alerts & fast downtime detection",
      "30-day uptime history & response analytics",
    ],
  },
  {
    id: "coming-soon",
    name: "Coming Soon",
    description: "More plans for growing teams are on the way.",
    price: "—",
    cta: "Get notified",
    ctaVariant: "outline",
    disabled: true,
    features: [
      "Higher monitor limits",
      "Faster check intervals",
      "Team collaboration",
      "Extended history",
    ],
  },
];
