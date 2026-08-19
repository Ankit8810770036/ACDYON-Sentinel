export class RateLimiter {
  /**
   * Generates a Box-Muller Gaussian random number (normal distribution)
   * centered around mean with given standard deviation.
   */
  public static calculateGaussianJitter(meanMs: number, stdDevRatio = 0.25): number {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const stdDev = meanMs * stdDevRatio;
    const result = Math.round(meanMs + z0 * stdDev);
    
    // Ensure bounds (at least 50% of mean, at most 250% of mean)
    return Math.max(Math.round(meanMs * 0.5), Math.min(Math.round(meanMs * 2.5), result));
  }

  /**
   * Returns a promise that resolves after calculated delay with optional jitter.
   */
  public static async wait(baseDelayMs: number, jitterEnabled: boolean): Promise<number> {
    if (baseDelayMs <= 0) return 0;
    
    const actualDelay = jitterEnabled 
      ? RateLimiter.calculateGaussianJitter(baseDelayMs)
      : baseDelayMs;

    await new Promise((resolve) => setTimeout(resolve, actualDelay));
    return actualDelay;
  }

  /**
   * Calculates exponential backoff with full jitter.
   * Attempt 1: base
   * Attempt 2: base * 2
   * Attempt 3: base * 4
   */
  public static calculateExponentialBackoff(attempt: number, baseMs = 500, maxMs = 10000): number {
    const temp = Math.min(maxMs, baseMs * Math.pow(2, attempt - 1));
    // Full jitter formula: random between 0 and temp
    const sleep = Math.floor(Math.random() * temp);
    return Math.max(200, sleep);
  }
}
