// import { RuleHandlerContextInterface, RuleHandlerInterface } from '../../interfaces';

// export function compose(
//   middleware: RuleHandlerInterface[],
// ): (ctx: RuleHandlerContextInterface, next?: RuleHandlerInterface) => Promise<void> {
//   if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');
//   for (const fn of middleware) {
//     if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
//   }

//   /**
//    * @param {Object} context
//    * @return {Promise}
//    * @api public
//    */
//   return async function(ctx: RuleHandlerContextInterface, next?: RuleHandlerInterface): Promise<any> {
//     // last called middleware #
//     let index = -1;

//     async function dispatch(i): Promise<any> {
//       if (i <= index) return Promise.reject(new Error('next() called multiple times'));
//       index = i;
//       let fn = middleware[i];
//       if (i === middleware.length) fn = next;
//       if (!fn) return Promise.resolve();
//       try {
//         return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
//       } catch (err) {
//         return Promise.reject(err);
//       }
//     }

//     return dispatch(0);
//   };
// }
