 const express = require("express");
 const resourceRoutes = require("./routers/resourceRoutes");
 const authRoutes =  require("./routers/auth");

const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "CampusReuse API is running"
    });
});

connectDB();

if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`CampusReuse server running on port ${PORT}`);
    });
}

module.exports = app;