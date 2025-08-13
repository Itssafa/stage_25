import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LigneProductionComponent } from './ligne-production.component';

describe('LigneProductionComponent', () => {
  let component: LigneProductionComponent;
  let fixture: ComponentFixture<LigneProductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LigneProductionComponent]
    });
    fixture = TestBed.createComponent(LigneProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
