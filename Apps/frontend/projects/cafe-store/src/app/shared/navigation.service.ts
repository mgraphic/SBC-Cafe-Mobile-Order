import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly defaultUrl = '/';
  private history: string[] = [];

  private previousUrl?: string;
  private currentUrl?: string;

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd): void => {
        this.setUrls(event);
      });
  }

  getPreviousUrl(): string | undefined {
    return this.previousUrl;
  }

  getCurrentUrl(): string | undefined {
    return this.currentUrl;
  }

  getHistory(): string[] {
    return this.history;
  }

  clearHistory(): void {
    this.history = [];
  }

  goBack(defaultUrl?: string): void {
    this.navigateTo(this.getPreviousUrl() || defaultUrl || this.defaultUrl);
  }

  private navigateTo(url: string): void {
    this.router.navigateByUrl(url);
  }

  private setUrls(event: NavigationEnd): void {
    const prev = this.currentUrl;
    const curr = event.urlAfterRedirects;

    this.previousUrl = prev;
    this.currentUrl = curr;
    this.history.push(curr);
  }
}
