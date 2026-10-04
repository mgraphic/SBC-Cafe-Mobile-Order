import {
  Component,
  input,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'lib-paginated',
  imports: [NgbPaginationModule],
  templateUrl: './paginated.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './paginated.component.css',
})
export class PaginatedComponent {
  public totalItems = input.required<number>();
  public pageSize = input.required<number>();
  public page = model.required<number>();
}
