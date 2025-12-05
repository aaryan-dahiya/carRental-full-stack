import express from 'express';
import "dotenv/config";
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouters from './routes/userRoutes.js';
import ownerRouter from './routes/ownerRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import aiRouter from './routes/aiRoutes.js';

//initialize express app
const app=express()

//connect database
await connectDB();

//middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=> res.send('server is running'))
app.use('/api/user',userRouters)
app.use('/api/owner',ownerRouter)
app.use('/api/bookings',bookingRouter)
app.use('/api/ai',aiRouter)

const PORT= process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`server running on port ${PORT}`))