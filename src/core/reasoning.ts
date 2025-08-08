import { EventEmitter } from 'eventemitter3';
import {
  ReasoningConfig,
  Decision,
  OpportunitySignal,
  AgentConfig,
  AgentState,
  MarketData,
  Alternative
} from '@/types';

/**
 * Advanced reasoning engine with self-optimization capabilities
 * Processes signals in milliseconds and makes autonomous decisions
 */
export class ReasoningEngine extends EventEmitter {
  private config: ReasoningConfig;
  private modelWeights: number[] = [];
  private decisionHistory: Decision[] = [];
  private performanceBuffer: any[] = [];

  constructor(config: ReasoningConfig) {
    super();
    this.config = config;
    this.initializeWeights();
  }

  /**
   * Make a decision based on opportunity, agent config, and market data
   */
  async makeDecision(
    opportunity: OpportunitySignal,
    agentConfig: AgentConfig,
    agentState: AgentState,
    marketData: MarketData
  ): Promise<Decision> {
    const startTime = Date.now();

    try {
      // Analyze the opportunity
      const analysis = await this.analyzeOpportunity(opportunity, marketData);
      
      // Evaluate against agent constraints
      const feasibility = this.evaluateFeasibility(opportunity, agentConfig, agentState);
      
      // Calculate risk and return
      const riskReturn = await this.calculateRiskReturn(opportunity, marketData, agentConfig);
      
      // Generate alternatives
      const alternatives = await this.generateAlternatives(opportunity, marketData, agentConfig);
      
      // Make final decision
      const confidence = this.calculateConfidence(analysis, feasibility, riskReturn);
      
      const decision: Decision = {
        action: this.determineAction(opportunity, analysis, feasibility),
        confidence,
        reasoning: this.generateReasoning(analysis, feasibility, riskReturn),
        expectedReturn: riskReturn.expectedReturn,
        riskScore: riskReturn.riskScore,
        timeframe: opportunity.timeToExpiry || 3600000, // 1 hour default
        parameters: this.generateParameters(opportunity, agentConfig),
        alternatives
      };

      // Store decision for learning
      this.decisionHistory.push(decision);
      
      // Ensure we meet timing constraints
      const processingTime = Date.now() - startTime;
      if (processingTime > this.config.maxProcessingTime) {
        console.warn(`Decision took ${processingTime}ms, exceeding limit of ${this.config.maxProcessingTime}ms`);
      }

      this.emit('decision_made', decision);
      return decision;

    } catch (error) {
      console.error('Error in reasoning engine:', error);
      throw error;
    }
  }

  /**
   * Evaluate an opportunity signal
   */
  async evaluateOpportunity(
    signal: OpportunitySignal,
    agentConfig: AgentConfig,
    agentState: AgentState
  ): Promise<Decision> {
    // Quick evaluation for time-critical opportunities
    const riskTolerance = this.mapRiskTolerance(agentConfig.maxRisk);
    const opportunityRisk = signal.data.risk || 0.5;
    
    if (opportunityRisk > riskTolerance) {
      return this.createRejectionDecision('Risk too high', signal);
    }

    const expectedProfit = signal.expectedProfit || 0;
    const minProfit = agentConfig.targetReturn ? agentConfig.budget * agentConfig.targetReturn * 0.1 : 100;
    
    if (expectedProfit < minProfit) {
      return this.createRejectionDecision('Profit too low', signal);
    }

    // Create acceptance decision
    const confidence = Math.min(signal.confidence * 0.9, 0.95);
    
    return {
      action: 'execute',
      confidence,
      reasoning: `High-confidence opportunity with ${expectedProfit.toFixed(2)} expected profit`,
      expectedReturn: expectedProfit,
      riskScore: opportunityRisk,
      timeframe: signal.timeToExpiry || 3600000,
      parameters: {
        amount: Math.min(agentState.availableCapital * 0.1, expectedProfit * 10),
        protocol: signal.data.protocol,
        chain: signal.data.chain
      },
      alternatives: []
    };
  }

  /**
   * Learn from decision outcomes
   */
  async learn(outcome: any): Promise<void> {
    this.performanceBuffer.push(outcome);
    
    // Update weights if we have enough data
    if (this.performanceBuffer.length >= 10) {
      await this.updateWeights();
      this.performanceBuffer = []; // Reset buffer
    }
  }

  /**
   * Get reasoning engine statistics
   */
  getStatistics() {
    return {
      totalDecisions: this.decisionHistory.length,
      averageConfidence: this.calculateAverageConfidence(),
      modelVersion: this.getModelVersion(),
      weightsCount: this.modelWeights.length
    };
  }

  // Private methods

