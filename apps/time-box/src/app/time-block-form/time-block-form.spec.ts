import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TimeBlockForm } from './time-block-form';

describe('TimeBlockForm', () => {
  let component: TimeBlockForm;
  let fixture: ComponentFixture<TimeBlockForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TimeBlockForm,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeBlockForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component['timeBlockForm']).toBeDefined();
    expect(component['timeBlockForm'].get('description')?.value).toBe('');
    expect(component['timeBlockForm'].get('duration')?.value).toBe(0);
  });

  it('should have form fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('input[formControlName="description"]')
    ).toBeTruthy();
    expect(
      compiled.querySelector('input[formControlName="duration"]')
    ).toBeTruthy();
  });
});
