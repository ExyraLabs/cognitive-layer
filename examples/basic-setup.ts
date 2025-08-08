/**
 * Basic Setup Example
 * 
 * This example demonstrates the simplest way to set up the Exyra Cognitive Layer
 * with a single yield optimization agent. This uses a simplified mock implementation
 * for demonstration purposes.
 */

// Simple mock types for demonstration
interface SimpleMarketData {
  timestamp: number;
  prices: Record<string, number>;
  volume: number;
  volatility: number;
}

interface SimpleAgentConfig {
  type: string;
  budget: number;
  maxRisk: number;
  protocols: string[];
  settings?: Record<string, any>;
}

interface SimpleAgentStats {
  status: string;
  decisions: number;
  accuracy: number;
  budget: {
    current: number;
    allocated: number;
  };
  profitLoss: number;
  winRate: number;
}

interface SimpleEngineMetrics {
  operational: {
    totalDecisions: number;
    avgDecisionTime: number;
    successRate: number;
  };
  technical: {
    latency: number;
    memoryUsage: number;
    throughput: number;
  };
}

// Mock Cognitive Engine for demonstration
class SimpleCognitiveEngine {
  private agents: Map<string, any> = new Map();
  private isRunning: boolean = false;
  private stats = {
    decisions: 0,
    successfulDecisions: 0,
    totalProcessingTime: 0,
    startTime: 0
  };

  constructor(config: any) {
    console.log('🔧 Cognitive Engine initialized');
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.stats.startTime = Date.now();
    console.log('✅ Cognitive engine started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('🛑 Cognitive engine stopped');
  }

  async deployAgent(config: SimpleAgentConfig): Promise<string> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agent = {
      id: agentId,
      type: config.type,
      config,
      status: 'active',
      stats: {
        decisions: 0,
        successfulDecisions: 0,
        profit: 0,
        uptime: Date.now()
      }
    };

    this.agents.set(agentId, agent);
    console.log(`✅ Agent deployed: ${agentId} (${config.type})`);
    
    return agentId;
  }

  async processMarketData(data: SimpleMarketData): Promise<void> {
    const startTime = Date.now();

    // Simulate processing for each agent
    for (const [agentId, agent] of this.agents) {
      // Simulate decision making (70% chance of making a decision)
      if (Math.random() > 0.3) {
        this.stats.decisions++;
        agent.stats.decisions++;
        
        // Simulate success (80% success rate)
        const success = Math.random() > 0.2;
        if (success) {
          this.stats.successfulDecisions++;
          agent.stats.successfulDecisions++;
          const profit = (Math.random() - 0.3) * 100; // Random profit/loss
          agent.stats.profit += profit;
        }

        // Simulate some events
        if (Math.random() > 0.7) {
          console.log(`📊 Decision made by ${agentId}: ${success ? 'SUCCESS' : 'FAILED'}`);
        }
        
        if (Math.random() > 0.8) {
          console.log(`🎯 Opportunity detected: Yield farming (Expected: $${(Math.random() * 200 + 50).toFixed(2)})`);
        }
      }
    }

    const processingTime = Date.now() - startTime;
    this.stats.totalProcessingTime += processingTime;
  }

  getActiveAgents(): any[] {
    return Array.from(this.agents.values());
  }

  getAgentStats(agentId: string): SimpleAgentStats {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const winRate = agent.stats.decisions > 0 ? 
      agent.stats.successfulDecisions / agent.stats.decisions : 0;

    return {
      status: agent.status,
      decisions: agent.stats.decisions,
      accuracy: winRate,
      budget: {
        current: agent.config.budget + agent.stats.profit,
        allocated: agent.config.budget * 0.8
      },
      profitLoss: agent.stats.profit,
      winRate
    };
  }

  getMetrics(): SimpleEngineMetrics {
    const avgDecisionTime = this.stats.decisions > 0 ? 
      this.stats.totalProcessingTime / this.stats.decisions : 0;
    const successRate = this.stats.decisions > 0 ? 
      this.stats.successfulDecisions / this.stats.decisions : 0;
    const uptime = Date.now() - this.stats.startTime;

    return {
      operational: {
        totalDecisions: this.stats.decisions,
        avgDecisionTime,
        successRate
      },
      technical: {
        latency: avgDecisionTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        throughput: this.stats.decisions / (uptime / 1000) || 0
      }
    };
  }
}

