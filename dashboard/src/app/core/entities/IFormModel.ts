import { IModel } from '~/core/entities/IModel';

export interface IFormModel<FormModelT = any> extends IModel {
  updateFromFormValues(formValues: FormModelT): void;
  toFormValues(): FormModelT;
}
