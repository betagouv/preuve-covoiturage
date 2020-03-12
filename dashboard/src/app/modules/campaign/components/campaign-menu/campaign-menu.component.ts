import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-campaign-menu',
  templateUrl: './campaign-menu.component.html',
  styleUrls: ['./campaign-menu.component.scss'],
})
export class CampaignMenuComponent implements OnInit {
  menus = [
    {
      title: 'Simulez votre campagne',
      hint: 'Simulez et configurez en quelques clics votre campagne incitative au covoiturage.',
      button: 'Découvrir',
      svgIcon: 'test',
      callback: null,
    },
    {
      title: "Cherchez l'inspiration",
      hint: 'Retrouvez des exemples de campagnes incitiatives et inspirez-vous en.',
      button: 'Découvrir',
      svgIcon: 'recherche',
      callback: null,
    },
  ];

  constructor(public router: Router, public toastr: ToastrService) {}

  ngOnInit(): void {
    this.menus[0].callback = this.createCampaign;
    this.menus[1].callback = this.discoverCampaign;
  }

  createCampaign(router: Router, toastr: ToastrService): void {
    // todo: reconnect when simulation is operational is fixed
    // router.navigate(['/campaign/create']);
    toastr.success('Cette section sera bientôt disponible !');
  }

  discoverCampaign(router: Router, toastr: ToastrService): void {
    // todo: reconnect when discover is fixed
    // router.navigate(['/campaign/discover']);
    toastr.success('Cette section sera bientôt disponible !');
  }
}
