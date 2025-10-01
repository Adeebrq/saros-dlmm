import React from 'react'
import { cn } from "../lib/utils";
import { useRouter } from 'next/navigation';

const Header = () => {
    const router= useRouter();
    function SeparatorHeader({ className }: { className?: string }) {
        return (
          <div
            className={cn(
              "relative flex h-3 w-full overflow-hidden border-y border-edge",
              "before:absolute before:left-0 before:z-10 before:h-8 before:w-full",
              "before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56",
              className
            )}
          />
        );
      }

  return (
    <div className=" shadow-sm border-x border-edge screen-line-after screen-line-before">
    <div className="max-w-7xl mx-auto px-0 py-0 border-x border-edge screen-line-after screen-line-before">
    <SeparatorHeader/>
      <h1 className="text-3xl font-bold text-gray-900 dimitri-font cursor-pointer"
      onClick={()=> router.push("/")}
      >SaroScope</h1>
      <p className="text-gray-600 text-[12px] -mt-2">
      Master Saros DLMM strategies with data-driven insights
      </p>
      <SeparatorHeader/>
    </div>
  </div>
  )
}

export default Header
