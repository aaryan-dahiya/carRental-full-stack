import { response } from "express";
import imagekit from "../configs/imageKit.js";
import User from "../models/user.js";
import fs, { rmSync } from 'fs';
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";

export const changeRoleToOwner=async(req, res)=>{
    try{
        const {_id}=req.user;
        await User.findByIdAndUpdate(_id,{role:"owner"})
        res.json({success:true,message:"Now you can list cars"})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})

    }
}

export const addCar=async(req, res)=>{
    try{
        const {_id}=req.user;
        let car=JSON.parse(req.body.carData);
        const imageFile=req.file;

        //upload image to imagekit
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response= await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:'/cars'
        })

        //for url generation
        var optimizedImageURL=imagekit.url({
            path:response.filePath,
            transformation:[
                {width:'1280'},
                {quality:'auto'},
                {format:'webp'}
            ]
        });

        const image=optimizedImageURL
        await Car.create({...car,owner:_id,image})

        res.json({success:true,message:"Car added"})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to list owner cars
export const getOwnerCars=async(req, res)=>{
    try{
        const {_id}=req.user;
        const cars=await Car.find({owner:_id})
        res.json({success:true,cars})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

// API to toggle car availability
export const toggleAvailability=async(req, res)=>{
    try{
        const {_id}=req.user;
        const {carId}=req.body;
        const car=await Car.findById(carId);

        //checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({success:false,message:"Unauthorized"})
        }

        car.isAvaliable = !car.isAvaliable;
        await car.save();
        res.json({success:true,message:"Availability toggled"})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

// API to delete a car
export const deleteCar=async(req, res)=>{
    try{
        const {_id}=req.user;
        const {carId}=req.body;
        const car=await Car.findById(carId);

        //checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({success:false,message:"Unauthorized"})
        }

        car.owner=null;
        car.isAvaliable=false;
        await car.save();
        res.json({success:true,message:"Car removed"})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to get dashboard data
export const getDashboardData=async(req, res)=>{
    try{
        const {_id,role}=req.user;
        if(role !== "owner"){
            return res.json({success:false,message:'Unauthorized'})
        }

        const cars=await Car.find({owner:_id})
        const bookings=await Booking.find({owner:_id}).populate('car').sort({createdAt:-1})
        const pendingBookings=await Booking.find({owner:_id,status:'pending'})
        const completedBookings=await Booking.find({owner:_id,status:'confirmed'})

        //Calculate monthlyRevenue from bookings where status is confimed
        const monthlyRevenue=bookings.slice().filter(booking=> booking.status === 'confirmed').reduce((acc,booking)=> acc+booking.price,0)
        const dashboardData={
            totalCars:cars.length,
            totalBookings:bookings.length,
            pendingBookings:pendingBookings.length,
            completedBookings:completedBookings.length,
            recentBookings:bookings.slice(0,3),
            monthlyRevenue:monthlyRevenue
        }

        res.json({success:true,dashboardData})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//API to update user image
export const updateUserImage=async(req, res)=>{
    try{
        const {_id}=req.user;
        const imageFile=req.file;

        //upload image to imagekit
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response= await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:'/users'
        })

        //for url generation
        var optimizedImageURL=imagekit.url({
            path:response.filePath,
            transformation:[
                {width:'400'},
                {quality:'auto'},
                {format:'webp'}
            ]
        });

        const image=optimizedImageURL;
        await User.findByIdAndUpdate(_id,{image})
        res.json({success:true,message:"Image updated"})
        
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}