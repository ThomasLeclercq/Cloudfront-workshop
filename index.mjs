import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

export async function handler(event) {
  try {
    console.log({ event: JSON.stringify(event) })

    const { queryStringParameters, path  } = event;
    const { w, h, ext } = queryStringParameters || {};
    const width = parseInt(w);
    const height = parseInt(h);
    const originalFormat = ext?.toLowerCase();
    
    const baseFileName = path .split('/').pop().split('.')[0];
    const desiredFormat = path .split('/').pop().split('.')[1];

    const sourceKey = `original/${baseFileName}.${originalFormat || desiredFormat}`;

    console.log({ width, height, originalFormat, desiredFormat, baseFileName, sourceKey, bucket: process.env.BUCKET_NAME })

    const s3 = new S3Client({ region: 'us-east-1' });
    const obj = await s3.send(new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: sourceKey
    }));

    
    let data;
    if (width && height) {
      const buffer = await obj.Body.transformToByteArray();
      data = await sharp(buffer)
        .resize(width, height)
        .toFormat(desiredFormat || "jpeg")
        .toBuffer()
    } else {
      data = await obj.Body.transformToString('base64');
    }

    // API Gateway response
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': `image/${desiredFormat}`,
        'Cache-Control': 'public, max-age=31536000',
      },
      isBase64Encoded: true,
      body: data.toString('base64'),
    };
    console.log({ response })
    return response;

  } catch(err) {
    console.error('Error:', err);
    return {
      status: 500,
      body: 'Internal server error',
    };
  }
}