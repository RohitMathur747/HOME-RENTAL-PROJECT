const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const User = require("../models/User.js");

/* MULTER SETUP */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); //store uploaded files uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use original file
  },
});
const upload = multer({ storage: storage });

/******************** User Register ********************/

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check for upload files
    const profileImage = req.file;

    if (!profileImage) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    // path to uploade profile photo
    const profileImagePath = profileImage.path;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        profileImage: profileImagePath,
      });

      // Save user to database
      await newUser.save();
      res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
