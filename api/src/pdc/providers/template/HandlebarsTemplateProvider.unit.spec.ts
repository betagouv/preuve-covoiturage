import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { injectable } from '@/ilos/common/index.ts';
import { AbstractTemplate, HandlebarsTemplateProvider } from './index.ts';
import { TemplateRenderingException } from './exceptions/index.ts';

interface TestTemplateData {
  word: string;
}

@injectable()
class TestTemplate extends AbstractTemplate<TestTemplateData> {
  static template = `Hello {{word}}!`;
}

@injectable()
class TestErrorTemplate extends AbstractTemplate<TestTemplateData> {
  static template = `Hello {{#not_exists}}!`;
}

it('should work', (t) => {
  const processor = new HandlebarsTemplateProvider();
  processor.init();
  const template = new TestTemplate({
    word: 'world',
  });

  const rendered = processor.render(template);
  assertEquals(rendered, 'Hello world!');
});
it('should work with cache', (t) => {
  const processor = new HandlebarsTemplateProvider();
  processor.init();
  const template = new TestTemplate({
    word: 'world',
  });

  processor.render(template);
  const rendered = processor.render(template);

  assertEquals(rendered, 'Hello world!');
});

it('should throw if template has error', async (t) => {
  const processor = new HandlebarsTemplateProvider();
  processor.init();
  const template = new TestErrorTemplate({
    word: 'world',
  });
  t.throws(() => processor.render(template), { instanceOf: TemplateRenderingException });
});
