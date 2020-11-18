import { v4 as uuid } from 'uuid';
import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { S3StorageProvider, extensionHelper } from '@pdc/provider-file';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/getuploadurl.contract';
import { alias } from '../shared/operator/getuploadurl.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.update']],
    ['validate', alias],
  ],
})
export class GetUploadUrlAction extends AbstractAction {
  constructor(private s3Provider: S3StorageProvider) {
    super();
  }

  /**
   * Get the PUT url to upload images to the operators/ folder on S3 storage
   * The client should use this URL as :
   * curl -H 'Content-type:image/png' -H 'X-Amz-ACL:public-read' -T path/to/file.png {putUrl}
   *
   * In Postman, for example.
   * - Create a PUT request (not a POST)
   * - Add headers:
   *    Content-type: image/png
   *    X-Amz-ACL: public-read
   * - Select binary body
   */
  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { contentType } = params;

    const ext = extensionHelper(contentType);
    if (!ext) {
      throw new Error('Unrecognized content type');
    }

    const key = `operators/${uuid()}.${ext}`;

    return this.s3Provider.getUploadUrl(key, contentType);
  }
}
