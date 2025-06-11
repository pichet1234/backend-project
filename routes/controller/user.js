var mongoose = require('../connect');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = mongoose.model('users', require('../schema/user'));
require('dotenv').config();
const crypto = require('crypto');

module.exports = {
  register: async (req, res) => {
    console.log(req.body);
    try {
      const { username, password, fullname, position, email, tel } = req.body;

      const existingUser = await User.findOne({ username }).collation({ locale: 'th', strength: 1 });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPassword,
        role: 'admin',
        fullname,
        position,
        email,
        tel,
        imgprofile: '',
        creartedate: new Date(),
        resetToken: undefined,
        resetTokenExpire: undefined
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role,
          fullname: newUser.fullname,
          position: newUser.position
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const existingUser = await User.findOne({ username }).collation({ locale: 'th', strength: 1 });

      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { id: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: existingUser._id,
          username: existingUser.username,
          role: existingUser.role,
          fullname: existingUser.fullname,
          position: existingUser.position,
          email: existingUser.email
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  forgotpassword: async (req, res) => {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email: req.body.email }).collation({ locale: 'th', strength: 1 });
      if (!existingUser) return res.status(404).json({ message: 'User not found' });

      const token = crypto.randomBytes(32).toString('hex');
      existingUser.resetToken = token;  // <-- แก้ตรงนี้
      existingUser.resetTokenExpire = Date.now() + 3600000; // 1 ชม.
      await existingUser.save();

      // ส่งอีเมล (mock หรือจริงก็ได้)
      const resetLink = `http://localhost:4200/auth/reset-password/${token}`;
      console.log('Reset link:', resetLink);
      // ที่นี่ควรส่งอีเมลจริง
      return res.status(200).json({
        message: 'Reset link sent to email',
        token,
        data: {
          link: `http://localhost:4200/auth/reset-password/${token}`
        }
      });
      res.json({ message: 'Reset link sent to email' });
    } catch (error) {
      console.error('forgotpassword error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  resetpassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpire: { $gt: Date.now() }
      }).collation({ locale: 'th', strength: 1 });

      if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

      user.password = await bcrypt.hash(password, 10);
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  getuser:(req, res)=>{
    User.find({ }).then((result)=>{
      console.log("001");
      res.json(result);
    }).catch((err)=>{
      console.log("e");
    });
  }
};
