import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-ui-guide',
  templateUrl: './ui-guide.component.html',
  styleUrls: ['./ui-guide.component.scss'],
})
export class UiGuideComponent implements OnInit {
  showSpinner = false;

  constructor() {
  }

  ngOnInit() {
  }

  onShowSpinner(): void {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
    }, 3000);
  }
}
