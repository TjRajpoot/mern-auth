import express from "express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"
import connectDB from './config/mongodb.js'
import authRouter from './routes/authRoutes.js'
import userRouter from "./routes/userRoutes.js"

const app = express();
const port = process.env.PORT || 4000
connectDB();

// FIXED: Include localhost:5173 for local development
const allowedOrigins = [
    'http://localhost:5173',  // Your local Vite development server
    'https://mern-auth-frontend-9xyz.onrender.com'  // Your production frontend
]

app.use(express.json());
app.use(cookieParser())

// FIXED: Proper CORS configuration
app.use(cors({ 
    origin: allowedOrigins,
    methods: ["POST", "GET"],
    credentials: true 
}))

//API Endpoints
app.get('/', (req, res) => res.send("API Working!"));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(port, () => console.log(`Server started on PORT:${port}`));
