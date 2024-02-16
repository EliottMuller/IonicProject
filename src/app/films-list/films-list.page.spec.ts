import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FilmsListPage} from './films-list.page';

describe('FilmsListPage', () => {
  let component: FilmsListPage;
  let fixture: ComponentFixture<FilmsListPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FilmsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
