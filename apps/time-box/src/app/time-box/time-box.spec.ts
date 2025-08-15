import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { TimeBox } from './time-box';

describe('TimeBox', () => {
  let component: TimeBox;
  let fixture: ComponentFixture<TimeBox>;
  let mockDialog: Partial<MatDialog>;

  beforeEach(async () => {
    mockDialog = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        TimeBox,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
      ],
      providers: [{ provide: MatDialog, useValue: mockDialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toBe('Time Box');
  });

  it('should display start time input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('[data-testid="start-time-input"]');
    expect(input).toBeTruthy();
  });

  it('should display time blocks', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const timeBlocks = compiled.querySelectorAll(
      '[data-testid^="time-block-"]'
    );
    expect(timeBlocks.length).toBeGreaterThan(0);
  });

  it('should display add button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector(
      '[data-testid="add-time-block-button"]'
    );
    expect(addButton).toBeTruthy();
  });

  it('should have initial start time value', () => {
    expect(component['startTimeInput']).toBe('05:00');
  });

  it('should update start time when input changes', () => {
    component.onStartTimeChange('10:00');
    expect(component['startTimeInput']).toBe('10:00');
  });
});
