import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogHostComponent } from './shared/dialog-host/dialog-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DialogHostComponent],
  template: `
    <router-outlet></router-outlet>
    <app-dialog-host></app-dialog-host>
  `
})
export class AppComponent {}
