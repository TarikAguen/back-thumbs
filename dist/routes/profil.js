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
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
router.put("/update-profil", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = res.locals.user.userId;
    const { firstName, lastName, age, description, interests } = req.body;
    try {
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            age,
            description,
            interests,
        }, { new: true });
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        res.json({
            message: "User updated successfully",
            user: updatedUser,
        });
    }
    catch (err) {
        res.status(500).send("Error updating user");
    }
}));
router.post("/profilupdate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = res.locals.user.userId;
    const { firstName, lastName, age, description, interests } = req.body;
    try {
        const postUser = yield User_1.default.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            age,
            description,
            interests,
        }, { new: true });
        if (!postUser) {
            return res.status(404).send("User not found");
        }
        res.json({
            message: "User updated successfully",
            user: postUser,
        });
    }
    catch (err) {
        res.status(500).send("Error updating user");
    }
}));
exports.default = router;
