import { Model } from '~/core/entities/IModel';

export interface FormModel<FormModelT = any> extends Model {
  updateFromFormValues(formValues: FormModelT): void;
  toFormValues(): FormModelT;
}
