export default function notFound(req, res, _next) {
  res.status(404).json({ error: `Route non trouvée: ${req.originalUrl}` });
}
