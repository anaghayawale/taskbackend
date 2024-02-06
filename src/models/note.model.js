import mongoose, { Schema } from "mongoose";

const noteSchema = mongoose.Schema(  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
        type: String,
        required: true,
      },
  },
  {
    timestamps: true,
  }
);

noteSchema.pre("updateOne", function (next) {
    if (this.userId == this.userId._id) {
      next();
    }
  });

export const Note = mongoose.model("Note", noteSchema);
