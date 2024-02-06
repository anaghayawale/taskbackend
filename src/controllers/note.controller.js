import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Note } from "../models/note.model.js";
import { bodyDataExists } from "../utils/validation/bodyData.js";

// ------------------------- Add New Note -------------------------
const addNewNote = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const title = req.body.title;
  const content = req.body.content;

  if (bodyDataExists(title,content)) {
    throw new ApiError(400, "Incomplete Data");
  }

  if (!userId) {
    throw new ApiError(500, "Incomplete Data");
  }

  const newNote = new Note({
    userId: userId,
    title: title,
    content: content,
  });
  const addedNote = await newNote.save();
  if (!addedNote) {
    throw new ApiError(500, "Error in adding note");
  }
 
  console.log("addedNote:", addedNote);

  res.status(200).json(new ApiResponse(200, { addedNote }, "Note Added"));
     
});

// ------------------------- Update self Post -------------------------
const updateNote = asyncHandler(async (req, res, next) => {
    const idToUpdate = req.body.noteId;
    const title = req.body.title;
    const content = req.body.content;
    const userIdFromToken = req.user._id;

  if (bodyDataExists(idToUpdate, title, content)) {
    throw new ApiError(400, "Incomplete Data");
  }

  const existingNote = await Note.findOne({
    _id: idToUpdate,
    userId: userIdFromToken,
  });
  if (!existingNote) {
    throw new ApiError(500, "Note not found");
  }

  existingNote.title = title;
  existingNote.content = content;
  const updatedNote = await existingNote.save();

  if (!updatedNote) {
    throw new ApiError(500, "Error in updating Note");
  }

  res.status(200).json(new ApiResponse(200, { updatedNote }, "Note updated"));
});

// ------------------------- Delete Self Post -------------------------
const deleteNote = asyncHandler(async (req, res, next) => {
  const { noteId } = req.body;
  const userIdFromToken = req.user._id;

  if (!noteId) {
    throw new ApiError(400, "Incomplete Data");
  }

  const existingNote = await Note.findOne({
    _id: noteId,
    userId: userIdFromToken,
  });
  if (!existingNote) {
    throw new ApiError(500, "Note not found for this user");
  }

  const deleteResult = await existingNote.deleteOne();
  if (deleteResult.deletedCount === 0) {
    throw new ApiError(500, "Error in deleting Note");
  }

  res.status(200).json(new ApiResponse(200, {}, "Note deleted"));
});

// ------------------------- get All Posts (self) -------------------------
const getAllNotes = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const notes = await Note.find({ userId }).sort({ createdAt: -1 });
  if (!notes) {
    throw new ApiError(500, "Error in fetching notes");
  }

  res.status(200).json(new ApiResponse(200, { notes }, "notes fetched"));
});

export { addNewNote, updateNote, deleteNote, getAllNotes };

