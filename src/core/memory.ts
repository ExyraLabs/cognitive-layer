import { EventEmitter } from 'eventemitter3';
import {
  MemoryConfig,
  Decision,
  AgentState,
  MarketData,
  MemoryRecord,
  PerformanceMetrics
} from '@/types';

/**
 * Advanced memory system for cognitive agents
 * Stores and retrieves historical data, patterns, and learnings
 */
export class MemorySystem extends EventEmitter {
  private config: MemoryConfig;
  private shortTermMemory: Map<string, MemoryRecord> = new Map();
  private longTermMemory: Map<string, MemoryRecord> = new Map();
  private patternCache: Map<string, any> = new Map();
  private accessCounts: Map<string, number> = new Map();

  constructor(config: MemoryConfig) {
    super();
    this.config = config;
    this.startCleanupInterval();
  }

  /**
   * Store a memory record
   */
  async store(key: string, data: any, importance: number = 0.5, type: 'short' | 'long' = 'short'): Promise<void> {
    const record: MemoryRecord = {
      id: this.generateId(),
      key,
      data,
      timestamp: Date.now(),
      importance,
      accessCount: 0,
      type,
      tags: this.extractTags(data)
    };

    if (type === 'short') {
      this.shortTermMemory.set(key, record);
      
      // Auto-promote to long-term if important
      if (importance > this.config.longTermThreshold) {
        this.longTermMemory.set(key, { ...record, type: 'long' });
      }
    } else {
      this.longTermMemory.set(key, record);
    }

    this.emit('memory_stored', { key, type, importance });
  }

  /**
   * Retrieve a memory record
   */
  async retrieve(key: string): Promise<MemoryRecord | null> {
    let record = this.longTermMemory.get(key) || this.shortTermMemory.get(key);
    
    if (record) {
      record.accessCount++;
      record.lastAccessed = Date.now();
      this.accessCounts.set(key, (this.accessCounts.get(key) || 0) + 1);
      
      this.emit('memory_accessed', { key, accessCount: record.accessCount });
      return record;
    }
    
    return null;
  }

  /**
   * Search memories by pattern or criteria
   */
  async search(query: string, limit: number = 10): Promise<MemoryRecord[]> {
    const results: MemoryRecord[] = [];
    const searchTerms = query.toLowerCase().split(' ');

    // Search both memory stores
    const allMemories = [
      ...Array.from(this.longTermMemory.values()),
      ...Array.from(this.shortTermMemory.values())
    ];

    for (const record of allMemories) {
      const relevanceScore = this.calculateRelevance(record, searchTerms);
      if (relevanceScore > 0.3) {
        results.push({
          ...record,
          relevanceScore
        });
      }
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, limit);
  }

  /**
   * Store decision outcome for learning
   */
  async storeDecisionOutcome(
    decision: Decision,
    outcome: PerformanceMetrics,
    agentId: string
  ): Promise<void> {
    const key = `decision_${agentId}_${Date.now()}`;
    const data = {
      decision,
      outcome,
      agentId,
      profitLoss: outcome.totalReturn,
      accuracy: outcome.accuracy,
      gasUsed: outcome.gasUsed
    };

    await this.store(key, data, this.calculateDecisionImportance(outcome), 'long');
  }

  /**
   * Get historical patterns for an agent
   */
  async getAgentPatterns(agentId: string): Promise<any[]> {
    const cacheKey = `patterns_${agentId}`;
    
    if (this.patternCache.has(cacheKey)) {
      return this.patternCache.get(cacheKey);
    }

    const agentMemories = await this.search(`agentId:${agentId}`, 100);
    const patterns = this.analyzePatterns(agentMemories);
    
    this.patternCache.set(cacheKey, patterns);
    return patterns;
  }

