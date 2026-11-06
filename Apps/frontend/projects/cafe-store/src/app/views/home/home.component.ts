import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly NAVIGATION_DELAY = 1000 * 5; // 5 seconds

  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(async () => {
      if (!(await this.router.navigate(['menu']))) {
        this.router.navigate(['store-closed']);
      }
    }, this.NAVIGATION_DELAY);
  }
}
