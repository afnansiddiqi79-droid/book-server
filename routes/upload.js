
import { Router } from "express";

const uploadRouter = Router();

uploadRouter.post("/", async (req, res, next) => {
  try {
    const { image } = req.body ?? {};

    if (!image || typeof image !== "string") {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    if (!process.env.IMGBB_API_KEY) {
      return res.status(500).json({
        message: "ImgBB API key is missing",
      });
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const form = new FormData();
    form.append("image", base64Image);

    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: form,
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadData?.success) {
      return res.status(502).json({
        message: uploadData?.error?.message || "ImgBB upload failed",
      });
    }

    return res.status(200).json({
      imageUrl: uploadData.data.url,
    });
  } catch (error) {
    next(error);
  }
});

export default uploadRouter;
