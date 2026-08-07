import ImageKit from "imagekit";

const client = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// create unique filename
function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}

// uploading chat media
async function uploadChatMedia(file) {
  const fileName = createFileName(
    file.originalname || file.originalName || "upload",
  );

  try {
    const result = await client.upload({
      file: file.buffer,
      fileName,
      folder: "/chat",
      checks: "file.size < 25MB",
    });

    console.log(result);
    return result.url;
  } catch (error) {
    console.error("ImageKit upload failed", error);
    throw error;
  }
}

export default uploadChatMedia;
