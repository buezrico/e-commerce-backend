const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const userList = await User.find()
    .select("-passwordHash")
    .then((user) => res.status(201).json(user))
    .catch((err) =>
      res.status(500).json({
        error: err,
        success: false,
      })
    );
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user)
    return res.status(404).json({
      message: "User with the given ID not found",
    });

  res.send(user);
});

router.post("/", async (req, res) => {
  // const hashedPassword = await bcrypt.hash(req.body.password, 10);
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: await bcrypt.hash(req.body.password, 10),
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
  });

  user = await user.save();

  if (!user) return res.status(400).send("User can not be created");

  res.send(user);
});
router.post("/register", async (req, res) => {
  // const hashedPassword = await bcrypt.hash(req.body.password, 10);
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: await bcrypt.hash(req.body.password, 10),
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
  });

  user = await user.save();

  if (!user) return res.status(400).send("User can not be created");

  res.send(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.JWT_SECRET;

  if (!user) {
    return res.status(400).send("Email does not exist");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );
    return res.status(200).send({ user: user.email, token: token });
  } else {
    return res.status(400).send("Email and Password Incorrect");
  }
});

router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    return res.status(500).json({ success: false });
  }

  return res.send({ userCount: userCount });
});

router.delete("/:id", async (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "user deleted!!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "delete failed" });
      }
    })
    .catch((err) => {
      return res.status(500);
    });
});

module.exports = router;
