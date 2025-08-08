#!/usr/bin/env node

/**
 * Basic Setup Example - JavaScript Version
 * 
 * This example demonstrates the simplest way to set up the Exyra Cognitive Layer
 * with a single yield optimization agent using a simplified implementation.
 */

// Simple Mock Cognitive Engine for demonstration
class SimpleCognitiveEngine {
  constructor(config) {
    this.agents = new Map();
    this.isRunning = false;
    this.config = config;
    this.stats = {
      decisions: 0,
      successfulDecisions: 0,
      totalProcessingTime: 0,
      startTime: 0
    };
    
    console.log('🔧 Cognitive Engine initialized with configuration:');
    console.log(`   Risk Tolerance: ${config.riskTolerance || 'medium'}`);
    console.log(`   Decision Threshold: ${config.reasoning?.decisionThreshold || 0.7}`);
    console.log(`   Memory Retention: ${(config.memory?.retentionPeriod || 86400000) / 3600000}h`);
  }

  async start() {
    this.isRunning = true;
    this.stats.startTime = Date.now();
    console.log('✅ Cognitive engine started successfully');
  }

  async stop() {
    this.isRunning = false;
    console.log('🛑 Cognitive engine stopped');
  }

  async deployAgent(config) {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agent = {
      id: agentId,
      type: config.type,
      config,
      status: 'active',
      deployTime: Date.now(),
      stats: {
        decisions: 0,
        successfulDecisions: 0,
        profit: 0,
        maxProfit: 0,
        maxLoss: 0,
        trades: [],
        uptime: Date.now()
      }
    };

    this.agents.set(agentId, agent);
    console.log(`✅ Agent deployed successfully!`);
    console.log(`   Agent ID: ${agentId}`);
    console.log(`   Type: ${config.type}`);
    console.log(`   Budget: $${config.budget.toLocaleString()}`);
    console.log(`   Max Risk: ${(config.maxRisk * 100).toFixed(1)}%`);
    console.log(`   Protocols: ${config.protocols.join(', ')}`);
    
    return agentId;
  }

  async processMarketData(data) {
    if (!this.isRunning) {
      throw new Error('Cognitive engine is not running');
    }

    const startTime = Date.now();
    let opportunitiesFound = 0;
    let decisionsMode = 0;

    console.log(`📊 Processing market data at ${new Date(data.timestamp).toLocaleTimeString()}`);
    
    // Simulate finding opportunities based on market conditions
    const volatilityFactor = data.volatility || 0.15;
    const volumeFactor = (data.volume || 1000000000) / 1000000000;
    
    // Higher volatility and volume = more opportunities
    const opportunityChance = Math.min(0.8, volatilityFactor * 2 + volumeFactor * 0.3);
    
    // Process each agent
    for (const [agentId, agent] of this.agents) {
      try {
        // Simulate agent analysis
        const analysisTime = Math.random() * 50 + 10; // 10-60ms analysis time
        await new Promise(resolve => setTimeout(resolve, analysisTime));
        
        // Check if agent finds an opportunity
        if (Math.random() < opportunityChance) {
          opportunitiesFound++;
          
          // Agent decides whether to act (based on confidence)
          const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
          const threshold = this.config.reasoning?.decisionThreshold || 0.7;
          
          if (confidence > threshold) {
            this.stats.decisions++;
            agent.stats.decisions++;
            decisionsMode++;
            
            // Simulate decision outcome
            const success = Math.random() > 0.25; // 75% success rate
            const profitRange = agent.config.budget * 0.01; // 1% of budget range
            const profit = success ? 
              Math.random() * profitRange : 
              -(Math.random() * profitRange * 0.5); // Losses are typically smaller
            
            agent.stats.profit += profit;
            agent.stats.maxProfit = Math.max(agent.stats.maxProfit, agent.stats.profit);
            agent.stats.maxLoss = Math.min(agent.stats.maxLoss, agent.stats.profit);
            
            // Record trade
            agent.stats.trades.push({
              timestamp: Date.now(),
              type: agent.type,
              profit,
              confidence,
              success
            });
            
            if (success) {
              this.stats.successfulDecisions++;
              agent.stats.successfulDecisions++;
            }
            
            // Log significant decisions
            if (Math.abs(profit) > 20 || Math.random() < 0.3) {
              const emoji = success ? '📈' : '📉';
              console.log(`   ${emoji} ${agent.type}: ${success ? 'SUCCESS' : 'FAILED'} - ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} (confidence: ${(confidence * 100).toFixed(1)}%)`);
            }
          }
        }
        
        // Simulate random opportunities
        if (Math.random() < 0.15) {
          const oppType = ['yield_farming', 'arbitrage', 'liquidity_mining', 'staking'][Math.floor(Math.random() * 4)];
          const expectedProfit = Math.random() * 500 + 50;
          console.log(`   🎯 Opportunity detected: ${oppType} - Expected: $${expectedProfit.toFixed(2)}`);
        }
        
      } catch (error) {
        console.log(`   ⚠️  Agent ${agentId} error: ${error.message}`);
      }
    }

    const processingTime = Date.now() - startTime;
    this.stats.totalProcessingTime += processingTime;
    
    // Log processing summary
    if (opportunitiesFound > 0 || decisionsMode > 0 || Math.random() < 0.2) {
      console.log(`   📋 Processing complete: ${opportunitiesFound} opportunities, ${decisionsMode} decisions (${processingTime}ms)`);
    }
  }

