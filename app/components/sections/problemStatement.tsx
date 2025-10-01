import { HorizontalSeparator } from "../seperator";
import { VerticalSeparator } from "../seperator";

export const ProblemSolutionSection = () => (
    <div>
      {/* Problem Solution Section */}
      <div className="w-full border border-edge flex justify-center">
        <div className="flex flex-col w-full lg:w-fit max-w-5xl">
              {/* Header Section */}
  <div className="w-full border border-edge flex justify-center">
  <div className="flex flex-col w-full lg:w-fit max-w-5xl">
    
    {/* Top Horizontal Separator */}
    <HorizontalSeparator />
    
    {/* Main Header Row */}
    <div className="flex">
      {/* Left Vertical Separator */}
      <VerticalSeparator />
      
      {/* Header Content - Responsive width */}
      <div className="py-8 px-4 text-center w-full lg:w-[922px]">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-3">
        <span className='billing-font font-extrabold'>What are we solving?</span>
        </h1>
      </div>
      
      {/* Right Vertical Separator */}
      <VerticalSeparator />
    </div>
    
    {/* Bottom Horizontal Separator */}
    <HorizontalSeparator />
    
  </div>
</div>
          
          {/* Main Content Row */}
          <div className="flex">
            {/* Left Vertical Separator */}
            <VerticalSeparator />
            
            {/* Content Area */}
            <div className="py-0 px-4 lg:px-8 w-full lg:w-[922px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 items-start">
                
                {/* Problem Side */}
                <div className="text-center md:text-left border-x px-2 border-edge py-6 md:py-0">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-red-500 billing-font">
                    The Problem
                  </h2>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start md:items-center">
                      <span className="text-red-400 mr-3 text-xl flex-shrink-0">•</span>
                      <span className="font-medium text-sm sm:text-base">Impermanent loss eating your profits</span>
                    </li>
                    <li className="flex items-start md:items-center">
                      <span className="text-red-400 mr-3 text-xl flex-shrink-0">•</span>
                      <span className="font-medium text-sm sm:text-base">No real-time pool health monitoring</span>
                    </li>
                    <li className="flex items-start md:items-center">
                      <span className="text-red-400 mr-3 text-xl flex-shrink-0">•</span>
                      <span className="font-medium text-sm sm:text-base">Guessing optimal price ranges</span>
                    </li>
                    <li className="flex items-start md:items-center">
                      <span className="text-red-400 mr-3 text-xl flex-shrink-0">•</span>
                      <span className="font-medium text-sm sm:text-base">Missing profitable opportunities</span>
                    </li>
                  </ul>
                </div>
                
                {/* Solution Side */}
                <div className="text-center md:text-left border-x px-2 border-edge screen-line-before py-6 md:py-0">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-green-600 billing-font">
                    Our Solution
                  </h2>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start md:items-center">
                      <span className="text-green-500 mr-3 text-xl flex-shrink-0">•</span>
                      <span className="font-medium text-sm sm:text-base">Advanced IL calculators & alerts</span>
                    </li>
                    <li className="flex items-start md:items-center">
                      <span className="text-green-500 mr-3 text-xl flex-shrink-0">•</span>
                      <span className="font-medium text-sm sm:text-base">Real-time analytics dashboard</span>
                    </li>
                    <li className="flex items-start md:items-center">
                      <span className="text-green-500 mr-3 text-xl flex-shrink-0">•</span>
                      <span className="font-medium text-sm sm:text-base">AI-powered range suggestions</span>
                    </li>
                    <li className="flex items-start md:items-center">
                      <span className="text-green-500 mr-3 text-xl flex-shrink-0">•</span>
                      <span className="font-medium text-sm sm:text-base">Smart opportunity detection</span>
                    </li>
                  </ul>
                </div>
                
              </div>
            </div>
            
            {/* Right Vertical Separator */}
            <VerticalSeparator />
          </div>
          
        </div>
      </div>
    </div>
  );