import { Container, Interfaces } from '@pdc/core';

@Container.provider()
export class RandomProvider implements Interfaces.ProviderInterface {
  async boot() {
//
  }

  generateToken(length:number = 12):string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // eslint-disable-next-line no-plusplus no-increment-decrement
    for (let i = 0; i < Math.abs(length || 32); i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}
