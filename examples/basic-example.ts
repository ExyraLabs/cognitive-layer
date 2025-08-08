/**
 * Basic example of using the Exyra Cognitive Layer
 * Demonstrates autonomous DeFi agent deployment and decision-making
 */

import { CognitiveEngine } from '../src/core/engine';
import type { CognitiveConfig, MarketData } from '../src/types';

// Configuration for the cognitive engine
const config: CognitiveConfig = {
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    coingecko: process.env.COINGECKO_API_KEY,
    infura: process.env.INFURA_API_KEY,
    etherscan: process.env.ETHERSCAN_API_KEY
  },
  networks: ['ethereum', 'polygon', 'arbitrum'],
  riskTolerance: 'medium',
  reasoning: {
    decisionThreshold: 0.7,
    confidenceLevel: 0.8,
    maxProcessingTime: 1000,
    learningRate: 0.01
  },
  memory: {
    retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 10000,
    longTermThreshold: 0.7,
    maxMemorySize: 50000,
    shortTermRetention: 24 * 60 * 60 * 1000,
    longTermRetention: 30 * 24 * 60 * 60 * 1000,
    cleanupInterval: 60 * 60 * 1000
  }
};

async function basicExample() {
  console.log('🧠 Exyra Cognitive Layer - Basic Example');
  console.log('==========================================\n');

  // Initialize the cognitive engine
  const engine = new CognitiveEngine(config);

  try {
    // Start the engine
    console.log('1. Starting Cognitive Engine...');
    await engine.start();
    console.log('   ✅ Engine started successfully\n');

    // Deploy different types of agents
    console.log('2. Deploying Autonomous Agents...');
    
    // Yield optimization agent
    const yieldAgentId = await engine.deployAgent({
      type: 'yield_optimizer',
      budget: 10000, // $10,000 budget
      maxRisk: 0.3,  // 30% max risk
      targetReturn: 0.15, // 15% target APY
      protocols: ['aave', 'compound', 'yearn'],
      chains: ['ethereum'],
      settings: {
        rebalanceThreshold: 0.05, // 5% deviation triggers rebalance
        maxPositions: 3
      }
    });
    console.log(`   🎯 Yield Optimizer deployed: ${yieldAgentId}`);

    // Arbitrage hunting agent
    const arbAgentId = await engine.deployAgent({
      type: 'arbitrage_hunter',
      budget: 5000, // $5,000 budget
      maxRisk: 0.2,  // 20% max risk
      protocols: ['uniswap', 'sushiswap', 'curve'],
      chains: ['ethereum', 'polygon'],
      settings: {
        minSpread: 0.01, // 1% minimum spread
        maxSlippage: 0.005 // 0.5% max slippage
      }
    });
    console.log(`   ⚡ Arbitrage Hunter deployed: ${arbAgentId}`);

    // Risk management agent
    const riskAgentId = await engine.deployAgent({
      type: 'risk_manager',
      budget: 20000, // $20,000 to monitor
      maxRisk: 0.1,   // 10% max risk
      protocols: ['*'], // Monitor all protocols
      chains: ['ethereum', 'polygon', 'arbitrum'],
      settings: {
        stopLoss: 0.15, // 15% stop loss
        emergencyExit: 0.25 // 25% emergency exit
      }
    });
    console.log(`   🛡️  Risk Manager deployed: ${riskAgentId}\n`);

    // Simulate market data processing
    console.log('3. Processing Market Data...');
    
    const mockMarketData: MarketData = {
      timestamp: Date.now(),
      prices: {
        ETH: 3200,
        BTC: 65000,
        USDC: 1.00,
        USDT: 0.999,
        DAI: 1.001,
        WETH: 3200
      },
      volumes: {
        ETH: 1500000,
        BTC: 800000,
        USDC: 2000000,
        USDT: 1800000,
        DAI: 300000,
        WETH: 1400000
      },
      liquidityPools: [
        {
          protocol: 'aave',
          pair: 'ETH/USDC',
          tvl: 1500000,
          apy: 0.18, // 18% APY
          volume24h: 2000000,
          chain: 'ethereum'
        },
        {
          protocol: 'compound',
          pair: 'ETH/USDC',
          tvl: 1200000,
          apy: 0.15, // 15% APY
          volume24h: 1500000,
          chain: 'ethereum'
        },
        {
          protocol: 'uniswap',
          pair: 'ETH/USDC',
          tvl: 5000000,
          apy: 0.12, // 12% APY (fees)
          volume24h: 10000000,
          chain: 'ethereum'
        },
        {
          protocol: 'sushiswap',
          pair: 'ETH/USDC',
          tvl: 2000000,
          apy: 0.14, // 14% APY (fees)
          volume24h: 3000000,
          chain: 'polygon'
        }
      ],
      gasPrice: {
        slow: 25,     // 25 gwei
        standard: 35, // 35 gwei
        fast: 50,     // 50 gwei
        instant: 75,  // 75 gwei
        timestamp: Date.now()
      },
      sentiment: {
        overall: 0.75, // 75% positive sentiment
        social: 0.8,   // 80% positive social sentiment
        news: 0.7,     // 70% positive news sentiment
        onChain: 0.75  // 75% positive on-chain sentiment
      },
      news: [
        {
          title: 'Ethereum DeFi TVL Reaches New High',
          content: 'Total value locked in Ethereum DeFi protocols has reached a new all-time high...',
          sentiment: 0.8,
          relevance: 0.9,
          timestamp: Date.now() - 3600000, // 1 hour ago
          source: 'DeFiPulse'
        },
        {
          title: 'New Yield Farming Opportunities on Polygon',
          content: 'Polygon network sees surge in new yield farming protocols with attractive APYs...',
          sentiment: 0.7,
          relevance: 0.8,
          timestamp: Date.now() - 7200000, // 2 hours ago
          source: 'CoinDesk'
        }
      ],
      yields: [
        {
          protocol: 'aave',
          chain: 'ethereum',
          asset: 'ETH',
          apy: 0.18,
          tvl: 1500000,
          risk: 'medium' as const,
          minAmount: 100,
          maxAmount: 1000000
        },
        {
          protocol: 'compound',
          chain: 'ethereum',
          asset: 'ETH',
          apy: 0.15,
          tvl: 1200000,
          risk: 'low' as const,
          minAmount: 50,
          maxAmount: 500000
        }
      ]
    };

    // Process the market data
    await engine.processMarketData(mockMarketData);
    console.log('   📊 Market data processed\n');

    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Display agent statistics
    console.log('4. Agent Performance Statistics:');
    const yieldStats = engine.getAgentStats(yieldAgentId);
    const arbStats = engine.getAgentStats(arbAgentId);
    const riskStats = engine.getAgentStats(riskAgentId);

    if (yieldStats) {
      console.log(`   🎯 Yield Optimizer: Status=${yieldStats.status}, Capital=$${yieldStats.availableCapital.toLocaleString()}`);
      console.log(`      Performance: Return=${yieldStats.performance.totalReturn.toFixed(2)}, Win Rate=${(yieldStats.performance.winRate * 100).toFixed(1)}%`);
    }

    if (arbStats) {
      console.log(`   ⚡ Arbitrage Hunter: Status=${arbStats.status}, Capital=$${arbStats.availableCapital.toLocaleString()}`);
      console.log(`      Performance: Return=${arbStats.performance.totalReturn.toFixed(2)}, Win Rate=${(arbStats.performance.winRate * 100).toFixed(1)}%`);
    }

    if (riskStats) {
      console.log(`   🛡️  Risk Manager: Status=${riskStats.status}, Monitoring=$${riskStats.availableCapital.toLocaleString()}`);
      console.log(`      Performance: Return=${riskStats.performance.totalReturn.toFixed(2)}, Risk Score=${riskStats.performance.maxDrawdown.toFixed(3)}`);
    }

    // Display engine statistics
    console.log('\n5. Engine Statistics:');
    const engineStats = engine.getStatistics();
    console.log(`   🧠 Engine Status: ${engineStats.isRunning ? 'Running' : 'Stopped'}`);
    console.log(`   🤖 Total Agents: ${engineStats.totalAgents}`);
    console.log(`   ⚡ Active Agents: ${engineStats.activeAgents}`);
    console.log(`   🧮 Reasoning Stats: ${JSON.stringify(engineStats.reasoningStats, null, 2)}`);

    console.log('\n6. Stopping Engine...');
    await engine.stop();
    console.log('   ✅ Engine stopped successfully');

  } catch (error) {
    console.error('❌ Error running example:', error);
  }
}

// Run the example
if (process.argv[1].endsWith('basic-example.ts') || process.argv[1].endsWith('basic-example.js')) {
  basicExample().catch(console.error);
}

export { basicExample };
