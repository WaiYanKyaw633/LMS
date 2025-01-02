const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        console.log("Hashed password:", hashedPassword); 

        await User.create({
            username: "admin",
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin Created Successfully");
        process.exit(0); 
    } catch (err) {
        console.error("Error creating admin:", err);
        process.exit(1); 
    }
}

createAdmin();