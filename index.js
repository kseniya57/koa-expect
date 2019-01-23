const expect = require('./src/expect');

module.exports = expectation => async (ctx, next) => {
  expect(ctx.params || (ctx.method === 'GET' ? ctx.query : ctx.request.body), expectation);
  await next();
};
