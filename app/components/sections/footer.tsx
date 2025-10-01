import { HorizontalSeparator } from "../seperator";
import { VerticalSeparator } from "../seperator";

export const Footer = () => (
  <div className="w-full border-x border-edge flex screen-line-before screen-line-after justify-center bg-white">
    <div className="flex flex-col w-fit max-w-5xl border-x border-edge  screen-line-after ">
      

      {/* Footer Content */}
      <div className="flex">
        {/* Left Vertical Separator - Hidden on mobile */}
        <div className="hidden lg:block">
          <VerticalSeparator />
        </div>
        
        {/* Content Area - Centered layout */}
        <div className="py-0 px-0 sm:px-8 flex flex-col items-center justify-center w-full lg:w-[922px]">
          
          {/* SaroScope Title - Top Center */}
          <h1 className="text-3xl font-bold text-black dimitri-font mb-0">
            SaroScope
          </h1>
          
          {/* Footer Text - Bottom Center */}
          <p className="text-gray-400 text-sm font-medium text-center">
            Built with ❤️ by{' '}
            <a 
              href="https://x.com/a6xx9rq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 font-extrabold hover:text-blue-300 hover:underline transition-colors font-semibold"
            >
              Adeeb
            </a>
          </p>
          
        </div>
        
        {/* Right Vertical Separator - Hidden on mobile */}
        <div className="hidden lg:block">
          <VerticalSeparator />
        </div>
      </div>
      
      {/* Bottom Horizontal Separator */}
      <HorizontalSeparator />
      
    </div>
  </div>
);
