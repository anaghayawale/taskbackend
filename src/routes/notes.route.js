import { Router } from "express";
import { checkJWT } from "../middleware/auth.middleware.js";
import {
  addNewNote,
  deleteNote,
  updateNote,
  getAllNotes
} from "../controllers/note.controller.js";

const router = Router();

// PROTECTED ROUTES
router.route("/addnote").post(checkJWT, addNewNote);
router.route("/updatenote").put(checkJWT, updateNote);
router.route("/deletenote").delete(checkJWT, deleteNote);
router.route("/getallnotes").get(checkJWT, getAllNotes);


export default router;