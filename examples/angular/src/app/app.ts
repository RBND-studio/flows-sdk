import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Injector, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlowsService } from './flows.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  protected readonly title = signal('angular');

  constructor(private injector: Injector) {}

  flowsService = inject(FlowsService);
  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.flowsService.init(this.injector);
    }
  }
}