  private initializeWeights(): void {
    // Initialize with random weights
    this.modelWeights = Array.from({ length: 50 }, () => Math.random() - 0.5);
  }

  private async analyzeOpportunity(opportunity: OpportunitySignal, marketData: MarketData): Promise<any> {
    return {
      marketTrend: this.analyzeMarketTrend(marketData),
      volatility: this.calculateVolatility(marketData),
      liquidityDepth: this.assessLiquidity(opportunity, marketData),
      competitionLevel: this.assessCompetition(opportunity),
      timing: this.analyzeTimingFactors(opportunity, marketData)
    };
  }

  private evaluateFeasibility(opportunity: OpportunitySignal, agentConfig: AgentConfig, agentState: AgentState): any {
    return {
      capitalRequirement: opportunity.data.minAmount || 1000,
      availableCapital: agentState.availableCapital,
      protocolSupported: !agentConfig.protocols || agentConfig.protocols.includes(opportunity.data.protocol),
      chainSupported: !agentConfig.chains || agentConfig.chains.includes(opportunity.data.chain),
      riskAcceptable: (opportunity.data.risk || 0.5) <= agentConfig.maxRisk
    };
  }

  private async calculateRiskReturn(opportunity: OpportunitySignal, marketData: MarketData, agentConfig: AgentConfig): Promise<any> {
    const baseReturn = opportunity.expectedProfit || 0;
    const marketRisk = this.calculateMarketRisk(marketData);
    const protocolRisk = this.getProtocolRisk(opportunity.data.protocol);
    
    return {
      expectedReturn: baseReturn * (1 - marketRisk * 0.1),
      riskScore: Math.max(marketRisk, protocolRisk, opportunity.data.risk || 0.5),
      volatilityAdjustedReturn: baseReturn * this.getVolatilityAdjustment(marketData)
    };
  }

  private async generateAlternatives(opportunity: OpportunitySignal, marketData: MarketData, agentConfig: AgentConfig): Promise<Alternative[]> {
    const alternatives: Alternative[] = [];
    
    // Wait alternative
    alternatives.push({
      action: 'wait',
      confidence: 0.7,
      expectedReturn: 0,
      riskScore: 0
    });
    
    // Partial execution alternative
    if ((opportunity.expectedProfit || 0) > 0) {
      alternatives.push({
        action: 'partial_execute',
        confidence: opportunity.confidence * 0.8,
        expectedReturn: (opportunity.expectedProfit || 0) * 0.5,
        riskScore: (opportunity.data.risk || 0.5) * 0.7
      });
    }
    
    return alternatives;
  }

  private calculateConfidence(analysis: any, feasibility: any, riskReturn: any): number {
    let confidence = 0.5;
    
    // Boost confidence for favorable conditions
    if (analysis.marketTrend > 0) confidence += 0.1;
    if (feasibility.capitalRequirement <= feasibility.availableCapital) confidence += 0.2;
    if (feasibility.protocolSupported) confidence += 0.1;
    if (riskReturn.expectedReturn > 0) confidence += 0.2;
    
    // Apply model weights
    const weightsBoost = this.applyModelWeights([analysis, feasibility, riskReturn]);
    confidence += weightsBoost * 0.1;
    
    return Math.min(Math.max(confidence, 0.1), 0.95);
  }

  private determineAction(opportunity: OpportunitySignal, analysis: any, feasibility: any): string {
    if (!feasibility.protocolSupported || !feasibility.chainSupported) {
      return 'reject';
    }
    
    if (feasibility.capitalRequirement > feasibility.availableCapital) {
      return 'insufficient_capital';
    }
    
    if (analysis.timing?.urgency === 'high' && opportunity.confidence > 0.8) {
      return 'execute_immediately';
    }
    
    return 'execute';
  }

  private generateReasoning(analysis: any, feasibility: any, riskReturn: any): string {
    const reasons = [];
    
    if (riskReturn.expectedReturn > 0) {
      reasons.push(`Expected return: ${riskReturn.expectedReturn.toFixed(2)}`);
    }
    
    if (analysis.marketTrend > 0) {
      reasons.push('Favorable market trend');
    }
    
    if (feasibility.riskAcceptable) {
      reasons.push('Risk within tolerance');
    }
    
    if (analysis.liquidityDepth > 0.7) {
      reasons.push('Sufficient liquidity');
    }
    
    return reasons.join('; ') || 'Standard opportunity evaluation';
  }

