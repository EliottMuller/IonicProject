import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestModelPage } from './test-model.page';

describe('TestModelPage', () => {
  let component: TestModelPage;
  let fixture: ComponentFixture<TestModelPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestModelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
