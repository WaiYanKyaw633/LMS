
const User=require('../models/User');
const bcrypt=require('bcryptjs');
const jwt = require("jsonwebtoken");

exports.login = async (req, reply) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return reply.status(400).send({ error: "Username and password are required." });
        }
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return reply.status(404).send({errpr: "Username is invalid"});}

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return reply.status(401).send({ error: "Invalid passwords." });
        }


        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "6h" }
        );


        reply.status(200).send({
            message: "Login successful.",
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        reply.status(500).send({ error: "An error occurred while processing your request." });
    }
};