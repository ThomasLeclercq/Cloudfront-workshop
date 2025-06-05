import 'dotenv/config'
import { describe } from "mocha";
import fs from "fs";

import { handler } from "../Cloudfront-workshop/index.mjs";

const TRANSFORM_TO_AVIF_FORMAT_EVENT = {
  "path": "/original/wallpaper.avif",
  "queryStringParameters": {
    "w": "256",
    "h": "256",
    "ext": "jpg"
  }
}

const ORIGINAL_EVENT = {
  "path": "/original/wallpaper.jpg",
  "queryStringParameters": null
}

describe("Test CloudfrontResize function", async function() {
  it("should load original image", async function() {
    handler(ORIGINAL_EVENT).then( response => {
      console.log({ response });
      fs.writeFileSync('wallpaper.jpg', Buffer.from(response.body, 'base64'));
     }).catch(err => {
      console.error(err);
     })
  });
  it("resizes the wallpaper image into a avif format", async function() {
    handler(TRANSFORM_TO_AVIF_FORMAT_EVENT).then( response => {
      console.log({ response });
      fs.writeFileSync('wallpaper.avif', Buffer.from(response.body, 'base64'));
     }).catch(err => {
      console.error(err);
     })
  });
})