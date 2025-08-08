/**
 * Core type definitions for the Exyra Cognitive Layer
 */

export interface CognitiveConfig {
  apiKeys: {
    openai?: string;
    coingecko?: string;
    infura?: string;
    etherscan?: string;
  };
  networks: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  reasoning?: ReasoningConfig;
  memory?: MemoryConfig;
  perception?: PerceptionConfig;
  learning?: LearningConfig;
  optimization?: OptimizationConfig;
}

export interface ReasoningConfig {
  decisionThreshold: number;
  confidenceLevel: number;
  maxProcessingTime: number;
  learningRate: number;
  parallelProcessing?: boolean;
}

// Memory and Learning Types
export interface MemoryConfig {
  retentionPeriod: number;
  maxEntries: number;
  longTermThreshold: number;
  maxMemorySize: number;
  shortTermRetention: number;
  longTermRetention: number;
  cleanupInterval: number;
}

export interface MemoryRecord {
  id: string;
  key: string;
  data: any;
  timestamp: number;
  importance: number;
  accessCount: number;
  type: 'short' | 'long';
  tags?: string[];
  lastAccessed?: number;
  relevanceScore?: number;
}

export interface OptimizationConfig {
  parallelProcessing: boolean;
  cacheSize: number;
  updateFrequency: number;
}

export interface MarketData {
  timestamp: number;
  prices: Record<string, number>;
  volumes: Record<string, number>;
  liquidityPools: LiquidityPool[];
  gasPrice: GasPrice;
  news: NewsItem[];
  sentiment: SentimentData;
  yields: YieldOpportunity[];
}

export interface LiquidityPool {
  protocol: string;
  chain?: string;
  tvl: number;
  apy?: number;
  volume24h: number;
  pair: string;
}

export interface GasPrice {
  slow: number;
  standard: number;
  fast: number;
  instant: number;
  timestamp: number;
}

export interface NewsItem {
  title: string;
  content: string;
  source: string;
  timestamp: number;
  sentiment: number; // -1 to 1
  relevance: number; // 0 to 1
}

export interface SentimentData {
  overall: number;
  social: number;
  news: number;
  onChain: number;
}

export interface YieldOpportunity {
  protocol: string;
  chain: string;
  asset: string;
  apy: number;
  tvl: number;
  risk: RiskLevel;
  minAmount: number;
  maxAmount: number;
  lockPeriod?: number;
}

export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

export interface Decision {
  action: string;
  confidence: number;
  reasoning: string;
  expectedReturn: number;
  riskScore: number;
  timeframe: number;
  parameters: Record<string, any>;
  alternatives: Alternative[];
}

export interface Alternative {
  action: string;
  confidence: number;
  expectedReturn: number;
  riskScore: number;
}

export interface Outcome {
  decisionId: string;
  actualReturn: number;
  actualRisk: number;
  executionTime: number;
  success: boolean;
  feedback: string;
}

export interface AgentConfig {
  name: string;
  strategy: string;
  budget: number;
  maxRisk: number;
  targetReturn?: number;
  timeHorizon?: number;
  protocols?: string[];
  chains?: string[];
}

export interface AgentState {
  id: string;
  status: 'active' | 'paused' | 'stopped';
  performance: PerformanceMetrics;
  currentPositions: Position[];
  availableCapital: number;
  totalValue: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  profitLoss: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgExecutionTime: number;
  gasEfficiency: number;
  accuracy: number;
  gasUsed: number;
}

export interface Position {
  protocol: string;
  chain: string;
  asset: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  timestamp: number;
  strategy: string;
}

export interface OpportunitySignal {
  id: string;
  type: 'yield' | 'arbitrage' | 'liquidation' | 'mev' | 'risk' | 'price_movement' | 'volume_surge' | 'liquidity_provision' | 'yield_farming';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: Record<string, any>;
  expectedProfit?: number;
  timeToExpiry?: number;
  timestamp: number;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedGas: number;
  estimatedTime: number;
  contingencies: Contingency[];
}

export interface ExecutionStep {
  action: string;
  protocol: string;
  parameters: Record<string, any>;
  gasEstimate: number;
  order: number;
}

export interface Contingency {
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export interface RiskAssessment {
  overallRisk: number;
  factors: RiskFactor[];
  recommendations: string[];
  limits: RiskLimits;
}

export interface RiskFactor {
  name: string;
  impact: number;
  probability: number;
  mitigation: string;
}

export interface RiskLimits {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxDrawdown: number;
  correlationLimit: number;
}

export interface BacktestConfig {
  startDate: string;
  endDate: string;
  initialCapital: number;
  strategies: string[];
  benchmark?: string;
  slippage?: number;
  commission?: number;
}

export interface BacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  trades: TradeRecord[];
  equity: number[];
  timestamps: number[];
}

export interface TradeRecord {
  timestamp: number;
  action: 'buy' | 'sell';
  asset: string;
  amount: number;
  price: number;
  fee: number;
  pnl: number;
  strategy: string;
}

export interface CognitiveEvent {
  type: string;
  timestamp: number;
  data: any;
  source: string;
  priority: number;
}

export interface PerceptionConfig {
  minConfidence: number;
  minProfitThreshold: number;
  maxSignalsPerCycle: number;
  updateInterval: number;
}

export interface LearningConfig {
  learningRate: number;
  batchSize: number;
  maxHistory: number;
}

export interface MemoryItem {
  id: string;
  timestamp: number;
  data: any;
  importance: number;
  tags: string[];
  retrievalCount: number;
}

export interface LearningData {
  input: any;
  output: any;
  reward: number;
  context: any;
  timestamp: number;
}

export interface ModelWeights {
  version: string;
  weights: number[];
  performance: number;
  timestamp: number;
}

// Event types
export type CognitiveEventType = 
  | 'opportunity_detected'
  | 'decision_made'
  | 'position_opened'
  | 'position_closed'
  | 'risk_alert'
  | 'model_updated'
  | 'performance_milestone';

// Strategy types
export type StrategyType = 
  | 'yield_farming'
  | 'arbitrage'
  | 'momentum'
  | 'mean_reversion'
  | 'risk_parity'
  | 'multi_strategy';

// Agent types
export type AgentType = 
  | 'yield_optimizer'
  | 'arbitrage_hunter'
  | 'risk_manager'
  | 'mev_protector'
  | 'portfolio_manager'
  | 'research_analyst';
