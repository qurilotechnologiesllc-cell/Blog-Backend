const { jwtVerify, SignJWT } = require("jose")
const RevokedToken = require("../models/revokedToken.model")

const authMiddleware = async (req, res, next) => {
    try {
        const token = (req.headers.authorization && req.headers.authorization.split(" ")[1]) ||
            req.cookies?.["token"];

        if (!token) {
            return res.status(401).json({ message: "Authentication token missing" });
        }

        // Check if the token is revoked
        const revoked = await RevokedToken.findOne({ token });

        if (revoked) {
            res.clearCookie("token", { path: "/" });
            return res.status(401).json({ message: "Token has been invalid please login again" });
        }

        // ✅ Fix 1 — TextEncoder
        const secret = new TextEncoder().encode(process.env.SECRET_KEY)

        const { payload } = await jwtVerify(token, secret, {
            issuer: "blog",
            audience: "blog-audience"
        })

        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        }
        return next()

    } catch (error) {
        res.clearCookie("token", { path: "/" });
        // ✅ Fix 2 — error variable
        console.error("auth failed:", error?.message || error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

const generateToken = async (payload, res) => {
    // ✅ Fix 3 — TextEncoder
    const secret = new TextEncoder().encode(process.env.SECRET_KEY)

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer("blog")           // ✅ issuer match karna zaroori
        .setAudience("blog-audience") // ✅ audience match karna zaroori
        .setExpirationTime('3d')
        .sign(secret);

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return token
}

module.exports = {
    authMiddleware,
    generateToken
}