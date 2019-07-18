import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-campaign-menu',
  templateUrl: './campaign-menu.component.html',
  styleUrls: ['./campaign-menu.component.scss'],
})
export class CampaignMenuComponent implements OnInit {

  menus = [
    {
      title: 'Simulez votre campagne',
      hint: 'Simulez et configurez en quelques clics votre campagne incitative au covoiturage',
      button: 'Découvrir',
      svgIcon: 'test',
    },
    {
      title: 'Cherchez l\'inspiration',
      hint: 'Retrouvez des exemples de campagnes incitiatives et inspirez-vous en',
      button: 'Découvrir',
      svgIcon: 'recherche',
    },
  ];

  constructor() {
  }

  ngOnInit() {
  }

}
