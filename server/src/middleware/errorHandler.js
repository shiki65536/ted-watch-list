module.exports = (err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // Mongoose repeating error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // default
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
  });
};
