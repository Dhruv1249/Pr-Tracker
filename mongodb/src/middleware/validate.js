const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true // Removes unknown fields that are not in the schema
  });
  if (error) {
    const errors = error.details.map(err => ({
      message: err.message,
      path: err.path.join('.')
    }));
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
  }
  req.body = value;
  next();
};

module.exports = validate;
