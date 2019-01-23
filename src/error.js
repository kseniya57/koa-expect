class ErrorWithStatus extends Error {
  constructor(message, status = 500) {
    super();
    this.message = message;
    this.status = status;
  }
}

const throwAssertError = (message, expectation, type) => {
  const e = (expectation && expectation.error && type && expectation.error[type]) || {};
  throw new ErrorWithStatus((typeof e === 'string' && e) || e.message || message, e.status || 400);
};

module.exports = throwAssertError;