  /**
   * Get market context for decision making
   */
  async getMarketContext(timeframe: number = 3600000): Promise<MarketData[]> {
    const cutoff = Date.now() - timeframe;
    const marketMemories = await this.search('market_data', 50);
    
    return marketMemories
      .filter(record => record.timestamp > cutoff)
      .map(record => record.data)
      .filter(data => data && typeof data === 'object');
  }

  /**
   * Store market snapshot
   */
  async storeMarketSnapshot(marketData: MarketData): Promise<void> {
    const key = `market_${Date.now()}`;
    await this.store(key, marketData, 0.6, 'short');
  }

  /**
   * Get agent state history
   */
  async getStateHistory(agentId: string, limit: number = 20): Promise<AgentState[]> {
    const stateMemories = await this.search(`agent_state:${agentId}`, limit);
    return stateMemories
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(record => record.data)
      .filter(data => data && typeof data === 'object');
  }

  /**
   * Store agent state
   */
  async storeAgentState(agentId: string, state: AgentState): Promise<void> {
    const key = `agent_state_${agentId}_${Date.now()}`;
    await this.store(key, state, 0.4, 'short');
  }

  /**
   * Consolidate memories (move important short-term to long-term)
   */
  async consolidate(): Promise<void> {
    const promoted = [];
    
    for (const [key, record] of this.shortTermMemory.entries()) {
      const adjustedImportance = this.calculateAdjustedImportance(record);
      
      if (adjustedImportance > this.config.longTermThreshold) {
        this.longTermMemory.set(key, { ...record, type: 'long', importance: adjustedImportance });
        this.shortTermMemory.delete(key);
        promoted.push(key);
      }
    }

    if (promoted.length > 0) {
      this.emit('memories_consolidated', { promoted: promoted.length });
    }
  }

  /**
   * Get memory statistics
   */
  getStatistics() {
    return {
      shortTermCount: this.shortTermMemory.size,
      longTermCount: this.longTermMemory.size,
      totalAccesses: Array.from(this.accessCounts.values()).reduce((sum, count) => sum + count, 0),
      patternsCached: this.patternCache.size,
      memoryUtilization: (this.shortTermMemory.size + this.longTermMemory.size) / this.config.maxMemorySize
    };
  }

