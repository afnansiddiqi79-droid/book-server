import { Router } from "express";

export const uploadRouter = Router();

uploadRouter.post("/", async (req, res, next) => {
  try {
    const { image } = req.body ?? {};

    if (!image || typeof image !== "string") {
      return res.status(400).json({ message: "Image is required" });
    }

    const form = new FormData();
    form.append("image", image);
    const uploadResponse = await fetch(
      `https://api.imgbb.com/put?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: form,
      }
    );

    if (!uploadResponse.ok) {
    return res.status(502).json({ message: "Image upload failed" });
  }

  const uploadData = await uploadResponse.json();

    if (!uploadData?.success || !uploadData?.data?.url) {
      return res.status(502).json({ message: "Image upload failed" });
    }

    return res.json({ imageUrl: uploadData.data.url });
  } catch (err) {
    return next(err);
  }
});

export default uploadRouter;
