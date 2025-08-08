# 🧠 Exyra Cognitive Layer - API Reference

## Table of Contents

1. [Core Classes](#core-classes)
2. [Agent Types](#agent-types)
3. [Data Structures](#data-structures)
4. [Events](#events)
5. [Configuration](#configuration)
6. [Utility Functions](#utility-functions)

## Core Classes

### CognitiveEngine

The main orchestrator class that manages all cognitive operations.

```typescript
class CognitiveEngine extends EventEmitter {
  constructor(config: CognitiveConfig)
  
  // Core methods
  async start(): Promise<void>
  async stop(): Promise<void>
  async deployAgent(config: AgentConfig): Promise<string>
  async removeAgent(agentId: string): Promise<void>
  async processMarketData(data: MarketData): Promise<void>
  
  // Agent management
  getActiveAgents(): Agent[]
  getAgentStats(agentId: string): AgentStats
  getAgentConfig(agentId: string): AgentConfig
  async updateAgentConfig(agentId: string, config: Partial<AgentConfig>): Promise<void>
  
  // Performance monitoring
  getMetrics(): EngineMetrics
  getAgentMetrics(agentId: string): AgentMetrics
  getPerformanceReport(): PerformanceReport
  
  // Configuration
  updateConfig(config: Partial<CognitiveConfig>): Promise<void>
  getConfig(): CognitiveConfig
  
  // Component access
  getReasoningEngine(): ReasoningEngine
  getMemorySystem(): MemorySystem
  getPerceptionModule(): PerceptionModule
  getLearningModule(): LearningModule
}
```

#### Methods

##### `constructor(config: CognitiveConfig)`

Creates a new cognitive engine instance.

**Parameters:**
- `config`: Configuration object for the cognitive engine

**Example:**
```typescript
const engine = new CognitiveEngine({
  reasoning: {
    decisionThreshold: 0.75,
    maxProcessingTime: 500,
    learningRate: 0.01
  },
  memory: {
    retentionPeriod: 24 * 60 * 60 * 1000,
    maxEntries: 10000
  }
});
```

##### `async start(): Promise<void>`

Initializes and starts the cognitive engine.

**Returns:** Promise that resolves when the engine is fully started

**Example:**
```typescript
await engine.start();
console.log('Cognitive engine started');
```

##### `async deployAgent(config: AgentConfig): Promise<string>`

Deploys a new agent with the specified configuration.

**Parameters:**
- `config`: Agent configuration object

**Returns:** Promise that resolves to the agent ID

**Example:**
```typescript
const agentId = await engine.deployAgent({
  type: 'yield_optimizer',
  budget: 10000,
  maxRisk: 0.25,
  protocols: ['aave', 'compound']
});
```

##### `async processMarketData(data: MarketData): Promise<void>`

Processes market data through the cognitive pipeline.

**Parameters:**
- `data`: Market data object

**Example:**
```typescript
await engine.processMarketData({
  timestamp: Date.now(),
  prices: { 'ETH/USD': 2500 },
  protocols: { aave: { apy: 0.08 } },
  volume: 1000000,
  volatility: 0.15
});
```

### ReasoningEngine

Handles decision-making logic and strategy evaluation.

```typescript
class ReasoningEngine {
  constructor(config: ReasoningConfig)
  
  // Decision making
  async makeDecision(input: DecisionInput): Promise<Decision>
  async evaluateOpportunities(data: MarketData): Promise<OpportunitySignal[]>
  async assessRisk(decision: Decision): Promise<RiskAssessment>
  
  // Strategy management
  async optimizeStrategy(agentId: string, performance: PerformanceData): Promise<void>
  getStrategyParameters(agentId: string): StrategyParameters
  
  // Learning integration
  async updateFromOutcome(decision: Decision, outcome: Outcome): Promise<void>
  getDecisionHistory(agentId?: string): Decision[]
}
```

#### Methods

##### `async makeDecision(input: DecisionInput): Promise<Decision>`

Makes a decision based on the provided input.

**Parameters:**
- `input`: Decision input containing market data, context, and constraints

**Returns:** Decision object with recommendation and confidence

**Example:**
```typescript
const decision = await reasoning.makeDecision({
  marketData: currentMarketData,
  agentId: 'agent-123',
  context: { 
    currentPositions: portfolio.positions,
    availableBudget: 5000
  },
  constraints: {
    maxRisk: 0.2,
    minProfit: 50
  }
});
```

##### `async evaluateOpportunities(data: MarketData): Promise<OpportunitySignal[]>`

Identifies and evaluates potential opportunities in market data.

**Parameters:**
- `data`: Current market data

**Returns:** Array of opportunity signals

**Example:**
```typescript
const opportunities = await reasoning.evaluateOpportunities(marketData);
console.log(`Found ${opportunities.length} opportunities`);
```

### MemorySystem

Manages short-term and long-term memory for the cognitive system.

```typescript
class MemorySystem {
  constructor(config: MemoryConfig)
  
  // Memory operations
  async store(type: string, data: any, metadata?: MemoryMetadata): Promise<void>
  async retrieve(type: string, query?: any): Promise<any[]>
  async update(id: string, data: any): Promise<void>
  async delete(id: string): Promise<void>
  
  // Pattern analysis
  async findPatterns(category: string): Promise<Pattern[]>
  async analyzePerformance(timeframe?: number): Promise<AnalysisResult>
  
  // Learning data
  async getLearningData(limit?: number): Promise<LearningDataPoint[]>
  async consolidateMemory(): Promise<void>
  
  // Cleanup
  async cleanup(): Promise<void>
  getMemoryStats(): MemoryStats
}
```

#### Methods

##### `async store(type: string, data: any, metadata?: MemoryMetadata): Promise<void>`

Stores data in memory with optional metadata.

**Parameters:**
- `type`: Category of memory (e.g., 'decision', 'outcome', 'pattern')
- `data`: Data to store
- `metadata`: Optional metadata for the memory entry

**Example:**
```typescript
await memory.store('successful_trade', {
  strategy: 'yield_farming',
  protocol: 'aave',
  return: 0.12,
  duration: 3600000
}, {
  confidence: 0.9,
  importance: 'high'
});
```

##### `async findPatterns(category: string): Promise<Pattern[]>`

Finds patterns in stored memory data.

**Parameters:**
- `category`: Category to search for patterns

**Returns:** Array of identified patterns

**Example:**
```typescript
const patterns = await memory.findPatterns('arbitrage');
console.log('Arbitrage patterns:', patterns);
```

### PerceptionModule

Processes and filters incoming market data.

```typescript
class PerceptionModule {
  constructor(config: PerceptionConfig)
  
  // Data processing
  async processMarketData(data: MarketData): Promise<ProcessedData>
  async detectOpportunities(data: MarketData): Promise<OpportunitySignal[]>
  async filterSignals(signals: Signal[]): Promise<Signal[]>
  
  // Data sources
  addDataSource(source: DataSource): void
  removeDataSource(sourceId: string): void
  getDataSources(): DataSource[]
  
  // Real-time processing
  startProcessing(): void
  stopProcessing(): void
  getProcessingStats(): ProcessingStats
}
```

#### Methods

##### `async processMarketData(data: MarketData): Promise<ProcessedData>`

Processes raw market data into structured format.

**Parameters:**
- `data`: Raw market data

**Returns:** Processed and normalized data

**Example:**
```typescript
const processed = await perception.processMarketData(rawData);
console.log('Processed data:', processed);
```

##### `async detectOpportunities(data: MarketData): Promise<OpportunitySignal[]>`

Detects potential opportunities in market data.

**Parameters:**
- `data`: Market data to analyze

**Returns:** Array of opportunity signals

**Example:**
```typescript
const opportunities = await perception.detectOpportunities(marketData);
opportunities.forEach(op => {
  console.log(`Opportunity: ${op.type} - Confidence: ${op.confidence}`);
});
```

### LearningModule

Handles continuous learning and model optimization.

```typescript
class LearningModule {
  constructor(config: LearningConfig)
  
  // Training
  async train(data: TrainingData[], outcomes: Outcome[]): Promise<void>
  async updateModel(feedback: Feedback): Promise<void>
  async retrain(): Promise<void>
  
  // Performance
  async evaluateModel(): Promise<ModelPerformance>
  getModelStats(): ModelStats
  
  // Configuration
  updateLearningRate(rate: number): void
  setBatchSize(size: number): void
  setValidationSplit(split: number): void
}
```

#### Methods

##### `async train(data: TrainingData[], outcomes: Outcome[]): Promise<void>`

Trains the learning model with provided data and outcomes.

**Parameters:**
- `data`: Training data array
- `outcomes`: Corresponding outcomes

**Example:**
```typescript
await learning.train(trainingData, outcomes);
console.log('Model training completed');
```

##### `async evaluateModel(): Promise<ModelPerformance>`

Evaluates current model performance.

**Returns:** Model performance metrics

**Example:**
```typescript
const performance = await learning.evaluateModel();
console.log(`Model accuracy: ${performance.accuracy}`);
```

## Agent Types

### BaseAgent

Base class for all agent types.

```typescript
abstract class BaseAgent {
  constructor(config: AgentConfig)
  
  // Core methods
  abstract async analyze(data: MarketData): Promise<Decision[]>
  abstract async execute(decision: Decision): Promise<ExecutionResult>
  
  // Lifecycle
  async start(): Promise<void>
  async stop(): Promise<void>
  async pause(): Promise<void>
  async resume(): Promise<void>
  
  // Configuration
  updateConfig(config: Partial<AgentConfig>): void
  getConfig(): AgentConfig
  
  // Performance
  getStats(): AgentStats
  getPerformance(): PerformanceMetrics
}
```

### YieldOptimizer

Agent specialized in yield optimization strategies.

```typescript
class YieldOptimizer extends BaseAgent {
  async analyze(data: MarketData): Promise<Decision[]>
  async execute(decision: Decision): Promise<ExecutionResult>
  
  // Yield-specific methods
  async findBestYield(protocols: string[]): Promise<YieldOpportunity[]>
  async calculateOptimalAllocation(budget: number): Promise<Allocation[]>
  async rebalancePositions(): Promise<RebalanceResult>
}
```

### ArbitrageHunter

Agent specialized in arbitrage opportunities.

```typescript
class ArbitrageHunter extends BaseAgent {
  async analyze(data: MarketData): Promise<Decision[]>
  async execute(decision: Decision): Promise<ExecutionResult>
  
  // Arbitrage-specific methods
  async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]>
  async calculateProfitability(opportunity: ArbitrageOpportunity): Promise<number>
  async executeTrade(trade: ArbitrageTrade): Promise<TradeResult>
}
```

### RiskManager

Agent specialized in risk management.

```typescript
class RiskManager extends BaseAgent {
  async analyze(data: MarketData): Promise<Decision[]>
  async execute(decision: Decision): Promise<ExecutionResult>
  
  // Risk-specific methods
  async assessPortfolioRisk(): Promise<RiskAssessment>
  async calculateVaR(confidence: number): Promise<number>
  async triggerStopLoss(position: Position): Promise<void>
  async rebalanceForRisk(): Promise<RebalanceResult>
}
```

## Data Structures

### CognitiveConfig

Configuration for the cognitive engine.

```typescript
interface CognitiveConfig {
  reasoning: ReasoningConfig;
  memory: MemoryConfig;
  perception: PerceptionConfig;
  learning: LearningConfig;
  debug?: DebugConfig;
}

interface ReasoningConfig {
  decisionThreshold: number;        // 0.0 - 1.0
  confidenceLevel: number;          // 0.0 - 1.0
  maxProcessingTime: number;        // milliseconds
  learningRate: number;             // 0.0 - 1.0
  parallelProcessing?: boolean;
  cacheEnabled?: boolean;
}

interface MemoryConfig {
  retentionPeriod: number;          // milliseconds
  maxEntries: number;
  longTermThreshold: number;        // 0.0 - 1.0
  cleanupInterval: number;          // milliseconds
  compressionEnabled?: boolean;
}

interface PerceptionConfig {
  minConfidence: number;            // 0.0 - 1.0
  updateInterval: number;           // milliseconds
  maxSignalsPerCycle: number;
  signalFiltering?: boolean;
  batchSize?: number;
}

interface LearningConfig {
  learningRate: number;             // 0.0 - 1.0
  batchSize: number;
  maxHistory: number;
  validationSplit?: number;         // 0.0 - 1.0
  autoRetrain?: boolean;
}
```

### AgentConfig

Configuration for individual agents.

```typescript
interface AgentConfig {
  type: AgentType;
  budget: number;
  maxRisk: number;                  // 0.0 - 1.0
  protocols?: string[];
  chains?: string[];
  settings?: AgentSettings;
}

type AgentType = 'yield_optimizer' | 'arbitrage_hunter' | 'risk_manager' | 'mev_protector' | 'portfolio_manager';

interface AgentSettings {
  [key: string]: any;
  
  // Common settings
  minProfit?: number;
  maxSlippage?: number;
  gasThreshold?: number;
  timeoutMs?: number;
  
  // Yield optimizer settings
  minAPY?: number;
  targetAPY?: number;
  rebalanceThreshold?: number;
  
  // Arbitrage hunter settings
  minSpread?: number;
  maxConcurrentTrades?: number;
  
  // Risk manager settings
  stopLoss?: number;
  maxDrawdown?: number;
  correlationThreshold?: number;
}
```

### MarketData

Market data structure for processing.

```typescript
interface MarketData {
  timestamp: number;
  prices: Record<string, number>;
  protocols: Record<string, ProtocolData>;
  volume: number;
  volatility: number;
  sentiment?: SentimentData;
  news?: NewsData[];
}

interface ProtocolData {
  apy: number;
  tvl: number;
  liquidity?: number;
  fees?: number;
  risk?: number;
}

interface SentimentData {
  score: number;                    // -1.0 to 1.0
  confidence: number;               // 0.0 to 1.0
  sources: string[];
}

interface NewsData {
  title: string;
  content: string;
  source: string;
  timestamp: number;
  sentiment: number;                // -1.0 to 1.0
  relevance: number;                // 0.0 to 1.0
}
```

### Decision

Decision structure returned by agents.

```typescript
interface Decision {
  id: string;
  agentId: string;
  timestamp: number;
  type: DecisionType;
  action: ActionType;
  asset?: string;
  protocol?: string;
  amount: number;
  confidence: number;               // 0.0 to 1.0
  expectedReturn: number;
  risk: number;                     // 0.0 to 1.0
  reasoning: string;
  metadata?: Record<string, any>;
}

type DecisionType = 'invest' | 'divest' | 'rebalance' | 'hedge' | 'arbitrage' | 'yield_farm';
type ActionType = 'buy' | 'sell' | 'hold' | 'provide_liquidity' | 'remove_liquidity' | 'stake' | 'unstake';
```

### OpportunitySignal

Signal structure for identified opportunities.

```typescript
interface OpportunitySignal {
  id: string;
  timestamp: number;
  type: OpportunityType;
  confidence: number;               // 0.0 to 1.0
  expectedProfit: number;
  risk: number;                     // 0.0 to 1.0
  timeWindow: number;               // milliseconds
  protocols: string[];
  chains?: string[];
  requirements: {
    minBudget: number;
    maxRisk: number;
    skills: string[];
  };
  metadata: Record<string, any>;
}

type OpportunityType = 'yield' | 'arbitrage' | 'liquidation' | 'mev' | 'governance';
```

### PerformanceMetrics

Performance metrics for agents and engine.

```typescript
interface PerformanceMetrics {
  totalReturn: number;
  profitLoss: number;
  winRate: number;                  // 0.0 to 1.0
  sharpeRatio: number;
  maxDrawdown: number;
  avgExecutionTime: number;         // milliseconds
  gasEfficiency: number;            // 0.0 to 1.0
  accuracy: number;                 // 0.0 to 1.0
  decisions: number;
  successfulDecisions: number;
  gasUsed: number;
}

interface AgentStats extends PerformanceMetrics {
  agentId: string;
  type: AgentType;
  status: AgentStatus;
  uptime: number;                   // milliseconds
  lastDecision: number;             // timestamp
  budget: {
    initial: number;
    current: number;
    allocated: number;
  };
  positions: Position[];
}

type AgentStatus = 'active' | 'paused' | 'stopped' | 'error';

interface Position {
  protocol: string;
  asset: string;
  amount: number;
  value: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  duration: number;                 // milliseconds
}
```

## Events

The cognitive engine emits various events for monitoring and integration.

### Engine Events

```typescript
// Engine lifecycle
engine.on('started', () => { /* Engine started */ });
engine.on('stopped', () => { /* Engine stopped */ });
engine.on('error', (error: CognitiveError) => { /* Error occurred */ });

// Agent events
engine.on('agent_deployed', (agentId: string, config: AgentConfig) => { /* Agent deployed */ });
engine.on('agent_removed', (agentId: string) => { /* Agent removed */ });
engine.on('agent_error', (agentId: string, error: Error) => { /* Agent error */ });

// Decision events
engine.on('decision_made', (decision: Decision) => { /* Decision made */ });
engine.on('decision_executed', (result: ExecutionResult) => { /* Decision executed */ });
engine.on('decision_failed', (decision: Decision, error: Error) => { /* Decision failed */ });

// Opportunity events
engine.on('opportunity', (opportunity: OpportunitySignal) => { /* Opportunity detected */ });
engine.on('opportunity_expired', (opportunityId: string) => { /* Opportunity expired */ });

// Risk events
engine.on('risk_alert', (alert: RiskAlert) => { /* Risk alert */ });
engine.on('emergency_stop', (reason: string) => { /* Emergency stop triggered */ });

// Performance events
engine.on('performance_update', (metrics: PerformanceMetrics) => { /* Performance updated */ });
engine.on('milestone_reached', (milestone: Milestone) => { /* Milestone reached */ });
```

### Event Data Structures

```typescript
interface CognitiveError extends Error {
  type: ErrorType;
  agentId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  metadata?: Record<string, any>;
}

type ErrorType = 'decision_timeout' | 'memory_overflow' | 'api_error' | 'execution_error' | 'network_error';

interface ExecutionResult {
  decisionId: string;
  success: boolean;
  profit?: number;
  gasUsed?: number;
  executionTime: number;           // milliseconds
  error?: string;
  metadata?: Record<string, any>;
}

interface RiskAlert {
  type: RiskAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string;
  message: string;
  currentValue: number;
  threshold: number;
  recommendation: string;
  timestamp: number;
}

type RiskAlertType = 'portfolio_loss' | 'high_volatility' | 'liquidity_low' | 'correlation_high' | 'drawdown_exceeded';

interface Milestone {
  type: MilestoneType;
  value: number;
  threshold: number;
  agentId?: string;
  timestamp: number;
  description: string;
}

type MilestoneType = 'profit_target' | 'trades_completed' | 'accuracy_improved' | 'uptime_achieved';
```

## Configuration

### Environment Variables

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key
COINGECKO_API_KEY=your_coingecko_api_key
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional Configuration
COGNITIVE_LOG_LEVEL=info           # debug, info, warn, error
COGNITIVE_MAX_AGENTS=20
COGNITIVE_MEMORY_SIZE=100000
COGNITIVE_CACHE_TTL=300000         # 5 minutes

# Network Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_key
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Performance Settings
COGNITIVE_PARALLEL_PROCESSING=true
COGNITIVE_BATCH_SIZE=50
COGNITIVE_UPDATE_INTERVAL=5000     # 5 seconds
```

### Configuration Validation

```typescript
import { validateConfig } from '@exyra/cognitive-layer';

// Validate configuration before creating engine
const config = {
  reasoning: { decisionThreshold: 0.75 },
  memory: { retentionPeriod: 86400000 },
  perception: { minConfidence: 0.7 },
  learning: { learningRate: 0.01 }
};

const validation = validateConfig(config);
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
} else {
  const engine = new CognitiveEngine(config);
}
```

## Utility Functions

### Data Utilities

```typescript
import { 
  normalizePrice, 
  calculateVolatility, 
  calculateSharpeRatio, 
  formatCurrency,
  calculateAPY
} from '@exyra/cognitive-layer/utils';

// Price normalization
const normalizedPrice = normalizePrice(2500.123, 'ETH/USD');

// Volatility calculation
const volatility = calculateVolatility(priceHistory);

// Performance metrics
const sharpeRatio = calculateSharpeRatio(returns, riskFreeRate);

// Formatting
const formatted = formatCurrency(1234.56, 'USD');

// Yield calculations
const apy = calculateAPY(principal, interest, timeInYears);
```

### Validation Utilities

```typescript
import { 
  validateMarketData, 
  validateAgentConfig, 
  validateDecision,
  sanitizeInput
} from '@exyra/cognitive-layer/utils';

// Data validation
const isValid = validateMarketData(marketData);
const configValid = validateAgentConfig(agentConfig);
const decisionValid = validateDecision(decision);

// Input sanitization
const clean = sanitizeInput(userInput);
```

### Performance Utilities

```typescript
import { 
  ProfilerUtility, 
  MemoryMonitor, 
  PerformanceAnalyzer 
} from '@exyra/cognitive-layer/utils';

// Performance profiling
const profiler = new ProfilerUtility();
profiler.start('decision_making');
// ... decision making code ...
const result = profiler.stop('decision_making');

// Memory monitoring
const monitor = new MemoryMonitor();
monitor.startMonitoring();
const memoryStats = monitor.getStats();

// Performance analysis
const analyzer = new PerformanceAnalyzer();
const analysis = analyzer.analyze(performanceData);
```

### Debugging Utilities

```typescript
import { 
  DebugLogger, 
  TraceCollector, 
  ErrorReporter 
} from '@exyra/cognitive-layer/utils';

// Debug logging
const logger = new DebugLogger({ level: 'debug' });
logger.debug('Decision made', { decision, confidence: 0.85 });

// Trace collection
const tracer = new TraceCollector();
tracer.trace('agent_decision', { agentId, timestamp });

// Error reporting
const reporter = new ErrorReporter();
reporter.report(error, { context: 'decision_execution' });
```

---

This API reference provides comprehensive documentation for all public interfaces, methods, and data structures in the Exyra Cognitive Layer.
