import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {
  private readonly sessionId: string = this.getSessionId();

  public constructor() {
    sessionStorage.setItem('sessionId', this.sessionId);
  }

  public getSessionId(): string {
    if (this.sessionId) {
      return this.sessionId;
    }

    const storedSessionId = sessionStorage.getItem('sessionId');

    if (storedSessionId && storedSessionId.trim().length > 0) {
      return storedSessionId.trim();
    }

    return this.generateSessionId();
  }

  private generateSessionId(): string {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    const prepend = Array.from(array, (dec) => dec.toString(16)).join('');

    return `${prepend}:${navigator.userAgent}:${crypto.randomUUID()}`;
  }
}
