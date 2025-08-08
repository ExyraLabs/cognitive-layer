import { EventEmitter } from 'eventemitter3';
import {
  PerceptionConfig,
  MarketData,
  OpportunitySignal,
  AgentConfig,
  Alternative
} from '@/types';

/**
 * Perception module for real-time market data processing
 * Converts raw market data into actionable signals
 */
export class PerceptionModule extends EventEmitter {
  private config: PerceptionConfig;
  private dataStreams: Map<string, any> = new Map();
  private signalFilters: Map<string, Function> = new Map();
  private sensorCalibration: Map<string, number> = new Map();

  constructor(config: PerceptionConfig) {
    super();
    this.config = config;
    this.initializeFilters();
    this.initializeSensors();
  }

  /**
   * Process incoming market data and extract opportunities
   */
  async processMarketData(marketData: MarketData): Promise<OpportunitySignal[]> {
    const signals: OpportunitySignal[] = [];
    
    try {
      // Price movement analysis
      const priceSignals = await this.analyzePriceMovements(marketData);
      signals.push(...priceSignals);
      
      // Volume analysis
      const volumeSignals = await this.analyzeVolumePatterns(marketData);
      signals.push(...volumeSignals);
      
      // Liquidity analysis
      const liquiditySignals = await this.analyzeLiquidityOpportunities(marketData);
      signals.push(...liquiditySignals);
      
      // Cross-chain arbitrage detection
      const arbitrageSignals = await this.detectArbitrageOpportunities(marketData);
      signals.push(...arbitrageSignals);
      
      // Yield farming opportunities
      const yieldSignals = await this.detectYieldOpportunities(marketData);
      signals.push(...yieldSignals);
      
      // Filter and rank signals
      const filteredSignals = this.applySignalFilters(signals);
      const rankedSignals = this.rankSignals(filteredSignals);
      
      this.emit('signals_detected', { count: rankedSignals.length });
      return rankedSignals;
      
    } catch (error) {
      console.error('Error processing market data:', error);
      return [];
    }
  }

  /**
   * Register a new data stream
   */
  registerDataStream(id: string, stream: any): void {
    this.dataStreams.set(id, stream);
    this.emit('stream_registered', { id });
  }

  /**
   * Add custom signal filter
   */
  addSignalFilter(name: string, filter: Function): void {
    this.signalFilters.set(name, filter);
  }

  /**
   * Calibrate sensor sensitivity
   */
  calibrateSensor(sensor: string, sensitivity: number): void {
    this.sensorCalibration.set(sensor, Math.max(0.1, Math.min(2.0, sensitivity)));
    this.emit('sensor_calibrated', { sensor, sensitivity });
  }

  /**
   * Get perception statistics
   */
  getStatistics() {
    return {
      activeStreams: this.dataStreams.size,
      registeredFilters: this.signalFilters.size,
      sensorCount: this.sensorCalibration.size,
      processingLatency: this.calculateAverageLatency()
    };
  }

  // Private methods

  private initializeFilters(): void {
    // Minimum confidence filter
    this.signalFilters.set('min_confidence', (signal: OpportunitySignal) => 
      signal.confidence >= this.config.minConfidence
    );
    
    // Minimum profit filter
    this.signalFilters.set('min_profit', (signal: OpportunitySignal) => 
      (signal.expectedProfit || 0) >= this.config.minProfitThreshold
    );
    
    // Time urgency filter
    this.signalFilters.set('time_urgency', (signal: OpportunitySignal) => 
      !signal.timeToExpiry || signal.timeToExpiry > 5000 // At least 5 seconds
    );
  }

  private initializeSensors(): void {
    // Default sensor calibrations
    this.sensorCalibration.set('price_movement', 1.0);
    this.sensorCalibration.set('volume_spike', 1.2);
    this.sensorCalibration.set('liquidity_gap', 0.8);
    this.sensorCalibration.set('arbitrage_detector', 1.5);
    this.sensorCalibration.set('yield_scanner', 1.0);
  }

  private async analyzePriceMovements(marketData: MarketData): Promise<OpportunitySignal[]> {
    const signals: OpportunitySignal[] = [];
    const sensitivity = this.sensorCalibration.get('price_movement') || 1.0;
    
    for (const [token, price] of Object.entries(marketData.prices)) {
      // Detect significant price movements
      const priceChange = this.calculatePriceChange(token, price);
      const volatility = this.calculateVolatility(token, marketData);
      
      if (Math.abs(priceChange) > 0.05 * sensitivity) { // 5% movement threshold
        const signal: OpportunitySignal = {
          id: `price_${token}_${Date.now()}`,
          type: priceChange > 0 ? 'price_movement' : 'price_movement',
          priority: Math.abs(priceChange) > 0.1 ? 'critical' : 'high',
          confidence: Math.min(Math.abs(priceChange) * 10, 0.9),
          data: {
            token,
            priceChange,
            volatility,
            protocol: 'multi',
            chain: 'ethereum'
          },
          expectedProfit: this.estimatePriceMovementProfit(priceChange, volatility),
          timeToExpiry: 300000, // 5 minutes
          timestamp: Date.now()
        };
        
        signals.push(signal);
      }
    }
    
    return signals;
  }

