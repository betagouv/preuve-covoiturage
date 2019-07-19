import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-help-card',
  templateUrl: './help-card.component.html',
  styleUrls: ['./help-card.component.scss'],
})
export class HelpCardComponent implements OnInit {
  @Input() svgIcon: string;
  @Input() title: string;
  @Input() hint: string;
  @Input() link: string;
  @Input() button: string;

  @Output() buttonClicked: EventEmitter<boolean> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  onButtonClick(): void {
    this.buttonClicked.emit(true);
  }
}