async function basicSetupExample() {
  console.log('🧠 Exyra Cognitive Layer - Basic Setup Example');
  console.log('=============================================');

  // 1. Create a simple configuration
  const config = {
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
  console.log('Initializing cognitive engine...');
  const engine = new SimpleCognitiveEngine(config);

  try {
    // 3. Start the engine
    await engine.start();

    // 4. Deploy a simple yield optimization agent
    console.log('Deploying yield optimization agent...');
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

    // 5. Process some sample market data multiple times
    console.log('Processing market data updates...');
    
    for (let i = 0; i < 10; i++) {
      const sampleMarketData: SimpleMarketData = {
        timestamp: Date.now(),
        prices: {
          'ETH/USD': 2500 + (Math.random() - 0.5) * 100,
          'BTC/USD': 45000 + (Math.random() - 0.5) * 2000,
          'USDC/USD': 1.0,
          'DAI/USD': 0.999 + (Math.random() - 0.5) * 0.002
        },
        volume: 1500000000 * (0.8 + Math.random() * 0.4),
        volatility: 0.15 + (Math.random() - 0.5) * 0.05
      };

      await engine.processMarketData(sampleMarketData);
      
      // Wait briefly between updates
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 6. Check agent performance
    console.log('\n📊 Agent Performance Report:');
    const stats = engine.getAgentStats(agentId);
    console.log(`  Status: ${stats.status}`);
    console.log(`  Decisions Made: ${stats.decisions}`);
    console.log(`  Success Rate: ${(stats.accuracy * 100).toFixed(2)}%`);
    console.log(`  Current Budget: $${stats.budget.current.toFixed(2)}`);
    console.log(`  Allocated Amount: $${stats.budget.allocated.toFixed(2)}`);
    console.log(`  Profit/Loss: $${stats.profitLoss.toFixed(2)}`);
    console.log(`  Win Rate: ${(stats.winRate * 100).toFixed(2)}%`);

    // 7. Get overall engine metrics
    console.log('\n🔧 Engine Performance Metrics:');
    const metrics = engine.getMetrics();
    console.log(`  Active Agents: ${engine.getActiveAgents().length}`);
    console.log(`  Total Decisions: ${metrics.operational.totalDecisions}`);
    console.log(`  Average Decision Time: ${metrics.operational.avgDecisionTime.toFixed(2)}ms`);
    console.log(`  Success Rate: ${(metrics.operational.successRate * 100).toFixed(2)}%`);
    console.log(`  Memory Usage: ${metrics.technical.memoryUsage.toFixed(2)}MB`);
    console.log(`  Throughput: ${metrics.technical.throughput.toFixed(2)} decisions/second`);

    // 8. Simulate continuous operation for a short time
    console.log('\n� Simulating continuous operation (15 seconds)...');
    
    const simulationDuration = 15000; // 15 seconds
    const updateInterval = 2000; // 2 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < simulationDuration) {
      // Generate dynamic market data
      const marketData: SimpleMarketData = {
        timestamp: Date.now(),
        prices: {
          'ETH/USD': 2500 + Math.sin(Date.now() / 10000) * 200,
          'BTC/USD': 45000 + Math.cos(Date.now() / 8000) * 3000,
          'USDC/USD': 1.0,
          'DAI/USD': 0.999 + (Math.random() - 0.5) * 0.001
        },
        volume: 1500000000 * (0.8 + Math.random() * 0.4),
        volatility: 0.15 + Math.sin(Date.now() / 5000) * 0.05
      };

      await engine.processMarketData(marketData);
      await new Promise(resolve => setTimeout(resolve, updateInterval));
    }

    // 9. Final performance report
    console.log('\n📈 Final Performance Report:');
    const finalStats = engine.getAgentStats(agentId);
    const finalMetrics = engine.getMetrics();
    
    console.log('Agent Performance:');
    console.log(`  Total Decisions: ${finalStats.decisions}`);
    console.log(`  Final Balance: $${finalStats.budget.current.toFixed(2)}`);
    console.log(`  Total Return: $${finalStats.profitLoss.toFixed(2)}`);
    console.log(`  Return Percentage: ${((finalStats.profitLoss / 5000) * 100).toFixed(2)}%`);
    console.log(`  Win Rate: ${(finalStats.winRate * 100).toFixed(2)}%`);
    
    console.log('\nEngine Performance:');
    console.log(`  Total Decisions Processed: ${finalMetrics.operational.totalDecisions}`);
    console.log(`  Average Processing Time: ${finalMetrics.operational.avgDecisionTime.toFixed(2)}ms`);
    console.log(`  Overall Success Rate: ${(finalMetrics.operational.successRate * 100).toFixed(2)}%`);
    console.log(`  Peak Memory Usage: ${finalMetrics.technical.memoryUsage.toFixed(2)}MB`);
    console.log(`  Average Throughput: ${finalMetrics.technical.throughput.toFixed(2)} decisions/second`);

  } catch (error) {
    console.error('❌ Error during execution:', error);
  } finally {
    // 10. Clean shutdown
    console.log('\n🛑 Shutting down cognitive engine...');
    await engine.stop();
  }

  console.log('\n🎉 Basic setup example completed successfully!');
  console.log('\nKey Takeaways:');
  console.log('- ✅ Successfully deployed and ran a yield optimization agent');
  console.log('- ✅ Processed multiple rounds of market data');
  console.log('- ✅ Monitored real-time performance metrics');
  console.log('- ✅ Demonstrated autonomous decision making');
  
  console.log('\nNext Steps:');
  console.log('- 🚀 Try the yield-farming-bot.ts example for more advanced features');
  console.log('- 🤖 Explore custom agent creation with custom-agent.ts');
  console.log('- 📊 Set up real-time monitoring with dashboard.ts');
  console.log('- 🔗 Integrate with real DeFi protocols using the full API');
  
  console.log('\n💡 To use with real funds and protocols:');
  console.log('- Configure actual API keys in .env file');
  console.log('- Deploy on testnet first for validation');
  console.log('- Start with small amounts and monitor closely');
  console.log('- Review risk parameters carefully');
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicSetupExample().catch(console.error);
}

export { basicSetupExample };
