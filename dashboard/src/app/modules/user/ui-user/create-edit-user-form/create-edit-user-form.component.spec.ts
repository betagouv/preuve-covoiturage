import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditUserFormComponent } from './create-edit-user-form.component';

describe('CreateEditUserFormComponent', () => {
  let component: CreateEditUserFormComponent;
  let fixture: ComponentFixture<CreateEditUserFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEditUserFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
