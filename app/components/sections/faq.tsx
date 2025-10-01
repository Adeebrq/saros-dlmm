"use client";

import { useState } from "react";
import { HorizontalSeparator } from "../seperator";
import { VerticalSeparator } from "../seperator";

interface AccordionItemProps {
  question: string;
  answer: string;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  borderClasses: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  question, 
  answer, 
  color, 
  isOpen, 
  onToggle, 
  borderClasses 
}) => (
  <div className={`border-x border-edge ${borderClasses}`}>
    <button
      onClick={onToggle}
      className="w-full px-4 sm:px-6 py-4 sm:py-6 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-center gap-4">
        <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold billing-font ${color}`}>
          {question}
        </h3>
        <span className={`text-xl sm:text-2xl font-bold transition-transform duration-300 flex-shrink-0 ${color} ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`}>
          ↓
        </span>
      </div>
    </button>
    
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
    }`}>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base">
          {answer}
        </p>
      </div>
    </div>
  </div>
);

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is DLMM trading?",
      answer: "Dynamic Liquidity Market Making allows you to provide concentrated liquidity in specific price ranges, maximizing capital efficiency and earning potential compared to traditional AMM models.",
      color: "text-black"
    },
    {
      question: "How accurate are the analytics?",
      answer: "We fetch real-time data directly from Saros pools on Solana and calculate comprehensive analytics including pool health scores, impermanent loss tracking, and position performance. Our system provides proactive warnings when pool conditions change, helping you make informed decisions about your liquidity positions.",
      color: "text-black"
    },    
    {
      question: "Do you support other DEXs?",
      answer: "Currently we focus exclusively on Saros to provide the most comprehensive DLMM experience.",
      color: "text-black"


    },
    {
      question: "Do I need to connect my wallet?",
      answer: "No wallet connection needed! SaroScope provides comprehensive analytics on all public Saros pools without requiring any wallet access. Track performance by clicking on the active pools and get pool health insights.",
      color: "text-black"
    },
    {
      question: "How powerful is the backtesting feature?",
      answer: "SaroScope's backtesting is the platform's flagship capability. Simulate DLMM positions across any historical period, and analyze performance with granular detail.",
      color: "text-black"
    }    
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="w-full border-x border border-edge flex justify-center">
        <div className="flex flex-col w-full lg:w-fit border-x border-edge max-w-5xl">
          
          {/* Top Horizontal Separator */}
          <HorizontalSeparator />
          
          {/* Main Header Row */}
          <div className="flex">
            {/* Left Vertical Separator */}
            <VerticalSeparator />
            
            {/* Header Content - Responsive width */}
            <div className="py-0 px-0 text-center w-full lg:w-[922px]">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-3 py-6 sm:py-8">
                <span className='billing-font font-extrabold'>Frequently Asked Questions</span>
              </h1>
            </div>
            
            {/* Right Vertical Separator */}
            <VerticalSeparator />
          </div>
          
          {/* Bottom Horizontal Separator */}
          <HorizontalSeparator />
          
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full border border-edge flex justify-center">
        <div className="flex flex-col w-full lg:w-fit max-w-5xl">
          
          {/* Main Content Row */}
          <div className="flex">
            {/* Left Vertical Separator */}
            <VerticalSeparator />
            
            {/* Content Area */}
            <div className="py-0 px-4 sm:px-8 w-full lg:w-[922px]">
              <div className="space-y-0">
                
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    color={faq.color}
                    isOpen={openIndex === index}
                    onToggle={() => handleToggle(index)}
                    borderClasses={
                      index === 0 
                        ? "screen-line-after" 
                        : index === faqs.length - 1
                        ? "screen-line-after "
                        : "screen-line-after"
                    }
                  />
                ))}

              </div>
            </div>
            
            {/* Right Vertical Separator */}
            <VerticalSeparator />
          </div>
          
          {/* Bottom Horizontal Separator */}
          <HorizontalSeparator />
          
        </div>
      </div>
    </div>
  );
};