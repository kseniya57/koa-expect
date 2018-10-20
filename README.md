## Expect - middleware for params validation

If `ctx` contain params property then it will be validated else if `ctx.method === 'GET'` then `ctx.query` else `ctx.request.body`

## Example

```js
import Koa from 'koa';
const app = new Koa();
import expect from 'koa-expect';

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

import bodyParser from 'koa-bodyparser';
app.use(bodyParser());

/* optional */
app.use((ctx, next) => {
  ctx.params = { ...ctx.query, ...ctx.request.body };
  return next();
});
/* -------- */

const registerSchema = {
  email: {
    type: String,
    validate: (v) => /.+@.+\..+/i.test(v)
  },
  name: String,
  password: {
    type: String,
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
    default: 10
  },
  country: {
    type: String,
    required: false
  }
};

import Router from 'koa-router';
const router = new Router();

router.post('/register', expect(registerSchema), (ctx) => {
  ctx.body = 'ok';
});

app.use(router.routes());

app.listen(3000);
```


You can write like so:

```js
{
  age: Number
}
```

It is equivalent to

```js
{
  age: {
    type: Number,
    required: true
  }
}
```

## Type

- String
- Number
- Boolean
- Array
- Object

You can specify either only type:
```js
{
  name: String,
  age: Number
}
```
 
 or property type in schema object:
 ```js
{
  name: {
    type: String,
  },
  age: {
    type: Number,
  }
}
```

## Required and default

- `required === true` by default

Let's pretend that params do not contain age

- If `!required` then param will be skipped (in validation)
```js
{
  age: {
    required: false,
    type: Number
  }
}
```

- If `default` value provided and `required` then it will be in params

```js
{
  age: {
    required: true,
    default: 5 // => ctx.params.age === 5
  },
  size: {
    default: (params) => params.age * 2 // => ctx.params.size === 10
  }
}
```

- If `required === true` and field not specified then an error will happen
```js
{
  age: {
    type: Number
  }
}
```

- required may be a function
```js
{
  key: {
      required: (params) => !params.index,
      error: {
        required: 'Params must contain either key or index'
      }
    }
}
```

In case above if params do not contain index then an error will happen

## Validate 

- function for param validation `validate(param, params)`

```js
{
  color: {
    type: String,
    required: true,
    validate: (val) => ['white', 'black'].includes(val)
  },
  password: {
    type: String,
    required: true,
    validate: (val) => val.length > 5 && val.length < 30
  },
  password_confirmation: {
    validate: (confirmation, params) => confirmation === params.password
  }
}
```

## Schema

If params contain an object and you want to check it then you can use `schema`

```js

/* some helpful declarations */

const humanSchema = {
  id: {
    type: Number,
    required: true
  },
  name: String,
};

const subjectSchema = {
    title: String
};

const teacherSchema = {
  ...humanSchema,
  subjects: {
    type: Array,
    item: subjectSchema
  }
};

const studentSchema = {
  ...humanSchema,
  subject: {
    type: Object,
    required: true,
    schema: subjectSchema
  },
  mark: {
    type: Number,
    required: true,
    validate: (v) => v > 0 && v <= 5
  }
};

/* declarations end */

/* our schema */

const schema = {
  student: {
    type: Object,
    required: true,
    schema: studentSchema
  },
  teacher: {
    type: Object,
    required: true,
    schema: teacherSchema
  }
}
```

## Item

If param is Array and you want to check each element then you can use `item`

```js
{
  matrix3D: { // [[[1, 2, 3], [4, 5, 6]], [[8, 9, 10], [11, 12, 13]]]
    type: Array,
    required: true,
    validate: (v) => v.length,
    item: {
      type: Array,
      required: true,
      item: {
        type: Array,
        required: true,
        validate: (v) => v > 0,
        item: Number
      }
    }
  },
  order: { // ['age', 'name']
    type: Array,
    required: true,
    item: String
  }
}

ctx.params.matrix3D = [] // Bad request, matrix3D is invalid
ctx.params.matrix3D = [1] // Bad request, matrix3D[0] should be array, but found number
ctx.params.matrix3D = [[[1], 1]] //Bad request, matrix3D[0][1] should be array, but found number
ctx.params.matrix3D = [[[1], [1]]] // OK
```

## Process

```js
{
  code: {
    type: Array,
    required: true,
    validate: (val) => val.length === 2,
    process: (val) => val.join('_')
  }
}

ctx.params.code = ['element', 5] // => expect => ctx.params.code = 'element_5'
```

## Custom errors
If `validatorName` error happen then `Error` with message `error[validatorName]` (or standard message) will be thrown.
```js
   {
      month: {
         type: String,
         required: true,
         validate: (v) => ['September', 'October', 'November'].includes(v),
         error: {
           validate: 'Month must be one of autumn months',
           required: 'Month is required',
           type: 'Month must be a String'
         }
      } 
   }
```





