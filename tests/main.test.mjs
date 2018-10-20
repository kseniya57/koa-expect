import chai from 'chai';
import testHelper from './testHelper';

const { expect } = chai;

const ctx = { params: {} };

const schema = {};

const test = testHelper(ctx, schema);

describe('Main test', () => {
  it('Type: String', async () => {
    schema.month = {
      type: String,
      required: true,
      validate: (v) => ['September', 'October', 'November'].includes(v),
      error: {
        validate: 'Month must be one of autumn months',
        required: 'Month is required',
        type: 'Month must be a String'
      }
    };
    ctx.params.month = 1;
    expect(await test()).to.equal(schema.month.error.type);
    ctx.params.month = 'October';
    expect(await test()).to.equal(true);
  });
  it('Type: Number', async () => {
    schema.year =Number;
    ctx.params.year = 2018;
    expect(await test()).to.equal(true);
    schema.day = {
      type: Number,
      required: true,
      validate: (v) => v > 0 && v < 32,
      error: {
        validate: 'Day must be in range [1, 31]',
      }
    };
    ctx.params.day = '1';
    expect(await test()).to.equal(true);
    ctx.params.day = {};
    expect(await test()).to.equal('Bad request, day should have a type of number, but found object');
    ctx.params.day = 15;
    expect(await test()).to.equal(true);
  });
  it('Type: Boolean', async () => {
    schema.true = {
      type: Boolean,
      required: true,
      validate: (v) => v,
    };
    ctx.params.true = [true];
    expect(await test()).to.equal('Bad request, true should have a type of boolean, but found array');
    ctx.params.true = true;
    expect(await test()).to.equal(true);
  });
  it('Required and default', async () => {
    delete ctx.params.month;
    expect(await test()).to.equal(schema.month.error.required);

    schema.month.default = 'September';
    expect(await test()).to.equal(true);
    expect(ctx.params.month).to.equal(schema.month.default);

    schema.month.required = false;
    delete ctx.params.month;
    delete ctx.params.default;
    expect(await test()).to.equal(true);
    expect(ctx.params.month).to.be.an('undefined');

    schema.key = {
      required: (params) => !params.index,
      error: {
        required: 'Params must contain either key or index'
      }
    };
    expect(await test()).to.equal(schema.key.error.required);
    ctx.params.index = 1;
    expect(await test()).to.equal(true);
  });
  it('Validate', async () => {
    ctx.params.month = 'January';
    expect(await test()).to.equal(schema.month.error.validate);
    [ctx.params.day, ctx.params.month] = [-1, 'October'];
    expect(await test()).to.equal(schema.day.error.validate);
    ctx.params.day = 5;
  });
  it('Process', async () => {
    ctx.params.code = ['element', 5];
    schema.code = {
      type: Array,
      validate: (v) => v.length === 2,
      process: (v) => v.join('_')
    };
    expect(await test()).to.equal(true);
    expect(ctx.params.code).to.equal('element_5')
  });
});
