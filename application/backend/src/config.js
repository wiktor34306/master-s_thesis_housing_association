require("dotenv").config();

const config = {
    port: process.env.PORT || 3001,
    JwtSecret: process.env.SECRET_KEY
};

export default config