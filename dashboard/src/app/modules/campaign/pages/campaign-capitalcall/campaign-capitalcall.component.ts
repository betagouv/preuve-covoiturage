import { Component, OnInit } from '@angular/core';
import { CapitalcallApiService } from './../../services/capitalcall-api.service';

@Component({
  selector: 'app-campaign-capitalcall',
  templateUrl: './campaign-capitalcall.component.html',
  styleUrls: ['./campaign-capitalcall.component.scss'],
})
export class CampaignCapitalcallComponent implements OnInit {
  constructor(private capitalcallApiService: CapitalcallApiService) {}

  ngOnInit(): void {}
}
