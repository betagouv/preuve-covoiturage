import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stat-number',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class StatisticsNumberComponent {
  @Input() number;
  @Input() unit;
}
