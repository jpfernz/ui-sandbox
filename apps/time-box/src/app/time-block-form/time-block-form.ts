import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'time-block-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './time-block-form.html',
  styleUrl: './time-block-form.scss',
})
export class TimeBlockForm implements OnInit {
  protected readonly dialogRef = inject(MAT_DIALOG_DATA);
  #formBuilder = inject(FormBuilder);
  protected timeBlockForm!: FormGroup;

  ngOnInit() {
    this.#initializeForm();
  }

  #initializeForm() {
    this.timeBlockForm = this.#formBuilder.group({
      description: [''],
      duration: [0],
    });
  }
}
