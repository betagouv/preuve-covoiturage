import { Component } from '@angular/core';

import { Roles } from '~/core/enums/user/roles';
import { MenuTabInterface } from '~/core/interfaces/admin/adminLayoutInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-administration-layout',
  templateUrl: './administration-layout.component.html',
  styleUrls: ['./administration-layout.component.scss'],
})
export class AdministrationLayoutComponent {
  public menu: MenuTabInterface[] = [
    {
      path: '/admin/profile',
      label: 'Mon profil',
      show: () => true,
    },
    {
      path: '/admin/territory',
      label: 'Mon Territoire',
      show: () => this.auth.isTerritory(),
    },
    {
      path: '/admin/operator',
      label: 'Mon Opérateur',
      show: () => this.auth.isOperator(),
    },
    {
      path: '/admin/users',
      label: 'Utilisateurs & accès',
      show: () => this.auth.isAdmin(),
    },
    {
      path: '/admin/all-territories',
      label: 'Territoires',
      show: () => this.auth.isSuperAdmin(),
    },
    {
      path: '/admin/all-operators',
      label: 'Opérateurs',
      show: () => this.auth.isSuperAdmin(),
    },
    {
      path: '/admin/api',
      label: 'API',
      show: () => this.auth.hasRole(Roles.OperatorAdmin),
    },
    {
      path: '/admin/visibility',
      label: 'Visibilité',
      show: () => this.auth.hasRole(Roles.OperatorAdmin),
    },
    {
      path: '/admin/certificates',
      label: 'Attestations',
      show: () => this.auth.hasRole([Roles.RegistryAdmin, Roles.OperatorAdmin]),
    },
  ];

  constructor(public auth: AuthenticationService) {}
}
