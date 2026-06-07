import express from "express";
import * as z from "zod";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";
import { log } from "node:console";

declare global {
  namespace Express {
    export interface Request {
      userId: string;
    }
  }
}

const app = express();

const signupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  // hash the password
  const parsedInput = signupSchema.safeParse(req.body);

  if (!parsedInput.success) {
    return res.status(400).json({
      message: "Invalid Inputs",
      errors: parsedInput.error.issues,
    });
  }

  const { username, password } = parsedInput.data;

  try {
    await UserModel.create({
      username,
      password,
    });

    return res.status(201).json({
      message: "Signed up successfully!",
    });
  } catch (e) {
    return res.status(409).json({
      message: "User already exists",
    });
  }
});

const signinSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

app.post("/api/v1/signin", async (req, res) => {
  const parsedSinput = signinSchema.safeParse(req.body);

  if (!parsedSinput.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: parsedSinput.error.issues,
    });
  }

  const { username, password } = parsedSinput.data;

  try {
    const existingUser = await UserModel.findOne({
      username,
      password,
    });

    if (existingUser) {
      const token = jwt.sign(
        {
          id: existingUser._id,
        },
        JWT_PASSWORD,
      );

      return res.json({
        token,
      });
    } else {
      return res.status(403).json({
        message: "Incorrect credentials",
      });
    }
  } catch (e) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

const contentSchema = z.object({
  title: z.string().min(1),
  link: z.url(),
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const parsedContent = contentSchema.safeParse(req.body);

  if (!parsedContent.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsedContent.error.issues,
    });
  }

  const { title, link } = parsedContent.data;

  try {
    await ContentModel.create({
      title,
      link,
      userId: req.userId,
      tags: [],
    });

    return res.status(201).json({
      message: "content added",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const content = await ContentModel.find({
      userId: req.userId,
    }).populate("userId", "username");
    return res.json({
      content,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

const deleteSchema = z.object({
  contentId: z.string(),
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const parsedDelete = deleteSchema.safeParse(req.body);

  if (!parsedDelete.success) {
    return res.status(400).json({
      message: "Invalide delete request",
      error: parsedDelete.error.issues,
    });
  }

  const { contentId } = parsedDelete.data;

  try {
    await ContentModel.deleteOne({
      _id: contentId,
      userId: req.userId,
    });
    return res.json({
      message: "Deleted",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

const shareSchema = z.object({
  share: z.boolean(),
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const parsedShare = shareSchema.safeParse(req.body);

  if (!parsedShare.success) {
    return res.status(400).json({
      message: "Invalid Share input",
      error: parsedShare.error.issues,
    });
  }

  const { share } = parsedShare.data;

  try {
    if (share) {
      const existingLink = await LinkModel.findOne({
        userId: req.userId,
      });

      if (existingLink) {
        return res.json({
          hash: existingLink.hash,
        });
      }

      const hash = random(10);
      if (!existingLink) {
        await LinkModel.create({
          userId: req.userId,
          hash: hash,
        });
      }
    } else {  
        await LinkModel.deleteOne({
        userId: req.userId,
      });

      return res.json({
        message: "Removed link",
      });
    }
  } catch (e) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash: hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect link",
    });
    return;
  }

  const content = await ContentModel.find({
    userId: link.userId,
  });

  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    return res.status(411).json({
      message: "Sorry incorrect link",
    });
  }

  return res.json({
    username: user.username,
    content: content,
  });
});

app.listen(3000);
