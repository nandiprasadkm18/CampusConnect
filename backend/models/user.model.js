import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // --- UPDATED THIS OBJECT ---
    profile: {
      usn: { type: String, default: '', trim: true, unique: true }, // <-- ADDED
      fullName: { type: String, default: '' },
      branch: { type: String, default: '' },
      year: { type: String, default: '' },
      semester: { type: String, default: '' },
      phoneNumber: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// ... (rest of the file is unchanged) ...
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;