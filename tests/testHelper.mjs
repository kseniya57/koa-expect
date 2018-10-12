import Expect from '../index';

export default (ctx, schema) => async () => {
  try {
    await Expect(schema)(ctx, () => {});
    return true;
  } catch (e) {
    return e.message;
  }
};
