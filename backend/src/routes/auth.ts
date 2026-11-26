import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../server";
import { authenticate, AuthRequest } from "../middleware/auth";
import { sendMail } from "../services/email";

const router = Router();
const signToken = (u: { id: string; role: string; email: string }) =>
  jwt.sign(u, process.env.JWT_SECRET || "dev-only-secret", { expiresIn: "2d" });

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName?.trim() || !email?.trim() || !password || password.length < 8)
      return res.status(400).json({ message: "Enter your name, a valid email and a password with at least 8 characters." });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await prisma.user.findUnique({ where: { email: normalizedEmail } }))
      return res.status(409).json({ message: "An account with this email already exists." });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = await prisma.user.create({
      data: {
        fullName: String(fullName).trim(),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 12),
        verificationToken,
        role: ["STUDENT", "JOB_SEEKER", "EMPLOYER", "MENTOR"].includes(String(role)) ? role : "STUDENT"
      }
    });
    const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;
    await sendMail(user.email, "Verify your SKILLNEX account", `<p>Welcome to SKILLNEX, ${user.fullName}.</p><p><a href="${link}">Verify your email</a></p>`);
    res.status(201).json({ message: "Account created. Please check your email to verify your account.", user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not create account." });
  }
});

router.post("/verify-email", async (req, res) => {
  const token = String(req.body.token || "");
  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) return res.status(400).json({ message: "Verification link is invalid or has already been used." });
  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, verificationToken: null } });
  res.json({ message: "Email verified. You can now sign in." });
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ message: "Incorrect email or password." });
  if (user.status !== "ACTIVE") return res.status(403).json({ message: "Your account is not active. Contact an administrator." });
  if (!user.emailVerified && user.role !== "ADMIN")
    return res.status(403).json({ message: "Please verify your email before signing in." });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
});

router.post("/forgot-password", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  const generic = "If an account exists for this email, password reset instructions have been sent.";
  if (!user) return res.json({ message: generic });
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: token, passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000) } });
  const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  const sent = await sendMail(user.email, "Reset your SKILLNEX password", `<p>Use this link within 30 minutes:</p><p><a href="${link}">Reset password</a></p>`);
  res.json({ message: generic, ...(!sent && process.env.NODE_ENV !== "production" ? { developmentResetLink: link } : {}) });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || String(password).length < 8)
    return res.status(400).json({ message: "A valid reset token and password of at least 8 characters are required." });
  const user = await prisma.user.findFirst({ where: { passwordResetToken: String(token), passwordResetExpires: { gt: new Date() } } });
  if (!user) return res.status(400).json({ message: "Reset link is invalid or expired." });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 12), passwordResetToken: null, passwordResetExpires: null } });
  res.json({ message: "Password updated successfully. Please sign in." });
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, fullName: true, email: true, role: true, status: true, avatarUrl: true, headline: true, location: true, emailVerified: true } });
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user });
});

// OAuth 2.0: credentials are configured by the project owner in backend/.env.
router.get("/:provider", (req, res) => {
  const provider = String(req.params.provider).toLowerCase();
  const clientId = provider === "google" ? process.env.GOOGLE_CLIENT_ID : provider === "facebook" ? process.env.FACEBOOK_APP_ID : "";
  if (!["google", "facebook"].includes(provider) || !clientId) return res.status(503).json({ message: `${provider} sign-in is not configured. Add provider credentials to backend/.env.` });
  const callback = `${process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/${provider}/callback`;
  const state = jwt.sign({ provider, role: ["STUDENT","JOB_SEEKER","EMPLOYER","MENTOR"].includes(String(req.query.role)) ? req.query.role : "JOB_SEEKER" }, process.env.JWT_SECRET || "dev-only-secret", { expiresIn: "10m" });
  const url = provider === "google"
    ? `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({client_id:clientId,redirect_uri:callback,response_type:"code",scope:"openid email profile",state,prompt:"select_account"})}`
    : `https://www.facebook.com/v20.0/dialog/oauth?${new URLSearchParams({client_id:clientId,redirect_uri:callback,response_type:"code",scope:"email,public_profile",state})}`;
  res.redirect(url);
});

router.get("/:provider/callback", async (req, res) => {
  const provider = String(req.params.provider).toLowerCase();
  const clientId = provider === "google" ? process.env.GOOGLE_CLIENT_ID : process.env.FACEBOOK_APP_ID;
  const clientSecret = provider === "google" ? process.env.GOOGLE_CLIENT_SECRET : process.env.FACEBOOK_APP_SECRET;
  const callback = `${process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/${provider}/callback`;
  const fail = (reason: string) => res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?oauth_error=${encodeURIComponent(reason)}`);
  try {
    if (!clientId || !clientSecret || !req.query.code || !req.query.state) return fail("OAuth configuration or authorization code is missing.");
    const state = jwt.verify(String(req.query.state), process.env.JWT_SECRET || "dev-only-secret") as any;
    if (state.provider !== provider) return fail("Invalid sign-in state.");
    const tokenResponse = await fetch(provider === "google" ? "https://oauth2.googleapis.com/token" : "https://graph.facebook.com/v20.0/oauth/access_token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,code:String(req.query.code),redirect_uri:callback,grant_type:"authorization_code"}) });
    const tokenData:any = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) return fail("Could not exchange the provider authorization code.");
    const profileUrl = provider === "google" ? "https://www.googleapis.com/oauth2/v3/userinfo" : `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(tokenData.access_token)}`;
    const profileResponse = await fetch(profileUrl, { headers:{Authorization:`Bearer ${tokenData.access_token}`} });
    const profile:any = await profileResponse.json();
    const email = String(profile.email || "").trim().toLowerCase();
    if (!email) return fail("The provider did not return an email address. Please use email registration.");
    let user = await prisma.user.findUnique({ where:{email} });
    if (!user) user = await prisma.user.create({ data:{ fullName:profile.name || profile.given_name || email.split("@")[0], email, passwordHash:null, role:state.role, emailVerified:true, authProvider:provider, providerId:String(profile.sub || profile.id || ""), avatarUrl:profile.picture || profile.picture?.data?.url || null } });
    if (user.status !== "ACTIVE") return fail("This account is not active.");
    await prisma.user.update({where:{id:user.id},data:{lastLoginAt:new Date(),emailVerified:true,authProvider:user.authProvider || provider,providerId:user.providerId || String(profile.sub || profile.id || "")}});
    const token = signToken({id:user.id,role:user.role,email:user.email});
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/oauth/callback?token=${encodeURIComponent(token)}`);
  } catch (error) { console.error("OAuth callback failed", error); return fail("Social sign-in could not be completed."); }
});

export default router;
