import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

interface ImgBBImage {
    filename: string;
    name: string;
    mime: string;
    extension: string;
    url: string;
  }
  
  interface ImgBBData {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: ImgBBImage;
    thumb: ImgBBImage;
    delete_url: string;
  }
  
  interface ImgBBResponse {
    data: ImgBBData;
    success: boolean;
    status: number;
  }
export const filerouter = hono().post("/upload-image", async (c) => {
  // Use zod to validate that a file is present
  const body = await c.req.parseBody();

  const file = body["image"]; // Assuming the file input is named "image"
  // Check if the uploaded file is a Blob (which includes File)
  if (!(file instanceof Blob)) {
    return c.json({ error: "No file uploaded or invalid file type" }, 400);
  }

  // Create FormData to send the file
  const uploadData = new FormData();
  uploadData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${c.env.IMGBB_API_KEY}`,
    {
      method: "POST",
      body: uploadData,
    }
  );

  console.log(c.env.IMGBB_API_KEY)
  const result = (await response.json()) as
    | ImgBBResponse
    | {
        error: {
          message: string;
        };
      };

  if ("data" in result && result?.success) {
    return c.json({ url: result.data.url, deleteUrl: result.data.delete_url });
  } else {
    return c.json(
      {
        error: "Image upload failed",
        message: "error" in result ? result.error.message : "",
      },
      400
    );
  }
})