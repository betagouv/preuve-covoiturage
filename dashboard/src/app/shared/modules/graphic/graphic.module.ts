/* Angular import */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Library import */
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
  ],
  declarations: [
  ],
  providers: [
  ],
  exports: [
    // Modules
    CommonModule,
    FontAwesomeModule,
  ],
})

export class GraphicModule { }
