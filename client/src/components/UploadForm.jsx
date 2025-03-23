import { useState } from "react";
import axios from "axios";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type (Only images/PDFs)
    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload PNG, JPG, or PDF.");
      return;
    }

    // Validate file size (1MB max)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB limit.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file.");

    const formData = new FormData();
    formData.append("document", file);

    try {
      setLoading(true);
      setError("");
      setExtractedData(null);

      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

        setExtractedData(response.data.data);
      

    } catch (err) {
      setError("Error processing document. Please try again.");
      setFile(null);
      setPreview(null);
    } finally {
      setLoading(false);
      setFile(null);
      setPreview(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">Upload Aadhaar Card</h2>
      <p className="text-center mb-6">
        Please upload a clear image or PDF of your Aadhaar card. Ensure the file is less than <strong>2MB</strong> and in <strong>PNG, JPG, or PDF</strong> format.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Select File</label>
          <input
            type="file"
            accept="image/png, image/jpeg, application/pdf"
            onChange={handleFileChange}
            className="border border-gray-700 text-gray-700 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {preview && (
          <div className="mt-4">
            <p className="text-gray-700 font-medium">Preview:</p>
            <img src={preview} alt="Preview" className="w-40 h-auto mt-2 border rounded" />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded text-white font-bold ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload & Extract"}
        </button>
      </form>

      {/* Display Extracted Data */}
      {extractedData && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Extracted Data - also stored in Database</h3>
          <p className="text-gray-700"><strong>Name:</strong> {extractedData.name}</p>
          <p className="text-gray-700"><strong>Aadhaar Number:</strong> {extractedData.aadhaarNumber}</p>
          <p className="text-gray-700"><strong>DOB:</strong> {extractedData.dob}</p>
          <p className="text-gray-700"><strong>Address:</strong> {extractedData.address}</p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
