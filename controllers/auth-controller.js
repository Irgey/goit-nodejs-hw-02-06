const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const fs = require("fs/promises");
const path = require("path");
const { ctrlWrapper } = require("../decorators");
const gravatar = require("gravatar");
const { HttpError } = require("../helpers");
const Jimp = require("jimp");

const { SECRET_TOKEN_KEY } = process.env;

const avatarsDir = path.resolve("public", "avatars");
const register = async (req, res) => {
  const { email, password } = req.body;
  const avatarURL = gravatar.url(email, { size: "256" });

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    user: { email: newUser.email, subscription: newUser.subscription },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const { _id: id, subscription } = user;
  const payload = {
    id,
  };
  const token = jwt.sign(payload, SECRET_TOKEN_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });
  res.json({
    token,
    user: { email, subscription },
  });
};

const getCurrent = (req, res) => {
  const { email, subscription, avatarURL } = req.user;

  res.json({ email, subscription, avatarURL });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};

const updateSubscription = async (req, res) => {
  const { _id, subscription } = req.body;
  await User.findByIdAndUpdate(_id, { subscription });
  res.status(200).json({ message: "Subscription successfully updated" });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.body;
  console.log(req.body, req.file);
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsDir, filename);
  await Jimp.read(oldPath)
    .then((avatar) => {
      return avatar.resize(250, 250).write(oldPath);
    })
    .catch((err) => {
      console.error(err);
    });
  await fs.rename(oldPath, newPath);
  const avatarURL = path.join("avatars", filename);

  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarURL });
};
module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
