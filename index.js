const expect = require('./src/expect');

module.exports = (inputSchema, outputSchema) => async (ctx, next) => {
  if (inputSchema) {
    expect(
      ctx.params || (ctx.method === 'GET' ? ctx.query : ctx.request.body),
      inputSchema,
    );
  }

  await next();

  if (outputSchema) {
    expect(ctx.body, inputSchema);
  }
};
