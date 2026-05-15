import logger from '../config/logger.js';

export default function errorHandler(err, req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  logger.error({
    message,
    status,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
