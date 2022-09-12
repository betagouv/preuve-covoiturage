import { Component, Input, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { CommonDataService } from '../../../../core/services/common-data.service';
import { CapitalcallApiService } from './../../services/capitalcall-api.service';

@Component({
  selector: 'app-campaign-capitalcall',
  templateUrl: './campaign-capitalcall.component.html',
  styleUrls: ['./campaign-capitalcall.component.scss'],
})
export class CampaignCapitalcallComponent implements OnInit {
  @Input() territoryId: number;

  public capitalcallList: { key: string; month: string }[] = [];
  public displayedColumns: string[] = ['month', 'operator', 'action'];

  private readonly SHORT_MONTHS_STRING: { [key: string]: string } = {
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
    dece: 'Décembre',
  };

  private readonly SORTED_SHORT_MONTH_ARRAY: string[] = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Aout',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  constructor(private capitalcallApiService: CapitalcallApiService, private commonData: CommonDataService) {}

  ngOnInit(): void {
    combineLatest(this.commonData.operators$, this.capitalcallApiService.list(this.territoryId)).subscribe(
      ([operators, s3objects]) => {
        this.capitalcallList = s3objects
          .map((s3Object) => {
            const operatorId: number = this.computeOperatorId(s3Object.key);
            return {
              key: s3Object.key,
              month: this.computeFullMonth(s3Object.key),
              signed_url: s3Object.signed_url,
              operator: operators.find((o) => o._id === operatorId).name,
            };
          })
          .sort((a, b) => {
            return this.SORTED_SHORT_MONTH_ARRAY.indexOf(a.month) - this.SORTED_SHORT_MONTH_ARRAY.indexOf(b.month);
          });
      },
    );
  }

  private computeOperatorId(key: string): number {
    return parseInt(key.split('-')[1]);
  }

  private computeFullMonth(key: string): string {
    const splitArray: string[] = key.split('-');
    return this.SHORT_MONTHS_STRING[splitArray[splitArray.length - 2]];
  }
}
