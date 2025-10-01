"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRive } from '@rive-app/react-canvas'

export default function HeroSection() {
  const router = useRouter();
  
  // Rive hooks for top right animation
  const { RiveComponent: TopRightRive } = useRive({
    src: '/topRight.riv',
    autoplay: true,
  });

  // Rive hooks for top left animation
  const { RiveComponent: TopLeftRive } = useRive({
    src: '/topLeft.riv',
    autoplay: true,
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Layer 1 - Hero3 (bottom layer) */}
      <Image
        src="/assets/hero3.png"
        alt="Hero Background Base"
        fill
        className="object-cover object-center z-0"
      />


<Image
  src="/assets/particles.png"
  alt="Particles Background"
  fill
  className="object-cover object-center z-10"
  style={{
    animation: 'float 6s ease-in-out infinite'
  }}
/>


      {/* Background Layer 3 - White overlay (top background layer) */}
      <Image
        src="/assets/white.png"
        alt="White Overlay"
        fill
        className="object-cover object-center z-20 opacity-100"
      />

      {/* Top Right Rive Animation */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] z-40 pointer-events-none">
        <TopRightRive />
      </div>

      {/* Top Left Rive Animation */}
      <div className="absolute -top-10 -left-28 w-[500px] h-[500px] z-40 pointer-events-none">
        <TopLeftRive />
      </div>

      <div className="p-0 sm:p-4 md:p-2 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-30 gap-4 sm:gap-0">
  <div className="flex flex-col">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white dimitri-font">
      SaroScope
    </h1>
    <p className="text-gray-600 text-xs sm:text-sm md:text-base -mt-1 sm:-mt-2">
      Master Saros DLMM strategies with data-driven insights
    </p>
  </div>

  <div className="font-bold px-0 sm:px-4 w-full sm:w-auto">
    <button 
      className={`
        w-full sm:w-fit
        px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3
        rounded-[10px] cursor-pointer
        text-white font-semibold
        text-sm sm:text-base md:text-lg
        active:scale-95
        transform
        bg-gradient-to-b from-black to-gray-950
        hover:from-gray-900 hover:to-black
        transition-all duration-300
        shadow-[inset_0_0_18px_0_rgba(30,30,30,0.5),inset_0_0_6px_0_rgba(50,50,50,0.3)]
        hover:shadow-[inset_0_0_12px_0_rgba(30,30,30,0.7),inset_0_0_12px_0_rgba(50,50,50,0.4)]
        flex items-center justify-center gap-2
      `}
      onClick={() => router.push("/dashboard")}
    >
      Get started
    </button>
  </div>
</div>


      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-gray-100 to-purple-400 bg-clip-text text-transparent">
          Decode <span className="billing-font font-extrabold">DLMM.</span> Dominate <span className="billing-font">DeFi.</span>
        </h2>
        
        <p className="text-lg md:text-xl bg-gradient-to-r from-gray-800 via-gray-400 to-gray-800 bg-clip-text text-transparent max-w-2xl mb-8">
        <span className="font-extrabold">Transform speculation into  <span className="font-extrabold billing-font text-2xl ">strategy.</span> </span> Backtest DLMM positions and maximize Saros yields with <span className="font-extrabold billing-font text-2xl ">proven analytics.</span>
        </p>
        
        <button 
onClick={()=> router.push("/dashboard")}
  className={`
    w-fit
    px-1 py-0 gap-2
    rounded-xl cursor-pointer
    text-white font-semibold
    text-sm sm:text-base
    active:scale-95
    transform
    bg-gradient-to-b from-[#2c17cf] to-[#5C4EB8] 
    hover:from-[#2D1B85] hover:to-[#4A2F9A]
    transition-all duration-300 hover:scale-105
    shadow-[inset_0_0_30px_0_rgb(136,0,255),inset_0_0_12px_0_rgb(136,0,255)]
    hover:shadow-[inset_0_0_12px_0_rgb(43,0,255),inset_0_0_12px_0_rgb(43,0,255)]
    flex items-center 
  `}
>

  <p className="pl-2">
  Start Optimizing Now

  </p>
  <Image
    src="/arrow.svg"
    alt="Arrow"
    width={30}
    height={30}
    className="w-14 h-14"
  />
</button>


      </div>
    </div>
  );
}
