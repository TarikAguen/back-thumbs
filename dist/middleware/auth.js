"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("./routes/auth");
const authenticateJWT = (req, res, next) => {
  var _a;
  const token =
    (_a = req.header("Authorization")) === null || _a === void 0
      ? void 0
      : _a.split(" ")[1];
  if (token) {
    if (auth_1.revokedTokens.has(token)) {
      return res.status(401).send("Token has been revoked");
    }
    jsonwebtoken_1.default.verify(
      token,
      process.env.JWT_SECRET,
      (err, user) => {
        if (err) {
          console.log(err);
          return res.sendStatus(403);
        }
        res.locals.user = user;
        next();
      }
    );
  } else {
    res.sendStatus(401);
  }
};
exports.authenticateJWT = authenticateJWT;
