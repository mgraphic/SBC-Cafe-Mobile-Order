import { Component, input, model } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'lib-paginated',
  standalone: true,
  imports: [NgbPaginationModule],
  templateUrl: './paginated.component.html',
  styleUrl: './paginated.component.css',
})
export class PaginatedComponent {
  public totalItems = input.required<number>();
  public pageSize = input.required<number>();
  public page = model.required<number>();
}
