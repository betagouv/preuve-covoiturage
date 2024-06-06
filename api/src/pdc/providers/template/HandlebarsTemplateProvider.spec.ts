import test from 'ava';
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

test('should work', (t) => {
  const processor = new HandlebarsTemplateProvider();
  processor.init();
  const template = new TestTemplate({
    word: 'world',
  });

  const rendered = processor.render(template);
  t.is(rendered, 'Hello world!');
});
test('should work with cache', (t) => {
  const processor = new HandlebarsTemplateProvider();
  processor.init();
  const template = new TestTemplate({
    word: 'world',
  });

  processor.render(template);
  const rendered = processor.render(template);

  t.is(rendered, 'Hello world!');
});

test('should throw if template has error', async (t) => {
  const processor = new HandlebarsTemplateProvider();
  processor.init();
  const template = new TestErrorTemplate({
    word: 'world',
  });
  t.throws(() => processor.render(template), { instanceOf: TemplateRenderingException });
});
