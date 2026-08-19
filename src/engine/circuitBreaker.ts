import { CircuitState } from '../types/ingestion';

export interface CircuitBreakerConfig {
  failureThreshold: number; // e.g. 3 consecutive errors or >40% error rate
  cooldownMs: number;       // e.g. 5000ms pause when OPEN
  windowSize: number;       // sliding window size (e.g. 10 requests)
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastStateChangeTimestamp: number = Date.now();
  private recentResults: boolean[] = []; // true = success, false = failure
  private onStateChange?: (newState: CircuitState, reason: string) => void;

  constructor(
    private config: CircuitBreakerConfig = { failureThreshold: 3, cooldownMs: 5000, windowSize: 10 },
    onStateChange?: (newState: CircuitState, reason: string) => void
  ) {
    this.onStateChange = onStateChange;
  }

  public getState(): CircuitState {
    // Check if OPEN circuit should transition to HALF_OPEN after cooldown
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastStateChangeTimestamp;
      if (elapsed >= this.config.cooldownMs) {
        this.transitionTo('HALF_OPEN', `Cooldown of ${this.config.cooldownMs}ms elapsed. Testing connection...`);
      }
    }
    return this.state;
  }

  public canExecute(): boolean {
    const currentState = this.getState();
    if (currentState === 'OPEN') {
      return false;
    }
    return true; // CLOSED or HALF_OPEN
  }

  public recordResult(statusCode: number): void {
    const isSuccess = statusCode >= 200 && statusCode < 400;

    // Maintain sliding window
    this.recentResults.push(isSuccess);
    if (this.recentResults.length > this.config.windowSize) {
      this.recentResults.shift();
    }

    if (isSuccess) {
      this.handleSuccess();
    } else {
      this.handleFailure(statusCode);
    }
  }

  private handleSuccess(): void {
    this.successCount++;
    if (this.state === 'HALF_OPEN') {
      // Probing request succeeded, reset circuit to CLOSED
      this.failureCount = 0;
      this.transitionTo('CLOSED', 'Probe request succeeded. Target source recovered.');
    }
  }

  private handleFailure(statusCode: number): void {
    this.failureCount++;
    const recentFailures = this.recentResults.filter((res) => !res).length;

    if (this.state === 'HALF_OPEN') {
      // Probe request failed, trip back to OPEN
      this.transitionTo('OPEN', `Probe request failed (HTTP ${statusCode}). Source still blocking.`);
    } else if (this.state === 'CLOSED' && recentFailures >= this.config.failureThreshold) {
      // Threshold reached, trip circuit OPEN to save IP
      this.transitionTo('OPEN', `Failure threshold reached (${recentFailures}/${this.config.failureThreshold} failed with HTTP ${statusCode}). Tripping circuit to protect IP/Session.`);
    }
  }

  private transitionTo(newState: CircuitState, reason: string): void {
    if (this.state !== newState) {
      this.state = newState;
      this.lastStateChangeTimestamp = Date.now();
      if (this.onStateChange) {
        this.onStateChange(newState, reason);
      }
    }
  }

  public reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.recentResults = [];
    this.lastStateChangeTimestamp = Date.now();
  }
}
