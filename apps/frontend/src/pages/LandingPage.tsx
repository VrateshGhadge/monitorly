import Nav from "../components/layout/Nav";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/sections/HeroSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import FlowSection from "../components/sections/FlowSection";
import WhySection from "../components/sections/WhySection";
import AnalyticsSection from "../components/sections/AnalyticsSection";
import PricingSection from "../components/sections/PricingSection";
import FaqSection from "../components/sections/FaqSection";
import CtaSection from "../components/sections/CtaSection";

export default function LandingPage() {
  return (
    <>
      <Nav />

      <main id="top">
        <HeroSection />
        <FeaturesSection />
        <FlowSection />
        <WhySection />
        <AnalyticsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>

      <Footer />
    </>
  );
}