  private async analyzeVolumePatterns(marketData: MarketData): Promise<OpportunitySignal[]> {
    const signals: OpportunitySignal[] = [];
    const sensitivity = this.sensorCalibration.get('volume_spike') || 1.0;
    
    for (const pool of marketData.liquidityPools) {
      const volumeSpike = this.detectVolumeSpike(pool);
      
      if (volumeSpike > 2.0 * sensitivity) { // 2x volume spike
        const signal: OpportunitySignal = {
          id: `volume_${pool.protocol}_${Date.now()}`,
          type: 'volume_surge',
          priority: volumeSpike > 5.0 ? 'critical' : 'high',
          confidence: Math.min(volumeSpike / 10, 0.9),
          data: {
            protocol: pool.protocol,
            pair: pool.pair,
            volumeIncrease: volumeSpike,
            tvl: pool.tvl,
            chain: pool.chain || 'ethereum'
          },
          expectedProfit: this.estimateVolumeProfit(volumeSpike, pool.tvl),
          timeToExpiry: 600000, // 10 minutes
          timestamp: Date.now()
        };
        
        signals.push(signal);
      }
    }
    
    return signals;
  }

  private async analyzeLiquidityOpportunities(marketData: MarketData): Promise<OpportunitySignal[]> {
    const signals: OpportunitySignal[] = [];
    const sensitivity = this.sensorCalibration.get('liquidity_gap') || 1.0;
    
    for (const pool of marketData.liquidityPools) {
      const liquidityGap = this.calculateLiquidityGap(pool);
      
      if (liquidityGap > 0.3 * sensitivity) { // 30% liquidity gap
        const signal: OpportunitySignal = {
          id: `liquidity_${pool.protocol}_${Date.now()}`,
          type: 'liquidity_provision',
          priority: liquidityGap > 0.5 ? 'high' : 'medium',
          confidence: Math.min(liquidityGap * 1.5, 0.9),
          data: {
            protocol: pool.protocol,
            pair: pool.pair,
            currentTVL: pool.tvl,
            gap: liquidityGap,
            apy: pool.apy,
            chain: pool.chain || 'ethereum'
          },
          expectedProfit: this.estimateLiquidityProfit(liquidityGap, pool.apy || 0.1),
          timeToExpiry: 3600000, // 1 hour
          timestamp: Date.now()
        };
        
        signals.push(signal);
      }
    }
    
    return signals;
  }

  private async detectArbitrageOpportunities(marketData: MarketData): Promise<OpportunitySignal[]> {
    const signals: OpportunitySignal[] = [];
    const sensitivity = this.sensorCalibration.get('arbitrage_detector') || 1.0;
    
    // Compare prices across different protocols/chains
    const tokenPrices = new Map<string, { protocol: string; price: number; chain: string }[]>();
    
    // Group prices by token
    for (const pool of marketData.liquidityPools) {
      const tokens = pool.pair.split('/');
      for (const token of tokens) {
        if (!tokenPrices.has(token)) {
          tokenPrices.set(token, []);
        }
        tokenPrices.get(token)!.push({
          protocol: pool.protocol,
          price: marketData.prices[token] || 0,
          chain: pool.chain || 'ethereum'
        });
      }
    }
    
    // Find arbitrage opportunities
    for (const [token, venues] of tokenPrices.entries()) {
      if (venues.length < 2) continue;
      
      const { spread, buyVenue, sellVenue } = this.findMaxSpread(venues);
      
      if (spread > 0.02 * sensitivity) { // 2% spread threshold
        const signal: OpportunitySignal = {
          id: `arbitrage_${token}_${Date.now()}`,
          type: 'arbitrage',
          priority: spread > 0.05 ? 'critical' : 'high',
          confidence: Math.min(spread * 15, 0.95),
          data: {
            token,
            spread,
            buyVenue: buyVenue.protocol,
            sellVenue: sellVenue.protocol,
            buyChain: buyVenue.chain,
            sellChain: sellVenue.chain,
            protocol: 'multi'
          },
          expectedProfit: this.estimateArbitrageProfit(spread, 10000), // Assume $10k trade
          timeToExpiry: 30000, // 30 seconds (time-sensitive)
          timestamp: Date.now()
        };
        
        signals.push(signal);
      }
    }
    
    return signals;
  }

  private async detectYieldOpportunities(marketData: MarketData): Promise<OpportunitySignal[]> {
    const signals: OpportunitySignal[] = [];
    const sensitivity = this.sensorCalibration.get('yield_scanner') || 1.0;
    
    for (const pool of marketData.liquidityPools) {
      const apy = pool.apy || 0;
      
      if (apy > 0.1 * sensitivity) { // 10% APY threshold
        const signal: OpportunitySignal = {
          id: `yield_${pool.protocol}_${Date.now()}`,
          type: 'yield_farming',
          priority: apy > 0.5 ? 'high' : 'medium',
          confidence: Math.min(apy * 2, 0.9),
          data: {
            protocol: pool.protocol,
            pair: pool.pair,
            apy,
            tvl: pool.tvl,
            risk: this.assessPoolRisk(pool),
            chain: pool.chain || 'ethereum'
          },
          expectedProfit: this.estimateYieldProfit(apy, 10000), // Assume $10k investment
          timeToExpiry: 86400000, // 24 hours
          timestamp: Date.now()
        };
        
        signals.push(signal);
      }
    }
    
    return signals;
  }

