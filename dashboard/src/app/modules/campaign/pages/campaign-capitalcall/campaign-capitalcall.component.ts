import { Component, OnInit } from '@angular/core';
import { CapitalcallApiService } from './../../services/capitalcall-api.service';

@Component({
  selector: 'app-campaign-capitalcall',
  templateUrl: './campaign-capitalcall.component.html',
  styleUrls: ['./campaign-capitalcall.component.scss'],
})
export class CampaignCapitalcallComponent implements OnInit {
  public capitalcallList: { key: string; month: string }[] = [];
  public displayedColumns: string[] = ['month', 'action'];

  private SHORT_MONTHS_STRING: { [key: string]: string } = {
    janv: 'Janvier',
    fevr: 'Février',
    mars: 'Mars',
    avri: 'Avril',
    mai: 'Mai',
    juin: 'Juin',
    juil: 'Juillet',
    aout: 'Aout',
    sept: 'Septembre',
    octo: 'Octobre',
    nove: 'Novembre',
    dece: 'Decembre',
  };

  constructor(private capitalcallApiService: CapitalcallApiService) {}

  ngOnInit(): void {
    this.capitalcallApiService.list().subscribe((data) => {
      this.capitalcallList = data.map((s3Object) => {
        return {
          key: s3Object.key,
          month: this.computeFullMonth(s3Object.key),
          signed_url: s3Object.signed_url,
        };
      });
    });
  }

  private computeFullMonth(key: string): string {
    const splitArray: string[] = key.split('-');
    return this.SHORT_MONTHS_STRING[splitArray[splitArray.length - 2]];
  }
}
