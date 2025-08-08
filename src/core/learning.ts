import { EventEmitter } from 'eventemitter3';
import {
  LearningConfig,
  Decision,
  PerformanceMetrics,
  LearningData,
  ModelWeights,
  AgentConfig
} from '@/types';

/**
 * Advanced learning module with reinforcement learning capabilities
 * Continuously improves decision making based on outcomes
 */
export class LearningModule extends EventEmitter {
  private config: LearningConfig;
  private trainingData: LearningData[] = [];
  private modelWeights: ModelWeights;
  private performanceHistory: PerformanceMetrics[] = [];
  private rewardFunction: Function;

  constructor(config: LearningConfig) {
    super();
    this.config = config;
    this.modelWeights = this.initializeWeights();
    this.rewardFunction = this.defaultRewardFunction;
    this.startLearningCycle();
  }

  /**
   * Learn from a decision outcome
   */
  async learn(
    decision: Decision,
    outcome: PerformanceMetrics,
    context: any
  ): Promise<void> {
    try {
      // Calculate reward signal
      const reward = this.calculateReward(decision, outcome);
      
      // Create training data point
      const trainingPoint: LearningData = {
        input: {
          decision: decision,
          context: context,
          features: this.extractFeatures(decision, context)
        },
        output: outcome,
        reward: reward,
        context: context,
        timestamp: Date.now()
      };
      
      // Add to training data
      this.trainingData.push(trainingPoint);
      this.performanceHistory.push(outcome);
      
      // Trim data if necessary
      if (this.trainingData.length > this.config.maxHistory) {
        this.trainingData = this.trainingData.slice(-this.config.maxHistory);
      }
      
      if (this.performanceHistory.length > this.config.maxHistory) {
        this.performanceHistory = this.performanceHistory.slice(-this.config.maxHistory);
      }
      
      // Trigger learning if we have enough data
      if (this.trainingData.length >= this.config.batchSize) {
        await this.updateModel();
      }
      
      this.emit('learning_complete', {
        reward,
        totalDataPoints: this.trainingData.length,
        modelVersion: this.modelWeights.version
      });
      
    } catch (error) {
      console.error('Error in learning process:', error);
      this.emit('learning_error', error);
    }
  }

  /**
   * Get model predictions for decision making
   */
  async predict(features: any): Promise<{
    confidence: number;
    expectedReward: number;
    riskAssessment: number;
  }> {
    try {
      const normalizedFeatures = this.normalizeFeatures(features);
      
      // Simple neural network forward pass
      const prediction = this.forwardPass(normalizedFeatures);
      
      return {
        confidence: Math.min(Math.max(prediction.confidence, 0.1), 0.95),
        expectedReward: prediction.expectedReward,
        riskAssessment: Math.min(Math.max(prediction.risk, 0.0), 1.0)
      };
      
    } catch (error) {
      console.error('Error in prediction:', error);
      // Return conservative defaults
      return {
        confidence: 0.5,
        expectedReward: 0,
        riskAssessment: 0.7
      };
    }
  }

  /**
   * Analyze agent performance patterns
   */
  analyzePerformance(agentId: string): {
    averageReturn: number;
    winRate: number;
    riskAdjustedReturn: number;
    learningTrend: number;
    recommendations: string[];
  } {
    const agentData = this.trainingData.filter(
      data => data.context?.agentId === agentId
    );
    
    if (agentData.length === 0) {
      return {
        averageReturn: 0,
        winRate: 0,
        riskAdjustedReturn: 0,
        learningTrend: 0,
        recommendations: ['Insufficient data for analysis']
      };
    }
    
    // Calculate metrics
    const returns = agentData.map(data => data.output.totalReturn);
    const wins = returns.filter(r => r > 0).length;
    const averageReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const winRate = wins / returns.length;
    
    // Calculate risk-adjusted return (Sharpe-like ratio)
    const variance = this.calculateVariance(returns);
    const riskAdjustedReturn = variance > 0 ? averageReturn / Math.sqrt(variance) : 0;
    
    // Calculate learning trend (improvement over time)
    const learningTrend = this.calculateLearningTrend(agentData);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      averageReturn,
      winRate,
      riskAdjustedReturn,
      learningTrend
    );
    
