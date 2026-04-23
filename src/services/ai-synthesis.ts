/**
 * AI Synthesis Service
 * Provides headline summarization and deduction capabilities
 * Supports both cloud LLMs and local LLMs (Ollama/LM Studio)
 */

export interface SynthesisResult {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  sources: string[];
}

export interface DeductionResult {
  deduction: string;
  reasoning: string;
  confidence: number;
  relatedEvents: string[];
}

// Local LLM configuration
const LOCAL_LLM_CONFIG = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2',
  },
  lmstudio: {
    baseUrl: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234',
    model: process.env.LMSTUDIO_MODEL || 'local-model',
  },
};

// Check if local LLM is available
export async function isLocalLLMAvailable(provider: 'ollama' | 'lmstudio' = 'ollama'): Promise<boolean> {
  try {
    const config = LOCAL_LLM_CONFIG[provider];
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Call local Ollama LLM
async function callOllama(prompt: string): Promise<string> {
  const { baseUrl, model } = LOCAL_LLM_CONFIG.ollama;
  
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

// Call LM Studio
async function callLMStudio(prompt: string): Promise<string> {
  const { baseUrl, model } = LOCAL_LLM_CONFIG.lmstudio;
  
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`LM Studio error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Synthesize headlines into a coherent summary
export async function synthesizeHeadlines(
  headlines: { title: string; source: string; summary?: string }[],
  options: { useLocalLLM?: boolean; provider?: 'ollama' | 'lmstudio' } = {}
): Promise<SynthesisResult> {
  const { useLocalLLM = false, provider = 'ollama' } = options;

  // Build prompt
  const headlinesText = headlines
    .map((h, i) => `${i + 1}. [${h.source}] ${h.title}${h.summary ? `: ${h.summary}` : ''}`)
    .join('\n');

  const prompt = `Analyze the following news headlines and provide:
1. A concise 2-3 sentence summary of the overall situation
2. 3-5 key bullet points highlighting critical developments
3. Overall sentiment (positive/negative/neutral)
4. Confidence score (0-1) based on source diversity and agreement

Headlines:
${headlinesText}

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "sentiment": "negative",
  "confidence": 0.85
}`;

  try {
    let response: string;

    if (useLocalLLM && await isLocalLLMAvailable(provider)) {
      response = provider === 'ollama' 
        ? await callOllama(prompt)
        : await callLMStudio(prompt);
    } else {
      // Fallback to simple heuristic synthesis
      return heuristicSynthesis(headlines);
    }

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary,
        keyPoints: parsed.keyPoints || [],
        sentiment: parsed.sentiment || 'neutral',
        confidence: parsed.confidence || 0.5,
        sources: [...new Set(headlines.map(h => h.source))],
      };
    }

    return heuristicSynthesis(headlines);
  } catch (error) {
    console.error('Synthesis error:', error);
    return heuristicSynthesis(headlines);
  }
}

// Heuristic synthesis when LLM is unavailable
function heuristicSynthesis(
  headlines: { title: string; source: string; summary?: string }[]
): SynthesisResult {
  // Count keywords for sentiment analysis
  const negativeWords = ['war', 'attack', 'crisis', 'conflict', 'death', 'killed', 'bombing', 'sanctions', 'threat'];
  const positiveWords = ['peace', 'agreement', 'cooperation', 'breakthrough', 'recovery', 'aid', 'humanitarian'];
  
  let negativeCount = 0;
  let positiveCount = 0;
  
  const allText = headlines.map(h => h.title + ' ' + (h.summary || '')).join(' ').toLowerCase();
  
  negativeWords.forEach(word => {
    const matches = allText.match(new RegExp(word, 'g'));
    if (matches) negativeCount += matches.length;
  });
  
  positiveWords.forEach(word => {
    const matches = allText.match(new RegExp(word, 'g'));
    if (matches) positiveCount += matches.length;
  });

  const sentiment = negativeCount > positiveCount ? 'negative' : positiveCount > negativeCount ? 'positive' : 'neutral';
  
  // Extract key entities (simple approach)
  const keyPoints = headlines
    .slice(0, 5)
    .map(h => h.title)
    .filter((v, i, a) => a.indexOf(v) === i);

  return {
    summary: `Analysis of ${headlines.length} sources indicates ${sentiment} developments in the region.`,
    keyPoints,
    sentiment,
    confidence: Math.min(0.7, headlines.length / 10),
    sources: [...new Set(headlines.map(h => h.source))],
  };
}

// Deduce situation from multiple signals
export async function deduceSituation(
  signals: { title: string; category: string; severity: string; timestamp: Date }[],
  options: { useLocalLLM?: boolean; provider?: 'ollama' | 'lmstudio' } = {}
): Promise<DeductionResult> {
  const { useLocalLLM = false, provider = 'ollama' } = options;

  const signalsText = signals
    .map((s, i) => `${i + 1}. [${s.severity}] ${s.title} (${s.category})`)
    .join('\n');

  const prompt = `As an intelligence analyst, analyze these signals and deduce:
1. The most likely current situation or trend
2. Your reasoning based on the evidence
3. Related events that may be connected
4. Confidence level (0-1)

Signals:
${signalsText}

Respond in JSON format:
{
  "deduction": "...",
  "reasoning": "...",
  "confidence": 0.75,
  "relatedEvents": ["...", "..."]
}`;

  try {
    let response: string;

    if (useLocalLLM && await isLocalLLMAvailable(provider)) {
      response = provider === 'ollama'
        ? await callOllama(prompt)
        : await callLMStudio(prompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          deduction: parsed.deduction,
          reasoning: parsed.reasoning,
          confidence: parsed.confidence || 0.5,
          relatedEvents: parsed.relatedEvents || [],
        };
      }
    }

    return heuristicDeduction(signals);
  } catch (error) {
    console.error('Deduction error:', error);
    return heuristicDeduction(signals);
  }
}

// Heuristic deduction when LLM is unavailable
function heuristicDeduction(
  signals: { title: string; category: string; severity: string; timestamp: Date }[]
): DeductionResult {
  const criticalCount = signals.filter(s => s.severity === 'CRITICAL').length;
  const highCount = signals.filter(s => s.severity === 'HIGH').length;
  const militaryCount = signals.filter(s => s.category === 'military').length;
  
  const categories = [...new Set(signals.map(s => s.category))];
  
  let deduction = 'Normal activity levels observed.';
  let confidence = 0.5;

  if (criticalCount > 0) {
    deduction = `Critical situation detected with ${criticalCount} critical alerts.`;
    confidence = 0.9;
  } else if (highCount > 3) {
    deduction = `Elevated activity with ${highCount} high-severity signals.`;
    confidence = 0.75;
  } else if (militaryCount > 5) {
    deduction = 'Significant military activity detected.';
    confidence = 0.7;
  }

  return {
    deduction,
    reasoning: `Based on ${signals.length} signals across ${categories.length} categories.`,
    confidence,
    relatedEvents: signals.slice(0, 3).map(s => s.title),
  };
}
