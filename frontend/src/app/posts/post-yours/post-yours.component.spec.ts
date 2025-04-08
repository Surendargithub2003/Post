import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostYoursComponent } from './post-yours.component';

describe('PostYoursComponent', () => {
  let component: PostYoursComponent;
  let fixture: ComponentFixture<PostYoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostYoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostYoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
