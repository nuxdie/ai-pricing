export interface LLMModel {
    model: string;
    provider?: string;
    simpleBench?: number | null; // Simple Bench
    fictionLiveBench?: number | null; // Fiction.LiveBench @ 60k tokens
    aiderBench?: number | null;  // Aider SWE
    AAIndex?: number | null; // Artificial Analysis Index
    webdevElo?: number | null; // Web Development Arena, ELO
    mcBenchElo?: number | null; // Minecraft Bench, ELO
    SWEBench?: number | null; // Software Engineering Bench Verified 500, %
    GPQAdiamond?: number | null; // Google-proof Q and A Diamond hard, %
    HumLastExam?: number | null; // Humanity's last exam, %
    VendingBench?: number | null; // Vending Machine Bench, USD
    ARCAGI2?: number | null; // ARC AGI 2 Benchmark, %
    snitchBench?: number | null; // SnitchBench Gov Snitch Rate, %
    bullshitBench?: number | null; // BullshitBench v2 nonsense detection rate, %
    vibeCodeBench?: number | null; // Vibe Code Bench v1.1 end-to-end web app dev, %
    context?: number;
    inputPrice?: number;
    outputPrice?: number;
    costAAIndex?: number; // Cost (USD) to run all evaluations in the Artificial Analysis Intelligence Index
    tokenUseAAIndex?: number; // Output Tokens Used to Run Artificial Analysis Intelligence Index, Millions
    outputSpeed?: number | null; // Output speed in tokens per second
    outputSpeedSource?: string;
    hasVision?: boolean;
    toolUse?: boolean;
    notes?: string;
    pricingUrl?: string;  // Changed from required to optional
    inputPriceCacheHit?: number;
    maxOutputTokens?: number;
    maxOutputTokensBeta?: number;
    modelUrl?: string;
    releaseDate?: string; // Model release date (ISO 8601, YYYY-MM-DD)
    developer: string;
    hasReasoning?: boolean; // Add the new property for thinking/reasoning mode
}

export interface CalculatorState {
    inputTokens: number;
    outputTokens: number;
    isVisible: boolean;
}
