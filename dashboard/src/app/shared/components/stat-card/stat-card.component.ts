import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
})
export class StatCardComponent implements OnInit {
  @Input() svgIcon: string;
  @Input() title: string;
  @Input() hint: string;
  @Input() link: string;

  @Output() linkClicked: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onLinkClick(): void {
    this.linkClicked.emit(true);
  }
}
