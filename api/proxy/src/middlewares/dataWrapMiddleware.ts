import expressMung from 'express-mung';
import { RPCSingleResponseType } from '@ilos/common';

declare interface HasPossibleNestedResult {
  result?: any | { meta: any; data: any };
}

declare interface HasNestedResult {
  result?: { meta: any; data: any };
}

/**
 * Wrap the { results: ... } from JSON RPC
 * in { meta: ..., data: ... } to normalize a metadata schema
 * between queries.
 * Applies to arrays or single objects
 */
export const mapResults = (doc: HasPossibleNestedResult): HasNestedResult => {
  if (!('result' in doc)) return doc;

  if (typeof doc.result !== 'object') {
    doc.result = {
      meta: null,
      data: doc.result,
    };

    return doc;
  }

  if (doc.result && 'data' in doc.result) {
    if (!('meta' in doc.result)) {
      doc.result.meta = null;
    }

    return doc;
  }

  doc.result = {
    meta: null,
    data: doc.result,
  };

  return doc;
};

export const patchBody = (body, req, res): any => (Array.isArray(body) ? body.map(mapResults) : mapResults(body));

// eslint-disable-next-line no-unused-vars
export const dataWrapMiddleware = expressMung.json(patchBody);
