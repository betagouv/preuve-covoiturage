export type ResultInterface = S3Object[];

// Copy of an AWS S3 Object model
export interface S3Object {
  /**
   * The name that you assign to an object. You use the object key to retrieve the object.
   */
  Key?: string;
  /**
   * Creation date of the object.
   */
  LastModified?: string;
  /**
   * The entity tag is a hash of the object. The ETag reflects changes only to the contents of an object, not its metadata. The ETag may or may not be an MD5 digest of the object data. Whether or not it is depends on how the object was created and how it is encrypted as described below:   Objects created by the PUT Object, POST Object, or Copy operation, or through the Amazon Web Services Management Console, and are encrypted by SSE-S3 or plaintext, have ETags that are an MD5 digest of their object data.   Objects created by the PUT Object, POST Object, or Copy operation, or through the Amazon Web Services Management Console, and are encrypted by SSE-C or SSE-KMS, have ETags that are not an MD5 digest of their object data.   If an object is created by either the Multipart Upload or Part Copy operation, the ETag is not an MD5 digest, regardless of the method of encryption.
   */
  ETag?: string;
  /**
   * Size in bytes of the object
   */
  Size?: number;
  /**
   * The class of storage used to store the object.
   */
  StorageClass?: string;
  /**
   * The owner of the object
   */
  Owner?: {
    DisplayName: string;
    ID: string;
  };
}

export interface ParamsInterface {
  operator_id?: number;
  territory_id?: number;
}

export const handlerConfig = {
  service: 'capitalcall',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
