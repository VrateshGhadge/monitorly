export interface FooterLinkGroup {
  heading: string;
  links: { label: string; href: string }[];
}

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    heading: "Product",
    links: [
      { label: "Monitoring", href: "#product" },
      { label: "Why Monitorly", href: "#why" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Status", href: "#" },
      { label: "Contact", href: "mailto:hello@monitorly.dev" },
    ],
  },
];
