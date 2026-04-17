import { inject, Injectable } from '@angular/core';
import {
  AnyEventPayload,
  RealtimeEvent,
  RealtimeRoom,
  RealtimeService as SharedRealtimeService,
} from 'sbc-cafe-shared-module';
import { SessionService } from './session.service';
import { environment } from '../../public-api';
import { RealtimeEventListenerWithObservable } from './realtime-event-listner';

@Injectable()
export class RealtimeService {
  private readonly sessionService = inject(SessionService);

  private get service(): SharedRealtimeService {
    return SharedRealtimeService.getInstance();
  }

  public connect(token?: string): void {
    SharedRealtimeService.getInstance(
      environment.realtimeGatewayServiceUrl,
      this.sessionService.getSessionId(),
      token,
    ).connect();
  }

  // Admin & Customer
  public joinOrder(orderId: string): void {
    this.service.joinOrder(orderId);
  }

  public joinSession(sessionId: string): void {
    this.service.joinSession(sessionId);
  }

  // Admin only
  public joinNewOrderAlert(): void {
    this.service.joinNewOrderAlert();
  }

  public registerEventListener<T extends AnyEventPayload>(
    room: RealtimeRoom,
    callback: (event: RealtimeEvent<T>) => void,
  ): RealtimeEventListenerWithObservable<T> {
    const listener = this.service.registerEventListener<T>(room, callback);
    return new RealtimeEventListenerWithObservable<T>(listener);
  }

  public unregisterEventListener<T extends AnyEventPayload>(
    listener: RealtimeEventListenerWithObservable<T>,
  ): void {
    this.service.unregisterEventListener(listener);
  }

  public unregisterAllEventListeners(): void {
    this.service.unregisterAllEventListeners();
  }

  public disconnect(): void {
    SharedRealtimeService.resetInstance();
  }

  public isReady(): boolean {
    return this.service.isReady();
  }
}
