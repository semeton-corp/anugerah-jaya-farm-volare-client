import api from "./api";
import imageCompression from "browser-image-compression";

const token = localStorage.getItem("token");

export const uploadFile = async (file) => {
  if (!file) throw new Error("No file provided");

  let fileToUpload = file;

  if (file.type.startsWith("image/") && file.size > 2 * 1024 * 1024) {
    try {
      const options = {
        maxSizeMB: 1,
        masWidthOrHeight: 1920,
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, options);
      console.log(
        `✅ Compression complete: ${(
          (fileToUpload.size / file.size) *
          100
        ).toFixed(2)}% of original`
      );
    } catch (error) {
      console.warn("⚠️ Compression failed, uploading original file.", error);
    }
  }

  console.log(
    `🚀 Uploading file: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`
  );

  const formData = new FormData();
  formData.append("file", fileToUpload);

  try {
    const response = await api.post("/files/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    return response.data?.data?.url || response.data?.url;
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};
