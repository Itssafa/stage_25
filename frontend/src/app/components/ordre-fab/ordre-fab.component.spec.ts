import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdreFabComponent } from './ordre-fab.component';

describe('OrdreFabComponent', () => {
  let component: OrdreFabComponent;
  let fixture: ComponentFixture<OrdreFabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdreFabComponent]
    });
    fixture = TestBed.createComponent(OrdreFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
