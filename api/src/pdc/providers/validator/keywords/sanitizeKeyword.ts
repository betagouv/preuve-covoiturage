import { filterXSS, IFilterXSSOptions } from 'xss';
import { KeywordDefinition } from '/ilos/validator/index.ts';

export type SanitizeInterface = boolean | IFilterXSSOptions;

export const sanitizeKeyword: KeywordDefinition = {
  keyword: 'sanitize',
  type: 'string',
  errors: false,
  modifying: true,
  compile(opt: SanitizeInterface) {
    // strip all to plain-text
    // @source https://jsxss.com/en/examples/no_tag.html
    const options: IFilterXSSOptions =
      typeof opt === 'object'
        ? { ...opt }
        : {
            whiteList: {}, // empty, means filter out all tags
            stripIgnoreTag: true, // filter out all HTML not in the whilelist
            stripIgnoreTagBody: ['script'], // the script tag is a special case, we need
          };

    return (data: string, dataCtx: any): boolean => {
      // bypassing is fine
      if (!opt) return true;

      // replace the value by the filtered one
      if ('parentData' in dataCtx && 'parentDataProperty' in dataCtx) {
        dataCtx.parentData[dataCtx.parentDataProperty] = filterXSS(data, options);
        return true;
      }

      return false;
    };
  },
  metaSchema: {
    oneOf: [
      { type: 'boolean' },
      // simple conversion of IFilterXSSOptions without functions support
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          whitelist: { type: 'object' },
          stripIgnoreTag: { type: 'boolean' },
          stripIgnoreTagBody: {
            oneOf: [{ type: 'boolean' }, { type: 'array', items: { type: 'string' } }],
          },
          allowCommentTag: { type: 'boolean' },
          stripBlankChar: { type: 'boolean' },
          css: { oneOf: [{ type: 'boolean' }, { type: 'object', additionalProperties: false }] },
        },
      },
    ],
  },
};