  private applySignalFilters(signals: OpportunitySignal[]): OpportunitySignal[] {
    let filtered = signals;
    
    for (const [name, filter] of this.signalFilters.entries()) {
      try {
        filtered = filtered.filter((signal: OpportunitySignal) => filter(signal));
      } catch (error) {
        console.warn(`Filter ${name} failed:`, error);
      }
    }
    
    return filtered;
  }

  private rankSignals(signals: OpportunitySignal[]): OpportunitySignal[] {
    return signals.sort((a, b) => {
      // Priority ranking
      const priorityRank = { critical: 3, high: 2, medium: 1, low: 0 };
      const priorityDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Confidence ranking
      const confidenceDiff = b.confidence - a.confidence;
      if (Math.abs(confidenceDiff) > 0.1) return confidenceDiff;
      
      // Expected profit ranking
      const profitDiff = (b.expectedProfit || 0) - (a.expectedProfit || 0);
      return profitDiff;
    });
  }

  // Helper calculation methods

  private calculatePriceChange(token: string, currentPrice: number): number {
    // Mock price change calculation - in real implementation, this would use historical data
    return (Math.random() - 0.5) * 0.2; // ±10% random change
  }

  private calculateVolatility(token: string, marketData: MarketData): number {
    // Mock volatility calculation
    return 0.1 + Math.random() * 0.3; // 10-40% volatility
  }

  private estimatePriceMovementProfit(priceChange: number, volatility: number): number {
    const baseAmount = 10000; // $10k position
    const potentialGain = Math.abs(priceChange) * baseAmount;
    const riskAdjustment = 1 - (volatility * 0.5);
    return potentialGain * riskAdjustment;
  }

  private detectVolumeSpike(pool: any): number {
    // Mock volume spike detection
    return 1 + Math.random() * 4; // 1x to 5x volume
  }

  private estimateVolumeProfit(volumeSpike: number, tvl: number): number {
    const tradingFees = tvl * 0.003; // 0.3% fees on TVL
    return tradingFees * (volumeSpike / 10); // Proportional to spike
  }

  private calculateLiquidityGap(pool: any): number {
    // Mock liquidity gap calculation
    return Math.random() * 0.6; // 0-60% gap
  }

  private estimateLiquidityProfit(gap: number, apy: number): number {
    const baseAmount = 10000;
    return baseAmount * apy * gap; // Profit proportional to gap and APY
  }

  private findMaxSpread(venues: { protocol: string; price: number; chain: string }[]): {
    spread: number;
    buyVenue: { protocol: string; price: number; chain: string };
    sellVenue: { protocol: string; price: number; chain: string };
  } {
    if (venues.length === 0) {
      return {
        spread: 0,
        buyVenue: { protocol: 'unknown', price: 0, chain: 'unknown' },
        sellVenue: { protocol: 'unknown', price: 0, chain: 'unknown' }
      };
    }
    
    let maxSpread = 0;
    let buyVenue = venues[0];
    let sellVenue = venues[0];
    
    for (const buy of venues) {
      for (const sell of venues) {
        if (buy.protocol !== sell.protocol || buy.chain !== sell.chain) {
          const spread = (sell.price - buy.price) / buy.price;
          if (spread > maxSpread) {
            maxSpread = spread;
            buyVenue = buy;
            sellVenue = sell;
          }
        }
      }
    }
    
    return { 
      spread: maxSpread, 
      buyVenue: buyVenue!, 
      sellVenue: sellVenue! 
    };
  }

  private estimateArbitrageProfit(spread: number, amount: number): number {
    const grossProfit = amount * spread;
    const gasCosts = 50; // $50 estimated gas costs
    const slippage = amount * 0.005; // 0.5% slippage
    return Math.max(0, grossProfit - gasCosts - slippage);
  }

  private assessPoolRisk(pool: any): number {
    // Mock risk assessment
    const riskMap: Record<string, number> = { aave: 0.1, uniswap: 0.2, sushiswap: 0.3 };
    const protocolRisk = riskMap[pool.protocol as string] || 0.4;
    const tvlRisk = pool.tvl < 1000000 ? 0.3 : 0.1; // Lower TVL = higher risk
    return Math.min(protocolRisk + tvlRisk, 1.0);
  }

  private estimateYieldProfit(apy: number, amount: number): number {
    const dailyYield = amount * (apy / 365);
    const riskAdjustment = 0.8; // 20% risk discount
    return dailyYield * riskAdjustment;
  }

  private calculateAverageLatency(): number {
    // Mock latency calculation
    return 50 + Math.random() * 20; // 50-70ms
  }
}
