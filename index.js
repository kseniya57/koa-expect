const expect = require('./src/expect');

module.exports = (inputSchema, outputSchema) => async (ctx, next) => {
  if (inputSchema) {
    const params = ctx.params || (ctx.method === 'GET' ? ctx.query : ctx.request.body);
    await expect(
      params,
      inputSchema,
      params,
    );
  }

  await next();

  if (outputSchema) {
    await expect(ctx.body, outputSchema, ctx.body);
  }
};
