import { Component, OnInit } from '@angular/core';

import { TripClass } from '~/core/entities/trip/trip-class';

@Component({
  selector: 'app-rules-form',
  templateUrl: './rules-form.component.html',
  styleUrls: ['./rules-form.component.scss'],
})
export class RulesFormComponent implements OnInit {
  tripClassKeys = Object.keys(TripClass);

  constructor() {}

  ngOnInit() {}
}
