import { Component, Input, OnInit } from '@angular/core';
import { Territory } from '~/core/entities/territory/territory';

@Component({
  selector: 'app-territory-details',
  templateUrl: './territory-details.component.html',
  styleUrls: ['./territory-details.component.scss'],
})
export class TerritoryDetailsComponent implements OnInit {
  @Input() territory: Territory;
  @Input() displayContacts = true;

  constructor() {}

  ngOnInit() {}
}
