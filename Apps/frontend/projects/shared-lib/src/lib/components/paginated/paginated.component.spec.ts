import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatedComponent } from './paginated.component';

describe('PaginatedComponent', () => {
  let component: PaginatedComponent;
  let fixture: ComponentFixture<PaginatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
