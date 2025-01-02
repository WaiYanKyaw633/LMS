require("dotenv").config();
const fastify = require('fastify')({ logger: true });
const sequelize = require('./config/database');
const authRoutes = require("./routes/authRoutes");
const adminRoutes=require("./routes/adminRoutes");
const userRoures=require("./routes/userRoute")


fastify.register(authRoutes);
fastify.register(adminRoutes);
fastify.register(userRoures);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false});
    console.log("Database connected and models synced successfully.");
  } catch (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
})();

const start = async () => {
  try {
    const PORT = process.env.PORT || 4000;
    await fastify.listen({ port: PORT });
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();