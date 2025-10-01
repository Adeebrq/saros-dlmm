"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'

export default function HeroSection() {
  const router = useRouter();
  
  // Rive hooks for top right animation
  const { rive: topRightRive, RiveComponent: TopRightRive } = useRive({
    src: '/topRight.riv',
    autoplay: true,
  });

  // Rive hooks for top left animation
  const { rive: topLeftRive, RiveComponent: TopLeftRive } = useRive({
    src: '/topLeft.riv',
    autoplay: true,
  });

  return (
    <div className="relative min-h-screen">
      <Image
        src="/assets/hero.png"
        alt="Hero Background"
        fill
        className="object-cover object-center -z-10"
      />

      {/* Top Right Rive Animation */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] z-20 pointer-events-none">
        <TopRightRive />
      </div>

      {/* Top Left Rive Animation */}
      <div className="absolute -top-10 -left-28 w-[500px] h-[500px] z-20 pointer-events-none">
        <TopLeftRive />
      </div>

      <div className="p-3 flex flex-row justify-between relative z-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white dimitri-font">
            SaroScope
          </h1>
          <p className="text-gray-600 text-[12px] -mt-2">
            Master Saros DLMM strategies with data-driven insights
          </p>
        </div>

        <div className="font-bold px-4">
          <button 
            className="cursor-pointer hover:scale-110 transition-transform duration-200 text-white" 
            onClick={() => router.push("/dashboard")}
          >
            Get started→
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-gray-700 via-white to-gray-700 bg-clip-text text-transparent">
          Decode <span className="billing-font font-extrabold">DLMM.</span> Dominate <span className="billing-font">DeFi.</span>
        </h2>
        
        <p className="text-lg md:text-xl bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent max-w-2xl mb-8">
        <span className="font-extrabold">Transform speculation into strategy. </span> Backtest DLMM positions and maximize Saros yields with <span className="font-extrabold">proven analytics.</span>
        </p>
        
        <button 

        onClick={()=> router.push("/dashboard")}
          className={`
            w-fit
            px-4 py-3 sm:px-6 sm:py-3
            rounded-4xl cursor-pointer
            text-white font-semibold
            text-sm sm:text-base
            active:scale-95
            transform
            bg-gradient-to-b from-[#2c17cf] to-[#5C4EB8] 
            hover:from-[#2D1B85] hover:to-[#4A2F9A]
            transition-all duration-300 hover:scale-105
            shadow-[inset_0_0_18px_0_rgb(123,97,255),inset_0_0_6px_0_rgba(147,125,255,0.8)]
            hover:shadow-[inset_0_0_12px_0_rgb(123,97,255),inset_0_0_12px_0_rgba(147,125,255,0.6)]
          `}
        >
          Start Optimizing Now →
        </button>
      </div>
    </div>
  );
}
