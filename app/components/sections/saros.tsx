"use client";

import { useRive } from '@rive-app/react-canvas';
import { HorizontalSeparator } from "../seperator";
import { VerticalSeparator } from "../seperator";

export const SarosSection = () => {
  // Rive integration
  const { RiveComponent } = useRive({
    src: '/saros.riv',
    autoplay: true,
  });

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
            <div className="py-8 px-4 text-center w-full lg:w-[922px]">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-3">
                <span className='billing-font font-extrabold'>Powered by Saros</span>
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
            <div className="py-8 lg:py-12 px-4 lg:px-8 w-full lg:w-[922px]">
              
              {/* Description Paragraph */}
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed mb-6 lg:mb-8 text-center">
                Meet Saros - the game-changing DLMM protocol that&apos;s revolutionizing Solana trading. 
                It automatically manages your liquidity positions for maximum efficiency, processing millions in volume daily. 
                Every tool in SaroScope runs on Saros&apos;s proven infrastructure to help you navigate the markets like a pro.
              </p>

              {/* Saros Rive Animation */}
              <div className="flex justify-center">
                <RiveComponent
                  style={{ 
                    width: '836px', 
                    height: '767px',
                    maxWidth: '100%',
                  }}
                />
              </div>
              
            </div>
            
            {/* Right Vertical Separator */}
            <VerticalSeparator />
          </div>          
        </div>
      </div>
    </div>
  );
};