import express from "express";
import upload from "../middleware/upload.js"
import { uploadDocument, getDocuments } from "../controllers/documentController.js";

const router = express.Router();

router.post("/upload", upload.single("document"), uploadDocument);
router.get("/documents", getDocuments);

export default router;
