#!/usr/bin/env node

/**
 * Post-build script for Exyra Cognitive Layer
 * Handles final build optimizations and cleanup
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Running post-build optimizations...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy package.json to dist for deployment
const packagePath = path.join(__dirname, '..', 'package.json');
const distPackagePath = path.join(distDir, 'package.json');

if (fs.existsSync(packagePath)) {
  const packageJson = require(packagePath);
  
  // Remove dev dependencies for production build
  delete packageJson.devDependencies;
  delete packageJson.scripts.dev;
  delete packageJson.scripts.build;
  
  fs.writeFileSync(distPackagePath, JSON.stringify(packageJson, null, 2));
  console.log('📦 Package.json copied to dist');
}

// Copy README to dist
const readmePath = path.join(__dirname, '..', 'README.md');
const distReadmePath = path.join(distDir, 'README.md');

if (fs.existsSync(readmePath)) {
  fs.copyFileSync(readmePath, distReadmePath);
  console.log('📖 README.md copied to dist');
}

// Create example usage file
const examplePath = path.join(distDir, 'example.js');
const exampleContent = `
/**
 * Example usage of Exyra Cognitive Layer
 */

const { CognitiveEngine } = require('./core/engine');

// Example configuration
const config = {
  apiKeys: {
    openai: 'your-openai-key',
    coingecko: 'your-coingecko-key',
    infura: 'your-infura-key'
  },
  networks: ['ethereum', 'polygon', 'arbitrum'],
  riskTolerance: 'medium'
};

// Initialize and start the cognitive engine
async function main() {
  const engine = new CognitiveEngine(config);
  
  try {
    await engine.start();
    console.log('✅ Cognitive Engine started successfully');
    
    // Deploy a yield optimization agent
    const agentId = await engine.deployAgent({
      type: 'yield_optimizer',
      budget: 10000,
      maxRisk: 0.3,
      protocols: ['aave', 'compound', 'yearn'],
      chains: ['ethereum']
    });
    
    console.log(\`🤖 Agent deployed: \${agentId}\`);
    
    // Example market data processing
    const marketData = {
      prices: { ETH: 3000, USDC: 1.00 },
      liquidityPools: [
        {
          protocol: 'aave',
          pair: 'ETH/USDC',
          tvl: 1000000,
          apy: 0.15,
          volume24h: 500000
        }
      ],
      gasPrice: { slow: 20, standard: 30, fast: 50 },
      sentiment: { overall: 0.7 }
    };
    
    await engine.processMarketData(marketData);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
`;

fs.writeFileSync(examplePath, exampleContent);
console.log('💡 Example usage file created');

console.log('✅ Post-build completed successfully!');
console.log('\n🚀 Cognitive Layer is ready for deployment');
console.log('   📁 Build output: ./dist/');
console.log('   📖 Usage example: ./dist/example.js');
