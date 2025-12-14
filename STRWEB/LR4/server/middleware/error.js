export function notFound(req, res) {
  res.status(404).json({ message: "Not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Server error";
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(status).json({
    message,
    name: err.name
  });
}


