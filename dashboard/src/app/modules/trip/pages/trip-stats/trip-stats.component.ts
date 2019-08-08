import { Component, OnInit } from '@angular/core';

import { tripStats } from '../../config/tripStats';

@Component({
  selector: 'app-trip-stats',
  templateUrl: './trip-stats.component.html',
  styleUrls: ['./trip-stats.component.scss'],
})
export class TripStatsComponent implements OnInit {
  public tripStats = tripStats;

  constructor() {}

  ngOnInit() {}
}
