import { Interfaces, Container } from '@ilos/core';
import { ValidatorMiddleware as BaseValidatorMiddleware } from '@ilos/provider-validator';

@Container.middleware()
export class ValidatorMiddleware extends BaseValidatorMiddleware implements Interfaces.MiddlewareInterface {}
