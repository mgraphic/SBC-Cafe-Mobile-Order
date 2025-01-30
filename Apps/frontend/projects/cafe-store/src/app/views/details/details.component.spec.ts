import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsComponent } from './details.component';
import { ActivatedRoute } from '@angular/router';

const mockActivatedRoute = {
  snapshot: {
    params: {
      slug: 'latte',
    },
  },
};

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
