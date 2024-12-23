import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();


const MONGO_URI = process.env.MONGO_URI || "";



export const dbconn = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("DB Connection URL Not Found");
        }

        await mongoose.connect(MONGO_URI);
        console.log(
            " [DB] ::  Mongo Connected Successfully at host",
            mongoose.connection.host,
            "and port",
            mongoose.connection.port
        );
    } catch (e) {
        console.log(e.message);
        process.exitCode = 1;
    }
}