  getActiveAgents() {
    return Array.from(this.agents.values());
  }

  getAgentStats(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const uptime = Date.now() - agent.stats.uptime;
    const winRate = agent.stats.decisions > 0 ? 
      agent.stats.successfulDecisions / agent.stats.decisions : 0;
    const currentBalance = agent.config.budget + agent.stats.profit;
    const returnPercentage = (agent.stats.profit / agent.config.budget) * 100;

    return {
      agentId,
      type: agent.type,
      status: agent.status,
      uptime,
      decisions: agent.stats.decisions,
      successfulDecisions: agent.stats.successfulDecisions,
      accuracy: winRate,
      winRate,
      profitLoss: agent.stats.profit,
      returnPercentage,
      budget: {
        initial: agent.config.budget,
        current: currentBalance,
        allocated: agent.config.budget * 0.8 // Mock 80% allocation
      },
      performance: {
        maxProfit: agent.stats.maxProfit,
        maxLoss: agent.stats.maxLoss,
        totalTrades: agent.stats.trades.length,
        profitableTrades: agent.stats.trades.filter(t => t.success).length
      }
    };
  }

  getMetrics() {
    const uptime = Date.now() - this.stats.startTime;
    const avgDecisionTime = this.stats.decisions > 0 ? 
      this.stats.totalProcessingTime / this.stats.decisions : 0;
    const successRate = this.stats.decisions > 0 ? 
      this.stats.successfulDecisions / this.stats.decisions : 0;

    return {
      operational: {
        totalDecisions: this.stats.decisions,
        successfulDecisions: this.stats.successfulDecisions,
        avgDecisionTime: avgDecisionTime.toFixed(2),
        successRate: (successRate * 100).toFixed(2),
        uptime: uptime
      },
      technical: {
        activeAgents: this.agents.size,
        memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        throughput: (this.stats.decisions / (uptime / 1000) || 0).toFixed(2)
      }
    };
  }
}