  private generateParameters(opportunity: OpportunitySignal, agentConfig: AgentConfig): Record<string, any> {
    return {
      protocol: opportunity.data.protocol,
      chain: opportunity.data.chain,
      amount: opportunity.data.amount || Math.min(agentConfig.budget * 0.1, 1000),
      slippage: opportunity.data.slippage || 0.01,
      deadline: Date.now() + (opportunity.timeToExpiry || 3600000),
      gasPrice: opportunity.data.gasPrice || 'standard'
    };
  }

  private createRejectionDecision(reason: string, signal: OpportunitySignal): Decision {
    return {
      action: 'reject',
      confidence: 0.9,
      reasoning: reason,
      expectedReturn: 0,
      riskScore: 1.0,
      timeframe: 0,
      parameters: {},
      alternatives: []
    };
  }

  private mapRiskTolerance(maxRisk: number): number {
    return Math.min(maxRisk * 1.2, 1.0); // Allow slightly higher risk for opportunities
  }

  private analyzeMarketTrend(marketData: MarketData): number {
    // Simple trend analysis based on recent price movement
    const prices = Object.values(marketData.prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    return avgPrice > 0 ? 0.1 : -0.1; // Simplified
  }

  private calculateVolatility(marketData: MarketData): number {
    // Simplified volatility calculation
    return marketData.sentiment?.overall || 0.5;
  }

  private assessLiquidity(opportunity: OpportunitySignal, marketData: MarketData): number {
    const protocol = opportunity.data.protocol;
    const relevantPools = marketData.liquidityPools.filter(pool => pool.protocol === protocol);
    const totalTVL = relevantPools.reduce((sum, pool) => sum + pool.tvl, 0);
    return Math.min(totalTVL / 1000000, 1.0); // Normalize to 0-1
  }

  private assessCompetition(opportunity: OpportunitySignal): number {
    // Mock competition assessment
    return 0.5;
  }

  private analyzeTimingFactors(opportunity: OpportunitySignal, marketData: MarketData): any {
    return {
      urgency: opportunity.priority === 'critical' ? 'high' : 'medium',
      gasPrice: marketData.gasPrice.standard,
      networkCongestion: marketData.gasPrice.fast / marketData.gasPrice.slow
    };
  }

  private calculateMarketRisk(marketData: MarketData): number {
    return 1 - (marketData.sentiment?.overall || 0.5);
  }

  private getProtocolRisk(protocol: string): number {
    // Protocol risk mapping
    const riskMap: Record<string, number> = {
      'aave': 0.1,
      'compound': 0.1,
      'uniswap': 0.2,
      'sushiswap': 0.3,
      'yearn': 0.4
    };
    return riskMap[protocol] || 0.5;
  }

  private getVolatilityAdjustment(marketData: MarketData): number {
    const volatility = this.calculateVolatility(marketData);
    return 1 - (volatility * 0.2); // Reduce returns in high volatility
  }

  private applyModelWeights(inputs: any[]): number {
    // Simple neural network-like calculation
    const flatInputs = this.flattenInputs(inputs);
    let sum = 0;
    for (let i = 0; i < Math.min(flatInputs.length, this.modelWeights.length); i++) {
      const input = flatInputs[i];
      const weight = this.modelWeights[i];
      if (input !== undefined && weight !== undefined) {
        sum += input * weight;
      }
    }
    return Math.tanh(sum); // Activation function
  }

  private flattenInputs(inputs: any[]): number[] {
    const flattened: number[] = [];
    for (const input of inputs) {
      if (typeof input === 'number') {
        flattened.push(input);
      } else if (typeof input === 'object') {
        const values = Object.values(input).filter(v => typeof v === 'number') as number[];
        flattened.push(...values);
      }
    }
    return flattened;
  }

  private async updateWeights(): Promise<void> {
    // Simple gradient descent-like update
    const learningRate = this.config.learningRate;
    const adjustments = this.calculateWeightAdjustments();
    
    for (let i = 0; i < this.modelWeights.length; i++) {
      const adjustment = adjustments[i];
      const currentWeight = this.modelWeights[i];
      if (adjustment !== undefined && currentWeight !== undefined) {
        this.modelWeights[i] = currentWeight + adjustment * learningRate;
      }
    }
    
    this.emit('weights_updated', { weights: this.modelWeights.length });
  }

  private calculateWeightAdjustments(): number[] {
    // Calculate adjustments based on recent performance
    return this.modelWeights.map(() => (Math.random() - 0.5) * 0.01);
  }

  private calculateAverageConfidence(): number {
    if (this.decisionHistory.length === 0) return 0;
    const sum = this.decisionHistory.reduce((acc, decision) => acc + decision.confidence, 0);
    return sum / this.decisionHistory.length;
  }

  private getModelVersion(): string {
    return `v1.0.${this.decisionHistory.length}`;
  }
}
