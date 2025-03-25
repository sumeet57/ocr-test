import fs from "fs";
import mindee from "mindee";
import mindeeClient from "../config/mindee.js";
import Document from "../models/document.model.js";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("📂 File received:", req.file.path);

    // Load the uploaded file into Mindee
    const inputSource = mindeeClient.docFromPath(req.file.path);

    // Create a custom endpoint for Aadhaar card processing
    const customEndpoint = mindeeClient.createEndpoint(
      "aadhar_card",
      "sumeet1",
      "1"
    );

    // ✅ Submit document to Mindee and wait for response
    const asyncApiResponse = await mindeeClient.enqueueAndParse(
      mindee.product.GeneratedV1,
      inputSource,
      { endpoint: customEndpoint }
    );

    // ✅ Ensure document is retrieved correctly
    if (!asyncApiResponse.document || !asyncApiResponse.document.inference) {
      console.error("❌ No inference data found.");
      return res
        .status(500)
        .json({ error: "Failed to extract data from the document." });
    }

    // 🔥 Extract fields manually from prediction object
    const prediction = asyncApiResponse.document.inference.prediction;

    if (!prediction || Object.keys(prediction).length === 0) {
      console.error("❌ Prediction data is empty.");
      return res.status(500).json({
        error:
          "No relevant data extracted. Please try again with a clearer image.",
      });
    }

    // ✅ Prevent storing empty values in MongoDB
    const aadharNumber = prediction.fields.get("aadhar_number")?.value || "NAN";
    const fullName = prediction.fields.get("full_name")?.value || "NAN";
    const address = prediction.fields.get("address")?.value || "NAN";
    const gender = prediction.fields.get("gender")?.value || "NAN";
    const phoneNumber = prediction.fields.get("phone_number")?.value || "NAN";
    const dob = prediction.fields.get("date_of_birth")?.value || "NAN";


    if (
      !aadharNumber ||
      !fullName ||
      !address ||
      !gender ||
      !phoneNumber ||
      !dob
    ) {
      console.error("❌ Missing extracted fields.");
      return res.status(500).json({
        error: "Incomplete data extracted. Please check the document clarity.",
      });
    }

    // ✅ Store extracted data in MongoDB
    const newDocument = new Document({
      name: fullName,
      aadhaarNumber: aadharNumber,
      dob,
      address,
      gender,
      phoneNumber,
    });

    await newDocument.save();

    res.json({
      message: "✅ Document processed successfully",
      data: newDocument,
    });
  } catch (error) {
    console.error("❌ Error processing document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Ensure the uploaded file is deleted from the uploads folder
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
