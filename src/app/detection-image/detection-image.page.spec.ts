import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetectionImagePage } from './detection-image.page';

describe('DetectionImagePage', () => {
  let component: DetectionImagePage;
  let fixture: ComponentFixture<DetectionImagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectionImagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
