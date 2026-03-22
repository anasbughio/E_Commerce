const User = require("../models/user");
const { signAccessToken, signRefreshToken, hashToken, verifyRefresh } = require("../utils/tokens");
const argon2 = require('argon2');
const RefreshToken = require("../models/refreshToken");
const { v4: uuidv4 } = require('uuid');
const ms = require("ms");
const crypto = require("crypto");
const rateLimit = require('express-rate-limit');

const COOKIE_NAME = 'refreshToken';

// Rate limiter for /auth/refresh (max 10 requests per minute)
const refreshLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Increased to 10
  message: { message: 'Too many refresh attempts, please try again later' }
});

const Register = async (req, res) => {
  const { username, email, password, phoneNo } = req.body;
  try {
    if (!username || !email || !password || !phoneNo) return res.status(400).send({ message: "All fields are required" });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).send({ message: "User already exists" });
    const hashedPassword = await argon2.hash(password);
    const newUser = await User.create({ username, email, password: hashedPassword, phoneNo });
    res.status(201).json({ message: 'Created' });
    console.log('User created:', newUser._id);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// const Login = async (req, res) => {
//   const { email, password } = req.body;
//   const ua = req.get('User-Agent') || '';
//   const ip = req.ip;
//   const sessionId = uuidv4();

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid Credentials" });

//     const ok = await argon2.verify(user.password, password);
//     if (!ok) return res.status(401).json({ message: "Invalid Credentials" });

//     const accessToken = signAccessToken({ sub: user._id.toString(), roles: user.roles });
//     const refreshId = uuidv4();
//     const refreshToken = signRefreshToken({ sub: user._id.toString(), rid: refreshId, sid: sessionId });

//     const tokenHash = hashToken(refreshToken);
//     const expiresAt = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXP || '7d'));

//     // Clean up expired tokens only
//     await RefreshToken.deleteMany({
//       user: user._id,
//       expiresAt: { $lt: new Date() }
//     });

//     await RefreshToken.create({
//       user: user._id,
//       tokenHash,
//       userAgent: ua,
//       ip,
//       expiresAt,
//       sessionId
//     });

//     const csrf = crypto.randomBytes(32).toString("hex");
//     res.cookie('csrfToken', csrf, {
//       httpOnly: false,
//       secure: false,
//       sameSite: "lax",
//       path: "/",
//       maxAge: 1000 * 60 * 60 * 24 * 7
//     });

//     res.cookie(COOKIE_NAME, refreshToken, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//       path: "/",
//       maxAge: 1000 * 60 * 60 * 24 * 7
//     });

//     console.log('Login: Issued refresh token for user:', user._id, 'rid:', refreshId, 'sid:', sessionId);
//     res.json({ accessToken, csrf });
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };



const Login = async (req, res) => {
  const { email, password } = req.body;
  const ua = req.get('User-Agent') || '';
  const ip = req.ip;
  const sessionId = uuidv4();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    const ok = await argon2.verify(user.password, password);
    if (!ok) return res.status(401).json({ message: "Invalid Credentials" });

    // 🟢 Sign tokens
    const accessToken = signAccessToken({ sub: user._id.toString(), roles: user.roles });
    const refreshId = uuidv4();
    const refreshToken = signRefreshToken({ sub: user._id.toString(), rid: refreshId, sid: sessionId });

    // 🧹 Clean expired refresh tokens only
    await RefreshToken.deleteMany({
      user: user._id,
      expiresAt: { $lt: new Date() }
    });

    // 🆕 Save refresh token
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXP || '7d'));
    await RefreshToken.create({
      user: user._id,
      tokenHash,
      userAgent: ua,
      ip,
      expiresAt,
      sessionId
    });

    // 🧿 CSRF token for double-protection
    const csrf = crypto.randomBytes(32).toString("hex");
    res.cookie('csrfToken', csrf, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    // 🧁 Refresh token cookie
    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    console.log(`Login: Issued refresh token for ${user.email}, roles: ${user.roles}`);

    // 🟢 Return access token + user info
    res.json({
      accessToken,
      csrf,
      username: user.username,
      roles: user.roles
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const Refresh = async (req, res) => {
  refreshLimiter(req, res, async () => {
    const sentCsrf = req.get('X-CSRF-Token');
    const csrfCookie = req.cookies['csrfToken'];
    if (!sentCsrf || !csrfCookie || sentCsrf !== csrfCookie) {
      console.log('Refresh: CSRF mismatch, sent:', sentCsrf, 'cookie:', csrfCookie);
      return res.status(403).json({ message: 'CSRF mismatch' });
    }

    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      console.log('Refresh: No refresh token');
      return res.status(401).json({ message: 'No refresh token' });
    }

    let payload;
    try {
      payload = verifyRefresh(token);
    } catch (e) {
      console.error('Refresh: Invalid refresh token:', e.message);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokenHash = hashToken(token);
    const stored = await RefreshToken.findOne({ tokenHash }).populate('user');
    if (!stored) {
      console.log('Refresh: Token not found, possible reuse for user:', payload.sub, 'sid:', payload.sid);
      if (payload.sid) {
        await RefreshToken.deleteMany({ user: payload.sub, sessionId: payload.sid });
      } else {
        await RefreshToken.deleteMany({ user: payload.sub, sessionId: null });
      }
      return res.status(401).json({ message: 'Refresh token reuse detected' });
    }

    if (stored.revoked) {
      console.log('Refresh: Token revoked for user:', payload.sub, 'sid:', stored.sessionId || 'undefined');
      return res.status(401).json({ message: 'Revoked' });
    }
    if (new Date() > stored.expiresAt) {
      console.log('Refresh: Token expired for user:', payload.sub, 'sid:', stored.sessionId || 'undefined');
      return res.status(401).json({ message: 'Expired' });
    }

    const newRefreshId = uuidv4();
    const newRefreshToken = signRefreshToken({ sub: payload.sub, rid: newRefreshId, sid: payload.sid || uuidv4() });
    const newHash = hashToken(newRefreshToken);
    stored.revoked = true;
    stored.replacedByTokenHash = newHash;
    await stored.save();

    const expiresAt = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXP || '7d'));
    await RefreshToken.create({
      user: payload.sub,
      tokenHash: newHash,
      userAgent: req.get('User-Agent') || '',
      ip: req.ip,
      expiresAt,
      sessionId: payload.sid || uuidv4()
    });

    const accessToken = signAccessToken({ sub: payload.sub, roles: stored.user.roles });

    res.cookie(COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    const newCsrf = crypto.randomBytes(32).toString("hex");
    res.cookie('csrfToken', newCsrf, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    console.log('Refresh: Issued new refresh token for user:', payload.sub, 'rid:', newRefreshId, 'sid:', payload.sid || 'legacy');
    res.json({ accessToken, csrf: newCsrf });
  });
};

const Logout = async (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    const tokenHash = hashToken(token);
    await RefreshToken.updateOne({ tokenHash }, { revoked: true });
    console.log('Logout: Revoked refresh token');
  }
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.clearCookie("csrfToken", { path: "/" });
  res.json({ message: 'Logged out' });
};

module.exports = { Register, Login, Refresh, Logout };