import { Component, AfterViewInit } from '@angular/core';
import { PinchService } from 'app/pinch.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  cards = ['Magician', 'Theorist', 'Thief', 'Clerk'];
  scaleData = {scale: 1};

  constructor(public ps: PinchService) {

  }

  ngAfterViewInit() {
    this.ps.wire(document.getElementById('pane'), this.scaleData);
  }

}