  /**
   * Clear old memories to free space
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    const shortTermCutoff = now - this.config.shortTermRetention;
    const longTermCutoff = now - this.config.longTermRetention;

    // Clean short-term memory
    for (const [key, record] of this.shortTermMemory.entries()) {
      if (record.timestamp < shortTermCutoff && record.importance < 0.7) {
        this.shortTermMemory.delete(key);
      }
    }

    // Clean long-term memory (only very old and unimportant)
    for (const [key, record] of this.longTermMemory.entries()) {
      if (record.timestamp < longTermCutoff && record.importance < 0.3 && record.accessCount < 2) {
        this.longTermMemory.delete(key);
      }
    }

    // Clear pattern cache periodically
    if (this.patternCache.size > 100) {
      this.patternCache.clear();
    }

    this.emit('memory_cleaned', {
      shortTermSize: this.shortTermMemory.size,
      longTermSize: this.longTermMemory.size
    });
  }

  // Private methods

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractTags(data: any): string[] {
    const tags = [];
    
    if (typeof data === 'object' && data !== null) {
      if (data.agentId) tags.push(`agent:${data.agentId}`);
      if (data.protocol) tags.push(`protocol:${data.protocol}`);
      if (data.chain) tags.push(`chain:${data.chain}`);
      if (data.action) tags.push(`action:${data.action}`);
      if (data.type) tags.push(`type:${data.type}`);
    }
    
    return tags;
  }

  private calculateRelevance(record: MemoryRecord, searchTerms: string[]): number {
    let score = 0;
    const searchText = `${record.key} ${JSON.stringify(record.data)} ${record.tags?.join(' ')}`.toLowerCase();
    
    for (const term of searchTerms) {
      if (searchText.includes(term)) {
        score += 0.3;
      }
    }
    
    // Boost score for recent and frequently accessed memories
    const recencyBoost = Math.max(0, 1 - (Date.now() - record.timestamp) / (7 * 24 * 60 * 60 * 1000)); // 7 days
    const accessBoost = Math.min(record.accessCount * 0.1, 0.5);
    const importanceBoost = record.importance * 0.3;
    
    return Math.min(score + recencyBoost + accessBoost + importanceBoost, 1.0);
  }

  private calculateDecisionImportance(outcome: PerformanceMetrics): number {
    let importance = 0.5;
    
    // High profit/loss decisions are more important
    const profitMagnitude = Math.abs(outcome.totalReturn);
    importance += Math.min(profitMagnitude / 10000, 0.3); // Scale by magnitude
    
    // High accuracy decisions are important
    if (outcome.accuracy > 0.8) importance += 0.2;
    
    // Failed decisions with high confidence are very important (for learning)
    if (outcome.accuracy < 0.3 && outcome.totalReturn < 0) importance += 0.3;
    
    return Math.min(importance, 1.0);
  }

  private calculateAdjustedImportance(record: MemoryRecord): number {
    let importance = record.importance;
    
    // Boost importance for frequently accessed memories
    importance += Math.min(record.accessCount * 0.05, 0.3);
    
    // Boost importance for recent memories that are still relevant
    const age = Date.now() - record.timestamp;
    if (age < 24 * 60 * 60 * 1000 && record.accessCount > 0) { // Less than 1 day old
      importance += 0.2;
    }
    
    return Math.min(importance, 1.0);
  }

  private analyzePatterns(memories: MemoryRecord[]): any[] {
    const patterns = [];
    
    // Group by agent and analyze success patterns
    const agentGroups = new Map<string, MemoryRecord[]>();
    
    for (const memory of memories) {
      if (memory.data && memory.data.agentId) {
        const agentId = memory.data.agentId;
        if (!agentGroups.has(agentId)) {
          agentGroups.set(agentId, []);
        }
        agentGroups.get(agentId)!.push(memory);
      }
    }
    
    for (const [agentId, agentMemories] of agentGroups.entries()) {
      const successfulDecisions = agentMemories.filter(m => 
        m.data.outcome && m.data.outcome.totalReturn > 0
      );
      
      const failedDecisions = agentMemories.filter(m => 
        m.data.outcome && m.data.outcome.totalReturn < 0
      );
      
      if (successfulDecisions.length > 0) {
        patterns.push({
          type: 'success_pattern',
          agentId,
          pattern: this.extractCommonFeatures(successfulDecisions),
          confidence: successfulDecisions.length / agentMemories.length,
          sampleSize: successfulDecisions.length
        });
      }
      
      if (failedDecisions.length > 0) {
        patterns.push({
          type: 'failure_pattern',
          agentId,
          pattern: this.extractCommonFeatures(failedDecisions),
          confidence: failedDecisions.length / agentMemories.length,
          sampleSize: failedDecisions.length
        });
      }
    }
    
    return patterns;
  }

  private extractCommonFeatures(memories: MemoryRecord[]): any {
    const features: any = {};
    
    // Extract common protocols
    const protocols = memories
      .map(m => m.data?.decision?.parameters?.protocol)
      .filter(p => p);
    
    if (protocols.length > 0) {
      features.commonProtocols = [...new Set(protocols)];
    }
    
    // Extract common chains
    const chains = memories
      .map(m => m.data?.decision?.parameters?.chain)
      .filter(c => c);
    
    if (chains.length > 0) {
      features.commonChains = [...new Set(chains)];
    }
    
    // Calculate average confidence
    const confidences = memories
      .map(m => m.data?.decision?.confidence)
      .filter(c => typeof c === 'number');
    
    if (confidences.length > 0) {
      features.averageConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    }
    
    return features;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
      this.consolidate();
    }, this.config.cleanupInterval);
  }
}
