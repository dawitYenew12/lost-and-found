import validator from "validator";
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";
import toJson from '@meanie/mongoose-to-json';
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
          );
        }
      },
      private: true,
    },
  },
  { timestamps: true }
);

userSchema.statics.isEmailRegistered = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    try {
      user.password = await bcrypt.hash(user.password, 8);
    } catch (error) {
      return next(error); // Pass the error to the next middleware
    }
  }
  next();
});

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.plugin(toJson);
export const User = model("User", userSchema);

export default User;
