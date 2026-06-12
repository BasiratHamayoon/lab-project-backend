const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const connectDB = require("./config/db.config")
const errorMiddleware = require("./middleware/error.middleware")

const authRoutes = require("./routes/auth.routes")
const videoRoutes = require("./routes/video.routes")
const articleRoutes = require("./routes/article.routes")
const contactRoutes = require("./routes/contact.routes")
const publicationRoutes = require("./routes/publication.routes")

const app = express()

connectDB()

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:4000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lab Backend API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  })
})

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" })
})

app.use("/api/auth", authRoutes)
app.use("/api/videos", videoRoutes)
app.use("/api/articles", articleRoutes)
app.use("/api/contacts", contactRoutes)
app.use("/api/publications", publicationRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`)
  console.log(`🔓 CORS allowed origins: ${allowedOrigins.join(", ")}\n`)
})