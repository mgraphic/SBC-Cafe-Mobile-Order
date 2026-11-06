import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreClosedComponent } from './store-closed.component';

describe('StoreClosedComponent', () => {
  let component: StoreClosedComponent;
  let fixture: ComponentFixture<StoreClosedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreClosedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreClosedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