async function basicSetupExample() {
  console.log('🧠 Exyra Cognitive Layer - Basic Setup Example');
  console.log('='.repeat(50));

  // 1. Create configuration
  const config = {
    riskTolerance: 'medium',
    reasoning: {
      decisionThreshold: 0.7,
      confidenceLevel: 0.8,
      maxProcessingTime: 1000,
      learningRate: 0.01
    },
    memory: {
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      maxEntries: 1000
    },
    perception: {
      minConfidence: 0.6,
      updateInterval: 10000 // 10 seconds
    },
    learning: {
      learningRate: 0.01,
      batchSize: 20
    }
  };

  // 2. Initialize the cognitive engine
  console.log('\n🔧 Initializing cognitive engine...');
  const engine = new SimpleCognitiveEngine(config);

  try {
    // 3. Start the engine
    await engine.start();

    // 4. Deploy a yield optimization agent
    console.log('\n🤖 Deploying yield optimization agent...');
    const agentId = await engine.deployAgent({
      type: 'yield_optimizer',
      budget: 5000, // $5,000 starting budget
      maxRisk: 0.25, // 25% maximum risk
      protocols: ['aave', 'compound'], // Focus on these protocols
      settings: {
        minAPY: 0.05, // 5% minimum APY
        rebalanceThreshold: 0.1, // 10% threshold for rebalancing
        maxPositionSize: 0.5 // 50% max in single position
      }
    });

    // 5. Process multiple rounds of market data
    console.log('\n📊 Processing market data updates...');
    
    for (let round = 1; round <= 12; round++) {
      // Generate realistic market data with trends
      const timeProgress = round / 12;
      const trendFactor = Math.sin(timeProgress * Math.PI * 2) * 0.1;
      const randomFactor = (Math.random() - 0.5) * 0.05;
      
      const marketData = {
        timestamp: Date.now(),
        prices: {
          'ETH/USD': 2500 + (trendFactor + randomFactor) * 2500,
          'BTC/USD': 45000 + (trendFactor + randomFactor) * 45000,
          'USDC/USD': 1.0,
          'DAI/USD': 0.999 + (Math.random() - 0.5) * 0.002
        },
        volume: 1500000000 * (0.7 + Math.random() * 0.6), // Variable volume
        volatility: 0.15 + Math.sin(timeProgress * Math.PI * 4) * 0.08 + Math.random() * 0.05
      };

      console.log(`\n📈 Round ${round}/12: Market Update`);
      console.log(`   ETH Price: $${marketData.prices['ETH/USD'].toFixed(2)}`);
      console.log(`   Volume: $${(marketData.volume / 1000000).toFixed(1)}M`);
      console.log(`   Volatility: ${(marketData.volatility * 100).toFixed(1)}%`);
      
      await engine.processMarketData(marketData);
      
      // Brief pause between rounds
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // 6. Show intermediate performance
    console.log('\n📊 Intermediate Performance Check:');
    const midStats = engine.getAgentStats(agentId);
    console.log(`   Decisions Made: ${midStats.decisions}`);
    console.log(`   Success Rate: ${(midStats.accuracy * 100).toFixed(1)}%`);
    console.log(`   Current Balance: $${midStats.budget.current.toFixed(2)}`);
    console.log(`   Profit/Loss: ${midStats.profitLoss >= 0 ? '+' : ''}$${midStats.profitLoss.toFixed(2)}`);
    console.log(`   Return: ${midStats.returnPercentage >= 0 ? '+' : ''}${midStats.returnPercentage.toFixed(2)}%`);

    // 7. Simulate continuous operation
    console.log('\n🔄 Simulating continuous market operation (20 seconds)...');
    
    const continuousStart = Date.now();
    const continuousDuration = 20000; // 20 seconds
    let updateCount = 0;
    
    while (Date.now() - continuousStart < continuousDuration) {
      updateCount++;
      
      // Generate dynamic market data with realistic patterns
      const elapsed = (Date.now() - continuousStart) / 1000;
      const marketCycle = Math.sin(elapsed * 0.5) * 0.1; // 10-second cycle
      const microTrend = Math.sin(elapsed * 2) * 0.02; // 2-second micro-trend
      const noise = (Math.random() - 0.5) * 0.01;
      
      const marketData = {
        timestamp: Date.now(),
        prices: {
          'ETH/USD': 2500 * (1 + marketCycle + microTrend + noise),
          'BTC/USD': 45000 * (1 + marketCycle * 0.8 + microTrend * 0.6 + noise),
          'USDC/USD': 1.0,
          'DAI/USD': 0.999 + (Math.random() - 0.5) * 0.001
        },
        volume: 1500000000 * (0.8 + Math.random() * 0.4 + Math.abs(marketCycle) * 0.5),
        volatility: 0.15 + Math.abs(marketCycle) * 0.1 + Math.random() * 0.03
      };

      await engine.processMarketData(marketData);
      
      // Show periodic updates
      if (updateCount % 5 === 0) {
        const progress = ((Date.now() - continuousStart) / continuousDuration * 100).toFixed(0);
        console.log(`   ⏱️  Progress: ${progress}% (${updateCount} updates processed)`);
      }
      
      // Dynamic update frequency based on volatility
      const updateDelay = 500 + (1 - marketData.volatility) * 1500; // 500-2000ms
      await new Promise(resolve => setTimeout(resolve, updateDelay));
    }

    // 8. Final comprehensive performance report
    console.log('\n' + '='.repeat(50));
    console.log('📈 FINAL PERFORMANCE REPORT');
    console.log('='.repeat(50));
    
    const finalStats = engine.getAgentStats(agentId);
    const finalMetrics = engine.getMetrics();
    
    console.log('\n🤖 Agent Performance:');
    console.log(`   Agent Type: ${finalStats.type}`);
    console.log(`   Status: ${finalStats.status}`);
    console.log(`   Uptime: ${(finalStats.uptime / 1000 / 60).toFixed(1)} minutes`);
    console.log(`   Total Decisions: ${finalStats.decisions}`);
    console.log(`   Successful Decisions: ${finalStats.successfulDecisions}`);
    console.log(`   Success Rate: ${(finalStats.accuracy * 100).toFixed(1)}%`);
    console.log(`   Win Rate: ${(finalStats.winRate * 100).toFixed(1)}%`);
    
    console.log('\n💰 Financial Performance:');
    console.log(`   Initial Budget: $${finalStats.budget.initial.toLocaleString()}`);
    console.log(`   Current Balance: $${finalStats.budget.current.toFixed(2)}`);
    console.log(`   Total Return: ${finalStats.profitLoss >= 0 ? '+' : ''}$${finalStats.profitLoss.toFixed(2)}`);
    console.log(`   Return Percentage: ${finalStats.returnPercentage >= 0 ? '+' : ''}${finalStats.returnPercentage.toFixed(2)}%`);
    console.log(`   Best Performance: +$${finalStats.performance.maxProfit.toFixed(2)}`);
    console.log(`   Worst Drawdown: $${finalStats.performance.maxLoss.toFixed(2)}`);
    console.log(`   Total Trades: ${finalStats.performance.totalTrades}`);
    console.log(`   Profitable Trades: ${finalStats.performance.profitableTrades}`);
    
    console.log('\n🔧 Engine Performance:');
    console.log(`   Active Agents: ${finalMetrics.technical.activeAgents}`);
    console.log(`   Total Decisions Processed: ${finalMetrics.operational.totalDecisions}`);
    console.log(`   Successful Decisions: ${finalMetrics.operational.successfulDecisions}`);
    console.log(`   Overall Success Rate: ${finalMetrics.operational.successRate}%`);
    console.log(`   Average Decision Time: ${finalMetrics.operational.avgDecisionTime}ms`);
    console.log(`   Memory Usage: ${finalMetrics.technical.memoryUsage}MB`);
    console.log(`   Processing Throughput: ${finalMetrics.technical.throughput} decisions/second`);
    console.log(`   Total Uptime: ${(finalMetrics.operational.uptime / 1000 / 60).toFixed(1)} minutes`);

    // 9. Performance analysis and insights
    console.log('\n📊 Performance Analysis:');
    if (finalStats.returnPercentage > 5) {
      console.log('   ✅ Excellent performance! Agent significantly outperformed expectations.');
    } else if (finalStats.returnPercentage > 0) {
      console.log('   ✅ Positive performance! Agent generated profit with good risk management.');
    } else if (finalStats.returnPercentage > -2) {
      console.log('   ⚠️  Marginal performance. Consider adjusting strategy parameters.');
    } else {
      console.log('   ❌ Poor performance. Strategy requires significant optimization.');
    }
    
    if (finalStats.accuracy > 0.8) {
      console.log('   ✅ High decision accuracy indicates strong market analysis capabilities.');
    } else if (finalStats.accuracy > 0.6) {
      console.log('   ✅ Good decision accuracy shows reliable cognitive reasoning.');
    } else {
      console.log('   ⚠️  Low decision accuracy suggests need for learning improvements.');
    }

  } catch (error) {
    console.error('\n❌ Error during execution:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // 10. Clean shutdown
    console.log('\n🛑 Shutting down cognitive engine...');
    await engine.stop();
  }

  console.log('\n🎉 Basic setup example completed successfully!');
  console.log('\n' + '='.repeat(50));
  console.log('✨ KEY ACHIEVEMENTS');
  console.log('='.repeat(50));
  console.log('✅ Successfully deployed and ran a yield optimization agent');
  console.log('✅ Processed multiple rounds of dynamic market data');
  console.log('✅ Demonstrated autonomous decision making with real-time adaptation');
  console.log('✅ Monitored comprehensive performance metrics');
  console.log('✅ Showcased profit/loss tracking and risk management');
  console.log('✅ Simulated realistic market conditions with volatility');
  
  console.log('\n🚀 NEXT STEPS');
  console.log('='.repeat(50));
  console.log('📚 Explore More Examples:');
  console.log('   • yield-farming-bot.js - Advanced yield optimization strategies');
  console.log('   • arbitrage-scanner.js - Cross-DEX arbitrage detection');
  console.log('   • portfolio-manager.js - Multi-agent portfolio management');
  console.log('   • risk-management.js - Advanced risk monitoring and protection');
  
  console.log('\n🔗 Real-World Integration:');
  console.log('   • Configure actual API keys in .env file');
  console.log('   • Deploy on testnet first for validation');
  console.log('   • Start with small amounts and monitor closely');
  console.log('   • Integrate with real DeFi protocols');
  console.log('   • Set up monitoring and alerting systems');
  
  console.log('\n📖 Documentation:');
  console.log('   • Read USAGE_GUIDE.md for detailed implementation patterns');
  console.log('   • Check API_REFERENCE.md for complete API documentation');
  console.log('   • Review README.md for architecture and features overview');
  
  console.log('\n💡 Pro Tips:');
  console.log('   • Always backtest strategies before deploying real funds');
  console.log('   • Use progressive budget allocation to minimize risk');
  console.log('   • Monitor correlation between agents to avoid concentration risk');
  console.log('   • Implement proper logging and alerting for production use');
  console.log('   • Consider regulatory compliance for your jurisdiction');
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicSetupExample().catch(console.error);
}

module.exports = { basicSetupExample };
