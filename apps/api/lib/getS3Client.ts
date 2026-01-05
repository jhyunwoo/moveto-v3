import { Bindings } from "./env";
import { S3Client } from "@aws-sdk/client-s3";

const getS3Client = (env: Bindings) => {
  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT, // R2 Endpoint
    credentials: {
      accessKeyId: env.R2_KEY,
      secretAccessKey: env.R2_SECRET,
    },
    forcePathStyle: true, // R2/S3 호환성 위해 권장
  });
};

export default getS3Client;
