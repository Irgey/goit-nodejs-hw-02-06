const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { HttpError } = require("../helpers");

const { SECRET_TOKEN_KEY } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;

  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    console.log("bearer error");
    next(HttpError(401));
  }
  try {
    const { id } = jwt.verify(token, SECRET_TOKEN_KEY);
    const user = await User.findById(id);
    if (!user || !user.token) {
      console.log("user error");
      next(HttpError(401));
    }
    req.user = user;
    next();
  } catch {
    next(HttpError(401));
  }
};

module.exports = authenticate;
