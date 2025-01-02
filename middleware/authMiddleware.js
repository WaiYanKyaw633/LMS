const jwt = require("jsonwebtoken");

exports.authenticate = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.code(401).send({ error: "Authentication token is missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded;

        console.log("Authenticated User:", request.user);
    } catch (err) {
        console.error("Authentication error:", err.message);
        reply.code(401).send({ message: "Unauthorized. Invalid or expired token." });
    }
};

exports.authorizeRole = (roles) => async (request, reply) => {
    try {
       if (!request.user || !roles.includes(request.user.role)) {
            return reply.code(403).send({ message: "Forbidden." });
        }
    } catch (err) {
        console.error("Authorization error:", err);
        reply.code(403).send({ message: "Forbidden." });
    }
};
