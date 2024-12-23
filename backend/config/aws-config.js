import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const generatePresignedUrl = async (
  key,
  expiresInSeconds = 1000 * 60 * 12
) => {
  try {
    if (expiresInSeconds > 604800) {
      expiresInSeconds = 604800; // Limit to 7 days
    }
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });
    return url;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw new Error("Could not generate pre-signed URL");
  }
};
