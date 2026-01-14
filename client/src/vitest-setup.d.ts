import 'vitest';

declare global {
  const expect: typeof import('vitest')['expect'];
  const test: typeof import('vitest')['test'];
  const describe: typeof import('vitest')['describe'];
  const it: typeof import('vitest')['it'];
  const beforeEach: typeof import('vitest')['beforeEach'];
  const afterEach: typeof import('vitest')['afterEach'];
}
