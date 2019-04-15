// class Provider {
//   constructor({ http, bus, errorHandler }) {
//     this.providers = {
//       http,
//       bus,
//       errorHandler,
//     };
//   }
//
//   get methods() {
//       return [];
//   }
//   get routes() {
//     return [];
//   }
//
//   get queues() {
//     return [];
//   }
//
//   boot() {
//     this.routes.forEach((route) => {
//       this.providers.http.use(route);
//     });
//
//     this.queues.forEach((queue) => {
//       this.providers.bus.declare(queue);
//     });
//   }
// }
//
// module.exports = Provider;
