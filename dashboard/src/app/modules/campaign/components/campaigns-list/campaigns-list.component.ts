import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.component.html',
  styleUrls: ['./campaigns-list.component.scss'],
})
export class CampaignsListComponent implements OnInit {
  @Input() campaigns: any[];

  constructor() {
  }

  ngOnInit() {
  }

}
