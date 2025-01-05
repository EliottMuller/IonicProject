import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetectionPagePage } from './detection-page.page';

describe('DetectionPagePage', () => {
  let component: DetectionPagePage;
  let fixture: ComponentFixture<DetectionPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectionPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
