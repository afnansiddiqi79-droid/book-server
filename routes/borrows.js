import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

export const borrowsRouter = Router();

const COLLECTION = "borrows";

borrowsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { bookId } = req.body ?? {};

    if (!bookId || !ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const db = getDB();
    const books = db.collection("books");
    const borrows = db.collection(COLLECTION);

    const book = await books.findOne({ _id: new ObjectId(bookId) });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.availableCopies <= 0) {
      return res.status(409).json({ message: "No copies of this book are available" });
    }

    const existing = await borrows.findOne({
      status: "borrowed",
      $or: [{ userId: req.userId }, { userEmail: req.userEmail }],
      bookId: book._id,
    });
    if (existing) {
      return res.status(409).json({ message: "You have already borrowed this book" });
    }

    const updatedBook = await books.findOneAndUpdate(
      { _id: book._id, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { returnDocument: "after" }
    );

    if (!updatedBook) {
      return res.status(409).json({ message: "No copies of this book are available" });
    }

    const borrow = await borrows.insertOne({
      bookId: book._id,
      bookTitle: book.title,
      bookImage: book.image,
      userId: req.userId,
      userEmail: req.userEmail,
      userName: req.userName ?? req.userEmail ?? "Unknown",
      borrowDate: new Date(),
      returnDate: null,
      returnedAt: null,
      status: "borrowed",
      createdAt: new Date(),
    });

    const createdBorrow = await borrows.findOne({ _id: borrow.insertedId });

    return res.status(201).json(createdBorrow);
  } catch (err) {
    return next(err);
  }
});

borrowsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const borrows = await db
      .collection(COLLECTION)
      .find({
        $or: [{ userId: req.userId }, { userEmail: req.userEmail }],
      })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json(borrows);
  } catch (err) {
    return next(err);
  }
});

borrowsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid borrow id" });
    }
    const db = getDB();
    const borrows = db.collection(COLLECTION);

    const borrow = await borrows.findOne({ _id: new ObjectId(req.params.id) });
    if (!borrow) {
      return res.status(404).json({ message: "Borrow not found" });
    }
    const isOwner = borrow.userId
      ? String(borrow.userId) === String(req.userId)
      : borrow.userEmail === req.userEmail;
    if (!isOwner) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (borrow.status !== "borrowed") {
      return res.status(400).json({ message: "This borrow is already returned" });
    }

    const returnedAt = new Date();
    const updatedBorrow = await borrows.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), status: "borrowed" },
      { $set: { status: "returned", returnDate: returnedAt, returnedAt } },
      { returnDocument: "after" }
    );

    if (updatedBorrow) {
      await db
        .collection("books")
        .updateOne(
          { _id: borrow.bookId },
          { $inc: { availableCopies: 1 } }
        );
    }

    return res.json(updatedBorrow);
  } catch (err) {
    return next(err);
  }
});
