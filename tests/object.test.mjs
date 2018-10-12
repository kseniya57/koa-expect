import chai from 'chai';
import testHelper from './testHelper';

const { expect } = chai;

const ctx = { params: {} };

const schema = {};

const test = testHelper(ctx, schema);

describe('Object types', () => {
  it('Type: Object', async () => {
    schema.data = {
      type: Object,
      required: true,
      schema: {
        user: {
          type: Object,
          required: true,
          schema: {
            email: {
              type: String,
              validate: (v) => v.endsWith('@gmail.com'),
              error: {
                validate: 'Only gmail.com email allowed'
              }
            },
            password: {
              type: String,
              required: true,
              validate: (v) => v.length >= 5
            },
            password_confirmation: {
              validate: (v, params) => v === params.password,
              error: {
                validate: 'password_confirmation not matches to password'
              }
            },
            age: {
              type: Number,
              validate: (v) => v >= 17 && v <= 35
            }
          }
        }
      }
    };
    ctx.params.data = 'Data';
    expect(await test()).to.equal('Bad request, data should have a type of object, but found string');
  });
  it('Required', async () => {
    ctx.params.data = {};
    expect(await test()).to.equal('Bad request, data[user] is required, no default value provided');
    ctx.params.data.user = {
      email: 'hello@gmail.com',
      password: '987654321',
      password_confirmation: '987654321',
      age: 18,
    };
    expect(await test()).to.equal(true);
  });
  it('Validate', async () => {
    ctx.params.data.user.password_confirmation += '_';
    expect(await test()).to.equal(schema.data.schema.user.schema.password_confirmation.error.validate);
    ctx.params.data.user.password_confirmation = ctx.params.data.user.password;
    expect(await test()).to.equal(true);
    ctx.params.data.user.email = 'hello@mail.ru';
    expect(await test()).to.equal(schema.data.schema.user.schema.email.error.validate);
    ctx.params.data.user.email = 'hello@gmail.com';
    expect(await test()).to.equal(true);
  });
});
