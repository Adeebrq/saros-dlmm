# SaroScope – A DLMM Backtesting Platform

![SaroScope Demo](https://drive.google.com/uc?export=view&id=1eoEVSlJ6Dpau9sYVM96gXnL4Jw5xcre9)


## Overview

SaroScope is a DLMM backtesting platform for Solana's Dynamic Liquidity Market Makers. Built with the Saros Finance SDK, it enables users to backtest strategies against historical data, compare performance, and optimize liquidity provision decisions through advanced analytics and real-time pool monitoring.

## Features

- 📊 **Advanced Backtesting Engine**  
  Test DLMM strategies against comprehensive historical data with precision analytics and detailed performance metrics.

- 🎯 **Smart Range Optimization**
- Our analysis identifies the most profitable price ranges for liquidity positions.

- 📈 **Real-Time Analytics**  
  Monitor DLMM positions with live data feeds, instant performance tracking, and real-time market insights.

- 🔄 **Strategy Comparison**  
  Compare multiple DLMM strategies side-by-side with detailed performance metrics, APY calculations, and risk assessments.

- 💧 **Pool Health Monitoring**  
  Track pool liquidity, volume, and activity levels to identify optimal entry points.

- 🎨 **Interactive Visualizations**  
  Beautiful charts and graphs powered by Recharts and custom Rive animations for enhanced user experience.
  
- 📱 **Mobile responsive**  
SarosScope supports accesibility across all devices.

![SaroScope Analytics](https://via.placeholder.com/800x400/2d2d2d/ffffff?text=Advanced+DLMM+Analytics+Dashboard)

## Tech Stack

* **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS  
* **Animations:** Rive (interactive animations), Custom CSS animations  
* **Charts & Visualizations:** Recharts, Custom chart components  
* **Blockchain Integration:** @saros-finance/dlmm-sdk, @solana/web3.js  
* **Data Services:** Custom price data services, Jupiter API integration  
* **UI Components:** Lucide React icons, Custom component library

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn package manager
- Solana RPC endpoint (recommended: Helius)
- Basic understanding of DeFi and liquidity provision

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/soradlmm.git
   cd soradlmm/app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the app directory:
   ```bash
   # Solana RPC Configuration
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   
   # Optional: Custom RPC endpoints for better performance
   NEXT_PUBLIC_HELIUS_RPC_URL=your_helius_endpoint
   NEXT_PUBLIC_QUICKNODE_RPC_URL=your_quicknode_endpoint
   
   # Price Data APIs
   NEXT_PUBLIC_JUPITER_API_URL=https://price.jup.ag/v4
   NEXT_PUBLIC_BIRDEYE_API_URL=https://public-api.birdeye.so/public
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
soradlmm/
├── app/
│   ├── app/
│   │   ├── api/
│   │   │   └── price-data/
│   │   │       └── route.ts
│   │   ├── components/
│   │   │   ├── sections/
│   │   │   │   ├── bentoGrid.tsx          # Interactive feature cards
│   │   │   │   ├── heroSection.tsx        # Landing page hero
│   │   │   │   ├── problemStatement.tsx   # Problem/solution section
│   │   │   │   ├── saros.tsx              # Saros protocol info
│   │   │   │   ├── faq.tsx                # FAQ section
│   │   │   │   └── footer.tsx             # Footer component
│   │   │   ├── BacktesterForm.tsx         # Main backtesting form
│   │   │   ├── ResultsDisplay.tsx         # Results visualization
│   │   │   ├── ComparisonChart.tsx        # Strategy comparison charts
│   │   │   ├── PerformanceChart.tsx       # Performance line charts
│   │   │   ├── RangeVisualization.tsx     # Price range visualization
│   │   │   └── StrategyComparison.tsx     # Strategy comparison logic
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # Dashboard page
│   │   ├── lib/
│   │   │   ├── sarosService.ts            # Saros SDK integration
│   │   │   ├── backtester.ts              # Backtesting engine
│   │   │   ├── priceDataService.ts        # Price data fetching
│   │   │   └── utils.ts                   # Utility functions
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript definitions
│   │   ├── globals.css                    # Global styles
│   │   ├── layout.tsx                     # Root layout
│   │   └── page.tsx                       # Home page
│   ├── public/
│   │   ├── assets/                        # Static assets
│   │   ├── *.riv                          # Rive animation files
│   │   └── *.svg                          # SVG icons
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Key Features Deep Dive

### Advanced Backtesting Engine
- **Historical Data Analysis:** Uses real Solana network price data for accurate backtesting
- **Multiple Strategy Types:** Concentrated, Wide Range, and Active Rebalancing strategies
- **Performance Metrics:** ROI, APY, time in range, impermanent loss calculations
- **Risk Assessment:** Pool health monitoring and liquidity analysis.

### Real-Time Data Integration
- **Live Price Feeds:** Jupiter and Birdeye API integration for real-time market data
- **Pool Monitoring:** Real-time tracking of Saros DLMM pool metrics
- **Dynamic Calculations:** SDK-powered fee and liquidity calculations

### Interactive Visualizations
- **Strategy Comparison Charts:** Side-by-side performance comparison
- **Price Range Visualization:** Interactive charts showing optimal liquidity ranges
- **Performance Tracking:** Historical performance with detailed metrics
- **Rive Animations:** Smooth, interactive animations for enhanced UX

## 🔧 Configuration

### Solana Network Configuration
The platform supports both mainnet and devnet configurations:

```typescript
// Mainnet pools (production)
const MAINNET_POOLS = {
  'SOL/USDC': {
    address: '8vZHTVMdYvcPFUoHBEbcFyfSKnjWtvbNgYpXg1aiC2uS',
    baseTicker: 'SOL',
    quoteTicker: 'USDC'
  }
  // Add more pools as needed
};
```

### Custom RPC Endpoints
For better performance, configure custom RPC endpoints in your environment variables:

```bash
# High-performance RPC endpoints
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-key
NEXT_PUBLIC_QUICKNODE_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/your-key/
```

## 📊 Supported Strategies

### 1. Concentrated Strategy
- **Description:** High-yield strategy with tight price ranges
- **Best For:** Experienced users with high risk tolerance
- **Features:** Custom range selection, high APY potential

### 2. Wide Range Strategy
- **Description:** Conservative strategy with broader price ranges
- **Best For:** Beginners and risk-averse users
- **Features:** Lower risk, more stable returns

### 3. Active Rebalancing Strategy
- **Description:** Dynamic strategy that adjusts ranges based on market conditions
- **Best For:** Active traders who can monitor positions
- **Features:** Automated rebalancing, threshold-based adjustments

## 🎯 Usage Examples

### Basic Backtesting
```typescript
// Example backtest configuration
const backtestParams = {
  investmentAmount: 5000,
  strategyType: StrategyType.CONCENTRATED,
  tokenPair: 'SOL/USDC',
  concentrationRange: { min: 49, max: 52 },
  timePeriod: 30 // days
};
```

### Strategy Comparison
```typescript
// Compare multiple strategies
const strategies = [
  StrategyType.CONCENTRATED,
  StrategyType.WIDE,
  StrategyType.ACTIVE_REBALANCING
];

// Get comparative results
const results = await compareStrategies(backtestParams, strategies);
```

## 🛠️ Development

### Running Tests
```bash
npm run lint          # ESLint checking
npm run build         # Production build
npm run dev           # Development server
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure build passes
5. Submit a pull request

## 📈 Performance Optimization

- **Lazy Loading:** Components are loaded on demand
- **Data Caching:** Price data is cached for better performance
- **Optimized RPC Calls:** Batched requests and connection pooling
- **Bundle Optimization:** Next.js automatic code splitting

## 🔒 Security Considerations

- **RPC Endpoint Security:** Use secure, private RPC endpoints for production
- **API Key Management:** Store sensitive keys in environment variables
- **Input Validation:** All user inputs are validated and sanitized
- **Error Handling:** Comprehensive error handling prevents data leaks

## 📚 Documentation

- **Saros Finance SDK:** [Official Documentation](https://docs.saros.finance/)
- **Solana Web3.js:** [Official Documentation](https://solana-labs.github.io/solana-web3.js/)
- **Next.js:** [Official Documentation](https://nextjs.org/docs)

## 🤝 Support

For technical support or questions:
- Create an issue in the GitHub repository
- Join our Discord community
- Check the FAQ section in the application

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Saros Finance** for the DLMM SDK and protocol
- **Solana Foundation** for the blockchain infrastructure
- **Jupiter** and **Birdeye** for price data APIs
- **Rive** for the interactive animations

---

**Built with ❤️ for the DeFi community**