    return {
      averageReturn,
      winRate,
      riskAdjustedReturn,
      learningTrend,
      recommendations
    };
  }

  /**
   * Optimize agent configuration based on learning
   */
  optimizeAgentConfig(
    currentConfig: AgentConfig,
    performanceGoal: 'profit' | 'safety' | 'balanced' = 'balanced'
  ): AgentConfig {
    const relevantData = this.trainingData.filter(data => 
      this.isConfigSimilar(data.context?.agentConfig, currentConfig)
    );
    
    if (relevantData.length < 10) {
      return currentConfig; // Not enough data for optimization
    }
    
    const optimizedConfig = { ...currentConfig };
    
    // Analyze parameter performance
    const parameterPerformance = this.analyzeParameterPerformance(relevantData);
    
    // Optimize based on goal
    switch (performanceGoal) {
      case 'profit':
        optimizedConfig.maxRisk = this.optimizeForProfit(parameterPerformance).maxRisk;
        optimizedConfig.targetReturn = this.optimizeForProfit(parameterPerformance).targetReturn;
        break;
      case 'safety':
        optimizedConfig.maxRisk = Math.min(currentConfig.maxRisk * 0.8, 0.3);
        optimizedConfig.targetReturn = (currentConfig.targetReturn || 0.1) * 0.9;
        break;
      case 'balanced':
        optimizedConfig.maxRisk = this.findOptimalRisk(parameterPerformance);
        optimizedConfig.targetReturn = this.findOptimalReturn(parameterPerformance);
        break;
    }
    
    this.emit('config_optimized', {
      original: currentConfig,
      optimized: optimizedConfig,
      goal: performanceGoal
    });
    
    return optimizedConfig;
  }

  /**
   * Get learning statistics
   */
  getStatistics() {
    const recentPerformance = this.performanceHistory.slice(-50);
    const avgReturn = recentPerformance.length > 0 
      ? recentPerformance.reduce((sum, p) => sum + p.totalReturn, 0) / recentPerformance.length
      : 0;
    
    return {
      trainingDataPoints: this.trainingData.length,
      modelVersion: this.modelWeights.version,
      modelPerformance: this.modelWeights.performance,
      averageReturn: avgReturn,
      learningRate: this.config.learningRate,
      lastUpdate: this.modelWeights.timestamp
    };
  }

  /**
   * Set custom reward function
   */
  setRewardFunction(rewardFunction: Function): void {
    this.rewardFunction = rewardFunction;
    this.emit('reward_function_updated');
  }

  // Private methods

  private initializeWeights(): ModelWeights {
    return {
      version: 'v1.0.0',
      weights: Array.from({ length: 100 }, () => Math.random() - 0.5),
      performance: 0.5,
      timestamp: Date.now()
    };
  }

  private calculateReward(decision: Decision, outcome: PerformanceMetrics): number {
    return this.rewardFunction(decision, outcome);
  }

  private defaultRewardFunction(decision: Decision, outcome: PerformanceMetrics): number {
    let reward = 0;
    
    // Profit component
    reward += outcome.totalReturn * 0.001; // Scale profit impact
    
    // Risk-adjusted component
    if (outcome.totalReturn > 0 && decision.riskScore < 0.5) {
      reward += 0.2; // Bonus for low-risk wins
    }
    
    // Confidence accuracy component
    const confidenceAccuracy = 1 - Math.abs(decision.confidence - (outcome.totalReturn > 0 ? 1 : 0));
    reward += confidenceAccuracy * 0.1;
    
    // Gas efficiency component
    if (outcome.gasEfficiency > 0.8) {
      reward += 0.1;
    }
    
    // Penalty for losses
    if (outcome.totalReturn < 0) {
      reward -= Math.abs(outcome.totalReturn) * 0.002;
    }
    
    return Math.max(-1, Math.min(1, reward)); // Clamp between -1 and 1
  }

  private extractFeatures(decision: Decision, context: any): number[] {
    const features = [];
    
    // Decision features
    features.push(decision.confidence);
    features.push(decision.expectedReturn / 1000); // Normalize
    features.push(decision.riskScore);
    features.push(decision.timeframe / 3600000); // Convert to hours
    
    // Context features
    if (context.marketData) {
      const sentiment = context.marketData.sentiment?.overall || 0.5;
      features.push(sentiment);
      features.push(context.marketData.gasPrice?.standard / 100 || 0.2); // Normalize gas price
    }
    
    // Agent features
    if (context.agentState) {
      features.push(context.agentState.availableCapital / 100000); // Normalize capital
      features.push(context.agentState.currentPositions.length / 10); // Normalize position count
    }
    
    // Pad or truncate to fixed length
    const targetLength = 20;
    while (features.length < targetLength) {
      features.push(0);
    }
    
    return features.slice(0, targetLength);
  }

  private normalizeFeatures(features: any): number[] {
    if (Array.isArray(features)) {
      return features.map(f => typeof f === 'number' ? f : 0);
    }
    
    // Convert object to feature array
    return this.extractFeatures(features, {});
  }

  private forwardPass(features: number[]): {
    confidence: number;
    expectedReward: number;
    risk: number;
  } {
    const weights = this.modelWeights.weights;
    
    // Simple linear model
    let confidence = 0.5;
    let expectedReward = 0;
    let risk = 0.5;
    
    for (let i = 0; i < Math.min(features.length, weights.length / 3); i++) {
      const feature = features[i] || 0;
      confidence += feature * (weights[i] || 0);
      expectedReward += feature * (weights[i + Math.floor(weights.length / 3)] || 0);
      risk += feature * (weights[i + Math.floor(2 * weights.length / 3)] || 0);
    }
    
    // Apply activation functions
    confidence = 1 / (1 + Math.exp(-confidence)); // Sigmoid
    expectedReward = Math.tanh(expectedReward); // Tanh
    risk = 1 / (1 + Math.exp(-risk)); // Sigmoid
    
    return { confidence, expectedReward, risk };
  }

  private async updateModel(): Promise<void> {
    try {
      // Simple gradient descent update
      const batch = this.trainingData.slice(-this.config.batchSize);
      const gradients = this.calculateGradients(batch);
      
      // Update weights
      for (let i = 0; i < this.modelWeights.weights.length; i++) {
        const gradient = gradients[i] || 0;
        const currentWeight = this.modelWeights.weights[i] || 0;
        this.modelWeights.weights[i] = currentWeight - this.config.learningRate * gradient;
      }
      
      // Update model metadata
      this.modelWeights.performance = this.calculateModelPerformance();
      this.modelWeights.timestamp = Date.now();
      this.modelWeights.version = this.incrementVersion(this.modelWeights.version);
      
      this.emit('model_updated', {
        version: this.modelWeights.version,
        performance: this.modelWeights.performance
      });
      
    } catch (error) {
      console.error('Error updating model:', error);
    }
  }

  private calculateGradients(batch: LearningData[]): number[] {
    const gradients = new Array(this.modelWeights.weights.length).fill(0);
    
    for (const dataPoint of batch) {
      const features = dataPoint.input.features;
      const actualReward = dataPoint.reward;
      
      // Get prediction
      const prediction = this.forwardPass(features);
      const predictedReward = prediction.expectedReward;
      
      // Calculate error
      const error = actualReward - predictedReward;
      
      // Calculate gradients (simplified)
      for (let i = 0; i < Math.min(features.length, gradients.length / 3); i++) {
        const feature = features[i] || 0;
        gradients[i + Math.floor(gradients.length / 3)] += error * feature;
      }
    }
    
    // Average gradients
    return gradients.map(grad => grad / batch.length);
  }

  private calculateModelPerformance(): number {
    if (this.performanceHistory.length === 0) return 0.5;
    
    const recentPerformance = this.performanceHistory.slice(-20);
    const avgReturn = recentPerformance.reduce((sum, p) => sum + p.totalReturn, 0) / recentPerformance.length;
    const winRate = recentPerformance.filter(p => p.totalReturn > 0).length / recentPerformance.length;
    
    // Combine metrics
    const normalizedReturn = Math.max(0, Math.min(1, (avgReturn + 1000) / 2000)); // Normalize around ±1000
    return (normalizedReturn + winRate) / 2;
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private calculateLearningTrend(data: LearningData[]): number {
    if (data.length < 5) return 0;
    
    // Calculate moving average of rewards
    const windowSize = 5;
    const movingAverages = [];
    
    for (let i = windowSize; i <= data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const avg = window.reduce((sum, d) => sum + d.reward, 0) / windowSize;
      movingAverages.push(avg);
    }
    
    if (movingAverages.length < 2) return 0;
    
    // Calculate trend (simple linear regression slope)
    const n = movingAverages.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = movingAverages.reduce((sum, val) => sum + val, 0);
    const sumXY = movingAverages.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private generateRecommendations(
    avgReturn: number,
    winRate: number,
    riskAdjustedReturn: number,
    learningTrend: number
  ): string[] {
    const recommendations = [];
    
    if (avgReturn < 0) {
      recommendations.push('Consider reducing risk tolerance or improving signal filtering');
    }
    
    if (winRate < 0.4) {
      recommendations.push('Low win rate detected - review decision criteria');
    }
    
    if (riskAdjustedReturn < 0.5) {
      recommendations.push('Risk-adjusted returns are low - optimize risk management');
    }
    
    if (learningTrend < 0) {
      recommendations.push('Negative learning trend - review training data quality');
    }
    
    if (learningTrend > 0.1) {
      recommendations.push('Positive learning trend - consider increasing position sizes');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is stable - continue current strategy');
    }
    
    return recommendations;
  }

  private isConfigSimilar(config1: any, config2: AgentConfig): boolean {
    if (!config1) return false;
    
    const threshold = 0.2; // 20% similarity threshold
    const riskDiff = Math.abs((config1.maxRisk || 0.5) - config2.maxRisk);
    const returnDiff = Math.abs((config1.targetReturn || 0.1) - (config2.targetReturn || 0.1));
    
    return riskDiff < threshold && returnDiff < threshold;
  }

  private analyzeParameterPerformance(data: LearningData[]): any {
    // Group by parameter ranges and calculate average performance
    const riskBuckets = new Map();
    const returnBuckets = new Map();
    
    for (const dataPoint of data) {
      const config = dataPoint.context?.agentConfig;
      if (!config) continue;
      
      const riskBucket = Math.floor(config.maxRisk * 10) / 10; // Round to 0.1
      const returnBucket = Math.floor((config.targetReturn || 0.1) * 100) / 100; // Round to 0.01
      
      if (!riskBuckets.has(riskBucket)) {
        riskBuckets.set(riskBucket, []);
      }
      if (!returnBuckets.has(returnBucket)) {
        returnBuckets.set(returnBucket, []);
      }
      
      riskBuckets.get(riskBucket).push(dataPoint.reward);
      returnBuckets.get(returnBucket).push(dataPoint.reward);
    }
    
    return { riskBuckets, returnBuckets };
  }

  private optimizeForProfit(parameterPerformance: any): { maxRisk: number; targetReturn: number } {
    let bestRisk = 0.5;
    let bestReturn = 0.1;
    let bestReward = -Infinity;
    
    for (const [risk, rewards] of parameterPerformance.riskBuckets.entries()) {
      const avgReward = rewards.reduce((sum: number, r: number) => sum + r, 0) / rewards.length;
      if (avgReward > bestReward) {
        bestReward = avgReward;
        bestRisk = risk;
      }
    }
    
    bestReward = -Infinity;
    for (const [returnVal, rewards] of parameterPerformance.returnBuckets.entries()) {
      const avgReward = rewards.reduce((sum: number, r: number) => sum + r, 0) / rewards.length;
      if (avgReward > bestReward) {
        bestReward = avgReward;
        bestReturn = returnVal;
      }
    }
    
    return { maxRisk: bestRisk, targetReturn: bestReturn };
  }

  private findOptimalRisk(parameterPerformance: any): number {
    let bestRisk = 0.5;
    let bestSharpe = -Infinity;
    
    for (const [risk, rewards] of parameterPerformance.riskBuckets.entries()) {
      if (rewards.length < 3) continue;
      
      const avgReward = rewards.reduce((sum: number, r: number) => sum + r, 0) / rewards.length;
      const variance = this.calculateVariance(rewards);
      const sharpe = variance > 0 ? avgReward / Math.sqrt(variance) : 0;
      
      if (sharpe > bestSharpe) {
        bestSharpe = sharpe;
        bestRisk = risk;
      }
    }
    
    return bestRisk;
  }

  private findOptimalReturn(parameterPerformance: any): number {
    let bestReturn = 0.1;
    let bestSharpe = -Infinity;
    
    for (const [returnVal, rewards] of parameterPerformance.returnBuckets.entries()) {
      if (rewards.length < 3) continue;
      
      const avgReward = rewards.reduce((sum: number, r: number) => sum + r, 0) / rewards.length;
      const variance = this.calculateVariance(rewards);
      const sharpe = variance > 0 ? avgReward / Math.sqrt(variance) : 0;
      
      if (sharpe > bestSharpe) {
        bestSharpe = sharpe;
        bestReturn = returnVal;
      }
    }
    
    return bestReturn;
  }

  private startLearningCycle(): void {
    setInterval(() => {
      if (this.trainingData.length >= this.config.batchSize * 2) {
        this.updateModel();
      }
    }, 60000); // Update every minute
  }
}
