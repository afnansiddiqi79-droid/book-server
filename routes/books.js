import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

export const booksRouter = Router();

const COLLECTION = "books";

booksRouter.get("/", async (req, res, next) => {
  try {
    const db = getDB();
    const books = await db
      .collection(COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return res.json(books);
  } catch (err) {
    return next(err);
  }
});

booksRouter.get("/:id", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }
    const db = getDB();
    const book = await db
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.json(book);
  } catch (err) {
    return next(err);
  }
});

booksRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { title, author, category, image, description, totalCopies } =
      req.body ?? {};

    if (!title || !author || !category) {
      return res
        .status(400)
        .json({ message: "Title, author and category are required" });
    }
    const copies = Number(totalCopies);
    if (!Number.isFinite(copies) || copies < 1) {
      return res
        .status(400)
        .json({ message: "totalCopies must be at least 1" });
    }

    const db = getDB();
    const books = db.collection(COLLECTION);
    const result = await books.insertOne({
      title: title.trim(),
      author: author.trim(),
      category,
      image: image ?? "",
      description: description ?? "",
      totalCopies: copies,
      availableCopies: copies,
      addedBy: req.userId,
      addedByName: req.userName ?? req.userEmail ?? "Unknown",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const book = await books.findOne({ _id: result.insertedId });
    return res.status(201).json(book);
  } catch (err) {
    return next(err);
  }
});

booksRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }
    const db = getDB();
    const books = db.collection(COLLECTION);

    const existing = await books.findOne({ _id: new ObjectId(req.params.id) });
    if (!existing) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (String(existing.addedBy) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await books.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          title: String(req.body.title ?? existing.title).trim(),
          author: String(req.body.author ?? existing.author).trim(),
          category: String(req.body.category ?? existing.category),
          image: typeof req.body.image === "string" ? req.body.image : existing.image,
          description: typeof req.body.description === "string" ? req.body.description : existing.description,
          totalCopies: Number(req.body.totalCopies ?? existing.totalCopies),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return res.json(updated.value);
  } catch (err) {
    return next(err);
  }
});

booksRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }
    const db = getDB();
    const books = db.collection(COLLECTION);

    const existing = await books.findOne({ _id: new ObjectId(req.params.id) });
    if (!existing) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (String(existing.addedBy) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const deleted = await books.deleteOne({ _id: new ObjectId(req.params.id) });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});
