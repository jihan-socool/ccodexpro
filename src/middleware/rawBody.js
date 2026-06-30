function rawBodyCapture(req, res, next) {
  let rawBody = "";
  req.on("data", (chunk) => {
    rawBody += chunk;
  });
  req.on("end", () => {
    req.rawBody = rawBody;
    next();
  });
}

module.exports = rawBodyCapture;
