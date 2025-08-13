import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosteComponent } from './poste.component';

describe('PosteComponent', () => {
  let component: PosteComponent;
  let fixture: ComponentFixture<PosteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PosteComponent]
    });
    fixture = TestBed.createComponent(PosteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
