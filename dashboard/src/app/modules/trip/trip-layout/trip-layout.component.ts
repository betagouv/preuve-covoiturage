import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trip-layout',
  templateUrl: './trip-layout.component.html',
  styleUrls: ['./trip-layout.component.scss'],
})
export class TripLayoutComponent implements OnInit {
  public menu = [
    {
      path: '/trip/stats',
      label: 'Chiffres clés',
    },
    {
      path: '/trip/maps',
      label: 'Cartes',
    },
    {
      path: '/trip/list',
      label: 'Liste détaillée',
    },
  ];

  constructor() {
  }

  ngOnInit() {
  }

}
