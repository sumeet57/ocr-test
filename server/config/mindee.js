import mindee from "mindee";
import dotenv from "dotenv";

dotenv.config();

const mindeeClient = new mindee.Client({ apiKey: process.env.MINDEE_API_KEY });

if (mindeeClient) {
    console.log("Mindee client connected successfully.");
}

export default mindeeClient;
