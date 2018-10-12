import expect from './src/expect';

export default (expectation) => async (ctx, next) => {
  expect(ctx.params || (ctx.method === 'GET' ? ctx.query : ctx.request.body), expectation);
  await next();
};
