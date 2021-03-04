import { SafeHtml } from '@angular/platform-browser';
import { UserManyRoleEnum, Roles } from '~/core/enums/user/roles';

export interface MenuTabInterface {
  path: string;
  label: string | SafeHtml;
  role?: Roles | UserManyRoleEnum;
  icon?: string;
  hideIn?: string[];
  show?: () => boolean;
}
