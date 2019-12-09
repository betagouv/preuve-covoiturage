import { SafeHtml } from '@angular/platform-browser';

import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserManyRoleEnum, UserRoleEnum } from '~/core/enums/user/user-role.enum';

export interface MenuTabInterface {
  path: string;
  label: string | SafeHtml;
  groups?: UserGroupEnum[];
  role?: UserRoleEnum | UserManyRoleEnum;
}
