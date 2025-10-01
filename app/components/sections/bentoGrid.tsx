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
  
  console.log(`[${artboard}] Component render - isInView: ${isInView}, hasTriggered: ${hasTriggeredRef.current}, isReady: ${isReady}`);
  
  const { rive, RiveComponent } = useRive({
    src: '/ui_cards_bento.riv',
    artboard: artboard,
    stateMachines: stateMachine,
    autoplay: false,
    onLoadedMetadata: () => {
      console.log(`[${artboard}] 🎬 Metadata loaded`);
    },
    onLoad: () => {
      console.log(`[${artboard}] 🎬 OnLoad fired`);
      setIsReady(true);
    },
    onStateChange: (event: any) => {
      console.log(`[${artboard}] 🎬 State changed:`, event);
    }
  });

  // Log rive instance changes
  useEffect(() => {
    console.log(`[${artboard}] 📊 Rive instance changed - exists: ${!!rive}`);
    if (rive) {
      console.log(`[${artboard}] 📊 Rive methods:`, Object.getOwnPropertyNames(Object.getPrototypeOf(rive)));
      console.log(`[${artboard}] 📊 Trying to access state machine...`);
      
      // Try different methods to access inputs
      try {
        // Method 1: Direct access
        const inputs1 = rive.stateMachineInputs(stateMachine);
        console.log(`[${artboard}] Method 1 - stateMachineInputs:`, inputs1);
      } catch (e) {
        console.error(`[${artboard}] Method 1 failed:`, e);
      }

      try {
        // Method 2: Check if there's a play method
        if (typeof rive.play === 'function') {
          console.log(`[${artboard}] ✅ Play method exists`);
          rive.play();
        }
      } catch (e) {
        console.error(`[${artboard}] Play failed:`, e);
      }
    }
  }, [rive, stateMachine, artboard]);

  // Trigger animation when in viewport
  useEffect(() => {
    console.log(`[${artboard}] 🎯 Viewport check - isInView: ${isInView}, rive: ${!!rive}, isReady: ${isReady}, hasTriggered: ${hasTriggeredRef.current}`);
    
    if (isInView && rive && isReady && !hasTriggeredRef.current) {
      console.log(`[${artboard}] 🚀 ATTEMPTING TO FIRE ANIMATION - Looking for: ${activeInputName}`);
      
      // Try multiple approaches
      try {
        const inputs = rive.stateMachineInputs(stateMachine);
        console.log(`[${artboard}] Got inputs:`, inputs);
        
        if (inputs && inputs.length > 0) {
          console.log(`[${artboard}] All inputs:`, inputs.map((i: any) => i.name));
          const activeInput = inputs.find((i: any) => i.name === activeInputName);
          console.log(`[${artboard}] Active input (${activeInputName}):`, activeInput);
          
          if (activeInput && typeof activeInput.fire === 'function') {
            console.log(`[${artboard}] 💥 FIRING ${activeInputName} INPUT`);
            activeInput.fire();
            hasTriggeredRef.current = true;
          } else {
            console.log(`[${artboard}] ⚠️ ${activeInputName} input not found or no fire method`);
          }
        } else {
          console.log(`[${artboard}] ⚠️ No inputs found, trying play...`);
          if (typeof rive.play === 'function') {
            rive.play();
            hasTriggeredRef.current = true;
          }
        }
      } catch (error) {
        console.error(`[${artboard}] ❌ Error:`, error);
      }
    }
  }, [isInView, rive, isReady, artboard, stateMachine, hasTriggeredRef, activeInputName]);

  const handleMouseEnter = () => {
    console.log(`[${artboard}] 🖱️ Mouse enter - Looking for: ${hoverInputName}`);
    if (hasHover && rive) {
      try {
        const inputs = rive.stateMachineInputs(stateMachine);
        if (inputs) {
          const hoverInput = inputs.find((i: any) => i.name === hoverInputName);
          if (hoverInput && typeof hoverInput.fire === 'function') {
            console.log(`[${artboard}] 💥 FIRING ${hoverInputName}`);
            hoverInput.fire();
          }
        }
      } catch (error) {
        console.error(`[${artboard}] Hover error:`, error);
      }
    }
  };

  const handleMouseLeave = () => {
    // No action needed
  };

  const handleClick = () => {
    console.log(`[${artboard}] 🖱️ Click - Looking for: ${activeInputName}`);
    if (rive) {
      try {
        const inputs = rive.stateMachineInputs(stateMachine);
        if (inputs) {
          const activeInput = inputs.find((i: any) => i.name === activeInputName);
          if (activeInput && typeof activeInput.fire === 'function') {
            console.log(`[${artboard}] 💥 FIRING ${activeInputName} (CLICK)`);
            activeInput.fire();
            hasTriggeredRef.current = false; // Reset so it can fire again
          }
        }
      } catch (error) {
        console.error(`[${artboard}] Click error:`, error);
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
  <div className="flex flex-col w-fit max-w-5xl border-amber-300 border">
    
    {/* Top Horizontal Separator */}
    <HorizontalSeparator />
    
    {/* Main Header Row */}
    <div className="flex">
      {/* Left Vertical Separator */}
      <VerticalSeparator />
      
      {/* Header Content - Fixed width to match content */}
      <div className="py-8 px-4 text-center" style={{ width: '922px' }}>
        <h1 className="text-5xl font-bold text-black mb-3">
        <span className='billing-font font-extrabold'>Master DLMM Trading Like a Pro</span>
        </h1>
        <p className="text-gray-500 text-xl max-w-3xl mx-auto">
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
    <div className="flex w-fit max-w-5xl border-amber-300 border">
      {/* Left Vertical Separator */}
      <VerticalSeparator />
      
      {/* Main Content */}
      <div className="py-2 space-y-2">
        
        {/* First row - 3 cards */}
        <div className="flex gap-2 justify-center screen-line-before border-x border-edge">
          <RiveCard 
            artboard="Card 2"
            stateMachine="Card 2 All Motion"
            containerClassName="h-auto w-[298px] bg-gray-100 overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-[298] h-[320px]"
            hasHover={true}
            activeInputName="Press"
            hoverInputName="Hover"
          />
          
          <RiveCard 
            artboard="Card 4"
            stateMachine="Card 4 Motion"
            containerClassName="h-auto w-[298px] bg-gray-100 overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-[298] h-[320px]"
            hasHover={true}
            activeInputName="Active"
            hoverInputName="Hover"
          />

          <RiveCard 
            artboard="Card 6"
            stateMachine="Card 6 Motion"
            containerClassName="h-auto w-[298px] bg-gray-100 overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-[298] h-[320px]"
            hasHover={true}
            activeInputName="Active"
            hoverInputName="Hover"
          />
        </div>
        
        {/* Second row - 2 wide cards */}
        <div className="flex gap-2 justify-center screen-line-after border-x border-edge">
          <RiveCard 
            artboard="Card 5"
            stateMachine="Card 5 All Motion"
            containerClassName="h-auto w-[455px] bg-gray-100 overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-[455] h-[320px]"
            hasHover={true}
            activeInputName="Active"
            hoverInputName="Hover"
          />
          
          <RiveCard 
            artboard="Card 7"
            stateMachine="Card 7 All Motion"
            containerClassName="h-auto w-[455px] bg-gray-100 overflow-hidden screen-line-before screen-line-after border-x border-edge"
            riveClassName="w-[455] h-[320px]"
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