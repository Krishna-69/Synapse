import express from "express";
import * as z from "zod";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";

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
        return res.status(500)
                  .json({
                    message: "Internal server error"
                  })
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
    contentId: z.string()
});


app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const parsedDelete = deleteSchema.safeParse(req.body);
    
    if (!parsedDelete.success) {
      return res.status(400)
                .json({
                    message: "Delete Invalide", 
                    error: parsedDelete.error.issues
                })
    }

    const {contentId} = parsedDelete.data;

  await ContentModel.deleteMany({
    _id: contentId,
    userId: req.userId,
  });
  return res.json({
    message: "Deleted",
  });
});

app.post("/api/v1/brain/share", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(3000);
