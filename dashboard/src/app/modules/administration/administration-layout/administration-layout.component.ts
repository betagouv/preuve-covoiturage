import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-administration-layout',
  templateUrl: './administration-layout.component.html',
  styleUrls: ['./administration-layout.component.scss'],
})
export class AdministrationLayoutComponent implements OnInit {
  public menu = [
    {
      path: '/admin/profile',
      label: 'Votre profil',
    },
    {
      path: '/admin/territory',
      label: 'Territoire',
    },
    {
      path: '/admin/users',
      label: 'Utilisateurs & accès',
    },
  ];

  constructor() {
  }

  ngOnInit() {
  }
}
