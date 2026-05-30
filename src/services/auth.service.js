const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');
const jwt = require('jsonwebtoken');

exports.signup = async ({ email, userName, password })=>{
    const exisitingUser = await User.findOne({ email });
    const exisitingUserName = await User.findOne({ userName });

    if(exisitingUserName){
        throw new Error('Username already exist')
    }

    if(exisitingUser){
        throw new Error('User already exist')
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        email,
        userName,
        password:hashPassword
    })


    return user

}


exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email })
  if (!user) throw new Error('User not found')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error('Invalid credentials')


  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken
  await user.save()


  return {token, refreshToken}
}


exports.logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};