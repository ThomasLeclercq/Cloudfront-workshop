import 'dotenv/config'
import { describe } from "mocha";
import fs from "fs";

import { handler } from "../Cloudfront-workshop/index.mjs";

describe("Test CloudfrontResize function", async function() {
  it("resizes the wallpaper image into a avif format", async function() {
    handler({
      Records: [
        {
          cf: {
            request: {
              method: "GET",
              uri: "/assets/wallpaper.avif",
              querystring: "w=256&h=256&ext=jpg",
              headers: {
                host: [{ key: "Host", value: "https://d19zywjvxn7evl.cloudfront.net/" }],
              }
            }
          }
        }
      ]
    }).then( response => {
      console.log({ response });
      fs.writeFileSync('wallpaper.avif', Buffer.from(response.body, 'base64'));
     }).catch(err => {
      console.error(err);
     })
  });
})