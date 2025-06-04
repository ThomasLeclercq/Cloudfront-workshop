import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

export async function handler(event) {
  try {
    console.log({ event })
    const request = event.Records[0].cf.request;
    const params = new URLSearchParams(querystring);
    const width = parseInt(params.get('w'));
    const height = parseInt(params.get('h'));
    const originalFormat = params.get('ext');

    const fileName = request.uri.split('/').pop().split('.')[0];
    const desiredFormat = request.uri.split('/').pop().split('.')[1];
    const sourceKey = `original/${fileName}.${originalFormat}`;

    const s3 = new S3Client({ region: 'us-east-1' });
    const obj = await s3.send(new GetObjectCommand({
      Bucket: 'cloufront-workshop',
      Key: sourceKey
    }));

    const buffer = await obj.Body.transformToByteArray();

    const response = await sharp(buffer)
      .resize(width, height)
      .toFormat(desiredFormat || "jpeg")
      .toBuffer()

    // API Gateway response
    // return {
    //   statusCode: 200,
    //   headers: {
    //     'Content-Type': `image/${desiredFormat}`,
    //     'Cache-Control': 'public, max-age=31536000',
    //   },
    //   isBase64Encoded: true,
    //   body: response.toString('base64'),
    // };
    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'cache-control': [{ key: 'Cache-Control', value: 'public, max-age=31536000' }],
        'content-type': [{ key: 'Content-Type', value: `image/${originalFormat}` }],
      },
      body: response.toString('base64'),
      bodyEncoding: 'base64',
    }

  } catch(err) {
    console.error('Error:', err);
    return {
      status: 500,
      body: 'Internal server error',
    };
  }
}