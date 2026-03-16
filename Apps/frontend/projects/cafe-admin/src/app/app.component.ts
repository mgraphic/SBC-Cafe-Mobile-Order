import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ToastsComponent } from '../../../shared-lib/src/public-api';
// import { ToastsComponent } from '../../../shared-lib/src/lib/components/toasts/toasts.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterModule, ToastsComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {}
