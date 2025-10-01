"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import { VerticalSeparator } from '../seperator';
import {HorizontalSeparator } from '../seperator';

// Custom hook for viewport detection
const useInViewport = (threshold = 0.5) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
        // Reset the trigger flag when element leaves viewport
        if (!entry.isIntersecting) {
          hasTriggeredRef.current = false;
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isInView, hasTriggeredRef };
};

interface RiveCardProps {
  artboard: string;
  stateMachine: string;
  containerClassName?: string;
  riveClassName?: string;
  hasHover?: boolean;
  activeInputName?: string;
  hoverInputName?: string;
}

const RiveCard: React.FC<RiveCardProps> = ({ 
  artboard,
  stateMachine,
  containerClassName = "rounded-lg bg-gray-100 overflow-hidden shadow-lg",
  riveClassName = "w-full h-full",
  hasHover = true,
  activeInputName = 'Active',
  hoverInputName = 'Hover'
}) => {
  const { ref, isInView, hasTriggeredRef } = useInViewport(0.3);
  const [isReady, setIsReady] = useState(false);
  
  const { rive, RiveComponent } = useRive({
    src: '/ui_cards_bento.riv',
    artboard: artboard,
    stateMachines: stateMachine,
    autoplay: false,
    onLoad: () => {
      setIsReady(true);
    },
  });

  // Handle rive instance changes
  useEffect(() => {
    if (rive) {
      // Try different methods to access inputs
      try {
        // Method 1: Direct access
        const inputs1 = rive.stateMachineInputs(stateMachine);
      } catch (e) {
      }

      try {
        // Method 2: Check if there's a play method
        if (typeof rive.play === 'function') {
          rive.play();
        }
      } catch (e) {
      }
    }
  }, [rive, stateMachine, artboard]);

  // Trigger animation when in viewport
  useEffect(() => {
    if (isInView && rive && isReady && !hasTriggeredRef.current) {
      // Try multiple approaches
      try {
        const inputs = rive.stateMachineInputs(stateMachine);
        
        if (inputs && inputs.length > 0) {
          const activeInput = inputs.find((i: any) => i.name === activeInputName);
          
          if (activeInput && typeof activeInput.fire === 'function') {
            activeInput.fire();
            hasTriggeredRef.current = true;
          }
        } else {
          if (typeof rive.play === 'function') {
            rive.play();
            hasTriggeredRef.current = true;
          }
        }
      } catch (error) {
      }
    }
  }, [isInView, rive, isReady, artboard, stateMachine, hasTriggeredRef, activeInputName]);

  const handleMouseEnter = () => {
    if (hasHover && rive) {
      try {
        const inputs = rive.stateMachineInputs(stateMachine);
        if (inputs) {
          const hoverInput = inputs.find((i: any) => i.name === hoverInputName);
          if (hoverInput && typeof hoverInput.fire === 'function') {
            hoverInput.fire();
          }
        }
      } catch (error) {
      }
    }
  };

  const handleMouseLeave = () => {
    // No action needed
  };

  const handleClick = () => {
    if (rive) {
      try {
        const inputs = rive.stateMachineInputs(stateMachine);
        if (inputs) {
          const activeInput = inputs.find((i: any) => i.name === activeInputName);
          if (activeInput && typeof activeInput.fire === 'function') {
            activeInput.fire();
            hasTriggeredRef.current = false; // Reset so it can fire again
          }
        }
      } catch (error) {
      }
    }
  };

  return (
    <div 
      ref={ref}
      className={containerClassName}
      style={{ pointerEvents: 'auto' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <RiveComponent
        className={riveClassName}
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
};

const BentoGrid = () => {
  return (
<div>
  {/* Header Section */}
  <div className="w-full border border-edge flex justify-center">
  <div className="flex flex-col w-fit max-w-5xl">
    
    {/* Top Horizontal Separator */}
    <HorizontalSeparator />
    
    {/* Main Header Row */}
    <div className="flex">
      {/* Left Vertical Separator */}
      <VerticalSeparator />
      
      {/* Header Content - Responsive width */}
      <div className="py-8 px-4 text-center w-full lg:w-[922px]">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-3">
        <span className='billing-font font-extrabold'>Master DLMM Trading Like a Pro</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
        Transform market volatility into profit with  <span className='font-extrabold'>cutting-edge analytics, automated backtesting, </span>
        and <span className='font-extrabold'>real-time pool monitoring.</span>
        </p>
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
    <div className="flex w-full lg:w-fit max-w-5xl">
      {/* Left Vertical Separator */}
      <VerticalSeparator />
      
      {/* Main Content */}
      <div className="py-2 space-y-2 w-full">
        
        {/* First row - 3 cards (stack on mobile) */}
        <div className="flex flex-col lg:flex-row gap-2 justify-center screen-line-before border-x border-edge">
          <RiveCard 
            artboard="Card 2"
            stateMachine="Card 2 All Motion"
            containerClassName="h-auto w-full lg:w-[298px] bg-gray-100 overflow-hidden screen-line-before border-x border-edge"
            riveClassName="w-full h-[320px]"
            hasHover={true}
            activeInputName="Press"
            hoverInputName="Hover"
          />
          
          <RiveCard 
            artboard="Card 4"
            stateMachine="Card 4 Motion"
            containerClassName="h-auto w-full lg:w-[298px] bg-gray-100 overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-full h-[320px]"
            hasHover={true}
            activeInputName="Active"
            hoverInputName="Hover"
          />

          <RiveCard 
            artboard="Card 6"
            stateMachine="Card 6 Motion"
            containerClassName="h-auto w-full lg:w-[298px] bg-gray-100 overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-full h-[320px]"
            hasHover={true}
            activeInputName="Active"
            hoverInputName="Hover"
          />
        </div>
        
        {/* Second row - 2 wide cards (stack on mobile) */}
        <div className="flex flex-col lg:flex-row gap-2 justify-center screen-line-after border-x border-edge">
          <RiveCard 
            artboard="Card 5"
            stateMachine="Card 5 All Motion"
            containerClassName="h-auto w-full lg:w-[455px] bg-white overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-full h-[320px]"
            hasHover={true}
            activeInputName="Active"
            hoverInputName="Hover"
          />
          
          <RiveCard 
            artboard="Card 7"
            stateMachine="Card 7 All Motion"
            containerClassName="h-auto w-full lg:w-[455px] bg-gray-100 overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-full h-[320px]"
            hasHover={false}
            activeInputName="Active"
            hoverInputName="Hover"
          />
        </div>
        
      </div>
      
      {/* Right Vertical Separator */}
      <VerticalSeparator />
    </div>
  </div>
</div>

  );
};

export default BentoGrid;
