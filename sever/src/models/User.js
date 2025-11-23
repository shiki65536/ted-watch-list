const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    youtubeApiKey: {
      type: String,
      required: [true, "YouTube API Key is required"],
      trim: true,
    },
    favourites: [
      {
        videoId: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    watched: [
      {
        videoId: String,
        watchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Password encryption before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password verification method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Don't return sensitive data
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  // Only return API key status, not the actual key
  obj.hasApiKey = !!obj.youtubeApiKey;
  delete obj.youtubeApiKey;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
