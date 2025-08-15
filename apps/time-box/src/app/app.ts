import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TimeBox } from './time-box/time-box';

@Component({
  imports: [RouterModule, TimeBox],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'time-box';
}
