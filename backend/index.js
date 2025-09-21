import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/user.model.js"
import Message from "./models/message.model.js"

const PORT = 3000

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use('/files', express.static('files'));

mongoose
    .connect("mongodb+srv://jatin04gupta2004_db_user:aLLOouY8JtIHCGsC@cluster0.jkgpco9.mongodb.net/")
    .then(() => { console.log("Connected to Mongo Db"); })
    .catch((err) => { console.log("Error connecting to MongoDb", err); });

app.listen(PORT, () => {
    console.log("Server running on port 3000");
});

// controllers
app.post("/register", (req, res) => {
    const { name, email, password, image } = req.body;
    const newUser = new User({ name, email, password, image });
    newUser
        .save()
        .then(() => {
            res.status(200).json({ message: "User registered successfully" });
        })
        .catch((err) => {
            console.log("Error registering user", err);
            res.status(500).json({ message: "Error registering the user!" });
        });
});

const createToken = (userId) => {
    const payload = {
        userId: userId,
    };
    const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "24h" });
    return token;
};

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(404)
            .json({ message: "Email and the password are required" });
    }
    User.findOne({ email })
        .then((user) => {
            if (!user) { return res.status(404).json({ message: "User not found" }); }
            if (user.password !== password) {
                return res.status(404).json({ message: "Invalid Password!" });
            }
            const token = createToken(user._id);
            res.status(200).json({ token });
        })
        .catch((error) => {
            console.log("error in finding the user", error);
            res.status(500).json({ message: "Internal server Error!" });
        });
});

app.get("/users/:userId", (req, res) => {
    const loggedInUserId = req.params.userId;

    User.find({ _id: { $ne: loggedInUserId } })
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.log("Error retrieving users", err);
            res.status(500).json({ message: "Error retrieving users" });
        });
});

app.post("/friend-request", async (req, res) => {
    const { currentUserId, selectedUserId } = req.body
    try {
        await User.findByIdAndUpdate(selectedUserId, {
            $push: { friendRequests: currentUserId },
        });
        await User.findByIdAndUpdate(currentUserId, {
            $push: { sentFriendRequests: selectedUserId },
        });
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        console.log("Error sending friend request", error);
    }
})

app.get("/friend-request/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .populate("friendRequests", "name email image")
            .lean();
        const friendRequests = user.friendRequests;
        res.status(200).json(friendRequests);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/friend-request/accept", async (req, res) => {
    try {
        const { senderId, recepientId } = req.body;
        const sender = await User.findById(senderId);
        const recepient = await User.findById(recepientId);
        sender.friends.push(recepientId);
        recepient.friends.push(senderId);
        recepient.friendRequests = recepient.friendRequests.filter(
            (request) => request.toString() !== senderId.toString()
        );
        sender.sentFriendRequests = sender.sentFriendRequests.filter(
            (request) => request.toString() !== recepientId.toString()
        );
        await sender.save();
        await recepient.save();
        res.status(200).json({ message: "Friend Request accepted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/accepted-friends/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate(
            "friends",
            "name email image"
        );
        const acceptedFriends = user.friends;
        res.status(200).json(acceptedFriends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "files/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });

app.post("/messages", upload.single("imageFile"), async (req, res) => {
    console.log("route hitted");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    try {
        const { senderId, recepientId, messageType, messageText } = req.body;
        const newMessage = new Message({
            senderId,
            recepientId,
            messageType,
            message: messageText,
            timestamp: new Date(),
            imageUrl: messageType === "image" ? req.file.path : null,
        });
        console.log("Saving message with imageUrl:", newMessage.imageUrl);
        await newMessage.save();
        res.status(200).json({ message: "Message sent Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const recepientId = await User.findById(userId);
        res.status(200).json(recepientId);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/messages/:senderId/:recepientId", async (req, res) => {
    try {
        const { senderId, recepientId } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: senderId, recepientId: recepientId },
                { senderId: recepientId, recepientId: senderId },
            ],
        }).populate("senderId", "_id name");
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/deleteMessages", async (req, res) => {
    try {
        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "invalid req body!" });
        }
        await Message.deleteMany({ _id: { $in: messages } });
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server" });
    }
});

app.get("/friend-requests/sent/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate("sentFriendRequests", "name email image").lean();
        const sentFriendRequests = user.sentFriendRequests;
        res.status(200).json(sentFriendRequests);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ error: "Internal Server" });
    }
})

app.get("/friends/:userId", (req, res) => {
    try {
        const { userId } = req.params;
        User.findById(userId).populate("friends", "name email image").then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }
            const friendIds = user.friends.map((friend) => friend._id);
            const friends = user.friends
            res.status(200).json({ friendIds, friends });
        })
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "internal server error" })
    }
})

app.get("/friend-requests/received/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate("friendRequests", "name email image").lean();
        const friendRequests = user.friendRequests;
        res.status(200).json(friendRequests);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ error: "Internal Server" });
    }
})