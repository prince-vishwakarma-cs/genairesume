export const TryCatch = (passfunction) => async (req, res, next) => {
  try {
    await passfunction(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const errorMiddleware = (err, req, res, next) => {
  const { message = "Internal Server Error", statusCode = 500 } = err;

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
