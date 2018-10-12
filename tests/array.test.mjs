import chai from 'chai';
import testHelper from './testHelper';

const { expect } = chai;

const ctx = { params: {} };

const schema = {};

const test = testHelper(ctx, schema);

describe('Array', () => {
  it('Type: Array of object', async () => {
    schema.data = {
      type: Array,
      required: true,
      item: {
        type: Object,
        required: true,
        schema: {
          color: String,
          type: Number,
          limit: {
            type: Array,
            required: true,
            validate: (v) => v.length === 2 && v[0] < v[1],
            item: {
              type: Number,
              required: true,
              validate: (v) => v > 0
            }
          }
        },
      }
    };
    const itemWithBadLimit = {color: 'blue', type: 1, limit: 1};
    ctx.params.data = [itemWithBadLimit, {color: 'blue', type: 1, limit: [1, 2]}];
    expect(await test()).to.equal('Bad request, data[0][limit] should be array, but found number');
    itemWithBadLimit.limit = [5, 7];
    expect(await test()).to.equal(true);
  });
  it('Type: array of array of array', async () => {
    schema.matrix3D = {
      type: Array,
      required: true,
      validate: (v) => v.length,
      item: {
        type: Array,
        required: true,
        item: {
          type: Array,
          required: true,
          validate: (v) => v > 0
        }
      }
    };
    ctx.params.matrix3D = [];
    expect(await test()).to.equal('Bad request, matrix3D is invalid');
    ctx.params.matrix3D = [1];
    expect(await test()).to.equal('Bad request, matrix3D[0] should be array, but found number');
    ctx.params.matrix3D = [[[], 1]];
    expect(await test()).to.equal('Bad request, matrix3D[0][0] is invalid');
    ctx.params.matrix3D = [[[1], 1]];
    expect(await test()).to.equal('Bad request, matrix3D[0][1] should be array, but found number');
    ctx.params.matrix3D = [[[1], [1]]];
    expect(await test()).to.equal(true);
  })
});
