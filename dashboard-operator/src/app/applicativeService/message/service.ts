import { EventEmitter }					from '@angular/core';
import { Message }						from './model';

export class MessageService {

	static emitter: EventEmitter<Message>;
	
	static getEmitter() : EventEmitter<Message> {
		if( ! MessageService.emitter ) {
			MessageService.emitter = new EventEmitter();
		}
		return MessageService.emitter;
	}

	static get():EventEmitter<Message> {
		 return MessageService.getEmitter();
	}

	static post( message:Message ) {
		return MessageService.getEmitter().emit(message);
	}

	static info( body : string ) {
		let message = new Message();
		message.body = body;
		MessageService.post(message);
	}

  static success( body : string ) {
    let message = new Message();
    message.body = body;
    message.type = "success";
    MessageService.post(message);
  }

  static error( body : string ) {
    let message = new Message();
    message.body = body;
    message.type = "danger";
    MessageService.post(message);
  }

	static cookie() {
        let message = new Message();
        message.body = "En naviguant sur ce site, vous acceptez l'utilisation des cookies. ";
        message.type = "cookie";
        MessageService.post(message);
	}
}
