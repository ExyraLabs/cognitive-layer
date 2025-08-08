import { EventEmitter } from 'events';
import { ReasoningEngine } from './reasoning';
import { MemorySystem } from './memory';
import { PerceptionModule } from './perception';
import { LearningModule } from './learning';
import { 
  CognitiveConfig, 
  AgentConfig, 
  MarketData, 
  Decision, 
  AgentStats,
  PerformanceMetrics,
  EngineMetrics
} from '../types';

export class CognitiveEngine extends EventEmitter {
  private reasoning: ReasoningEngine;
  private memory: MemorySystem;
  private perception: PerceptionModule;
  private learning: LearningModule;
  private agents: Map<string, any> = new Map();
  private isRunning: boolean = false;
  private config: CognitiveConfig;
  private stats = {
    decisions: 0,
    successfulDecisions: 0,
    totalProcessingTime: 0,
    startTime: 0
  };

  constructor(config: CognitiveConfig) {
    super();
    this.config = config;
    
    // Initialize components
    this.reasoning = new ReasoningEngine(config.reasoning);
    this.memory = new MemorySystem(config.memory);
    this.perception = new PerceptionModule(config.perception);
    this.learning = new LearningModule(config.learning);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Cognitive engine is already running');
    }

    this.stats.startTime = Date.now();
    this.isRunning = true;
    
    // Start all components
    await this.reasoning.start();
    await this.memory.start();
    await this.perception.start();
    await this.learning.start();

    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    // Stop all agents
    for (const [agentId, agent] of this.agents) {
      await this.removeAgent(agentId);
    }

    this.emit('stopped');
  }

  async deployAgent(config: AgentConfig): Promise<string> {
    if (!this.isRunning) {
      throw new Error('Cognitive engine is not running');
    }

    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create mock agent for demo purposes
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
    this.emit('agent_deployed', agentId, config);
    
    return agentId;
  }

  async removeAgent(agentId: string): Promise<void> {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.agents.delete(agentId);
    this.emit('agent_removed', agentId);
  }

  async processMarketData(data: MarketData): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Cognitive engine is not running');
    }

    const startTime = Date.now();

    try {
      // Process through perception
      const processedData = await this.perception.processMarketData(data);
      
      // Find opportunities
      const opportunities = await this.perception.detectOpportunities(processedData);
      
      // Make decisions for each agent
      for (const [agentId, agent] of this.agents) {
        try {
          const decision = await this.reasoning.makeDecision({
            agentId,
            marketData: processedData,
            opportunities,
            agentConfig: agent.config
          });

          if (decision) {
            this.stats.decisions++;
            agent.stats.decisions++;
            
            // Mock execution success (80% success rate)
            const success = Math.random() > 0.2;
            if (success) {
              this.stats.successfulDecisions++;
              agent.stats.successfulDecisions++;
              agent.stats.profit += decision.expectedReturn;
            }

            this.emit('decision_made', decision);
          }
        } catch (error) {
          this.emit('agent_error', agentId, error);
        }
      }

      // Emit opportunities
      opportunities.forEach(opportunity => {
        this.emit('opportunity', opportunity);
      });

    } catch (error) {
      this.emit('error', error);
    } finally {
      const processingTime = Date.now() - startTime;
      this.stats.totalProcessingTime += processingTime;
    }
  }

  getActiveAgents(): any[] {
    return Array.from(this.agents.values());
  }

  getAgentStats(agentId: string): AgentStats {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const uptime = Date.now() - agent.stats.uptime;
    const winRate = agent.stats.decisions > 0 ? 
      agent.stats.successfulDecisions / agent.stats.decisions : 0;

    return {
      agentId,
      type: agent.type,
      status: agent.status,
      uptime,
      lastDecision: Date.now(),
      budget: {
        initial: agent.config.budget,
        current: agent.config.budget + agent.stats.profit,
        allocated: agent.config.budget * 0.8 // Mock 80% allocation
      },
      positions: [], // Mock empty positions for demo
      totalReturn: agent.stats.profit,
      profitLoss: agent.stats.profit,
      winRate,
      sharpeRatio: winRate * 2, // Mock calculation
      maxDrawdown: 0.05, // Mock 5% max drawdown
      avgExecutionTime: 45, // Mock 45ms avg execution
      gasEfficiency: 0.92, // Mock 92% gas efficiency
      accuracy: winRate,
      decisions: agent.stats.decisions,
      successfulDecisions: agent.stats.successfulDecisions,
      gasUsed: agent.stats.decisions * 21000 // Mock gas usage
    };
  }

  getMetrics(): EngineMetrics {
    const uptime = Date.now() - this.stats.startTime;
    const avgDecisionTime = this.stats.decisions > 0 ? 
      this.stats.totalProcessingTime / this.stats.decisions : 0;
    const successRate = this.stats.decisions > 0 ? 
      this.stats.successfulDecisions / this.stats.decisions : 0;

    return {
      operational: {
        totalDecisions: this.stats.decisions,
        avgDecisionTime,
        successRate,
        uptime
      },
      performance: {
        totalReturn: 0, // Mock
        profitLoss: 0,
        winRate: successRate,
        sharpeRatio: successRate * 1.5,
        maxDrawdown: 0.03,
        avgExecutionTime: avgDecisionTime,
        gasEfficiency: 0.94,
        accuracy: successRate,
        decisions: this.stats.decisions,
        successfulDecisions: this.stats.successfulDecisions,
        gasUsed: this.stats.decisions * 21000
      },
      technical: {
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: 0.15, // Mock 15% CPU usage
        latency: avgDecisionTime,
        throughput: this.stats.decisions / (uptime / 1000) || 0
      }
    };
  }

  // Component accessors
  getReasoningEngine(): ReasoningEngine {
    return this.reasoning;
  }

  getMemorySystem(): MemorySystem {
    return this.memory;
  }

  getPerceptionModule(): PerceptionModule {
    return this.perception;
  }

  getLearningModule(): LearningModule {
    return this.learning;
  }
}

export default CognitiveEngine;
