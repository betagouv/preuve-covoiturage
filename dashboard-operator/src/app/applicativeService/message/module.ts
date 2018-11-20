import { BrowserModule }              from '@angular/platform-browser';
import { CommonModule }               from '@angular/common';
import { NgModule  }                  from '@angular/core';
import { MessageComponent }           from './component';
import { MessageService }             from './service';

@NgModule({
  imports:[
  	  BrowserModule,
      CommonModule,
  ],
  exports : [
    MessageComponent
  ],
  declarations: [ 
  	MessageComponent,
  ],
  providers : [
    MessageService,  
  ],
  entryComponents: [
     MessageComponent, 
  ]
})
export class MessageModule { }