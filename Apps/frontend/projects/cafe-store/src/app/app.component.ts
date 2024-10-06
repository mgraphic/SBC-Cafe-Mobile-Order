import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SharedModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected showHeader = true;
  protected showFooter = true;

  private readonly detroyRef = inject(DestroyRef);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(takeUntilDestroyed(this.detroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          switch (event.urlAfterRedirects) {
            case '/':
              this.showHeader = false;
              this.showFooter = false;
              break;
            default:
              this.showHeader = true;
              this.showFooter = true;
              break;
          }
        }
      });
  }
}
