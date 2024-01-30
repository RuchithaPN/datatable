import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotlyExampleComponentComponent } from './plotly-example-component.component';

describe('PlotlyExampleComponentComponent', () => {
  let component: PlotlyExampleComponentComponent;
  let fixture: ComponentFixture<PlotlyExampleComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlotlyExampleComponentComponent]
    });
    fixture = TestBed.createComponent(PlotlyExampleComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
