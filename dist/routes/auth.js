"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRevokedToken = exports.revokedTokens = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
const revokedTokens = new Set();
exports.revokedTokens = revokedTokens;
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new User_1.default({ email, password: hashedPassword });
        yield newUser.save();
        res.status(201).send("User registered");
    }
    catch (err) {
        console.error(err);
        if (err.code === 11000) {
            res.status(400).send("Email already exists");
        }
        else {
            res.status(500).send("Error registering user");
        }
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }
    const user = yield User_1.default.findOne({ email });
    if (user && (yield bcrypt_1.default.compare(password, user.password))) {
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({
            message: `User connected: ${email}`,
            token,
            user: {
                email: user.email
            },
        });
    }
    else {
        res.status(401).send("Invalid credentials");
    }
}));
router.post("/logout", (req, res) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (token) {
        revokedTokens.add(token);
        res.send("User logged out successfully");
    }
    else {
        res.status(400).send("No token provided");
    }
});
// Middleware pour vérifier la révocation des tokens (à utiliser sur les routes protégées)
const checkRevokedToken = (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (token && revokedTokens.has(token)) {
        return res.status(401).send("Token has been revoked");
    }
    next();
};
exports.checkRevokedToken = checkRevokedToken;
exports.default = router;
