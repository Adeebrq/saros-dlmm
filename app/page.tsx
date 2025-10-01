"use client";
import BentoGrid from "./components/sections/bentoGrid";
import { FAQSection } from "./components/sections/faq";
import { Footer } from "./components/sections/footer";
import HeroSection from "./components/sections/heroSection";
import { ProblemSolutionSection } from "./components/sections/problemStatement";
import { SarosSection } from "./components/sections/saros";
export default function Home() {
  return (
    <div className="overflow-x-hidden max-w-full">
        <HeroSection/>
        <BentoGrid/>
        <ProblemSolutionSection/>
        <SarosSection/>
        <FAQSection/>
        <Footer/>
    </div>
  );
}