import multer,{StorageEngine} from "multer";
import express ,{ Request, Response, NextFunction } from "express";

const MIME_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg':'jpg',
    'image/jpg':'jpg'
};

const storage : StorageEngine = multer.diskStorage({
destination:(req : Request , file : Express.Multer.File , cb : any) =>{
    console.log("Received file MIME type:", file.mimetype);
    const isValid = MIME_TYPE_MAP[file.mimetype as keyof typeof MIME_TYPE_MAP]; 
    let error: Error | null = isValid ? null : new Error("Invalid mime type");
    cb(error , "backend/images");
},
filename : (req : Request, file : any, cb :any)=>{
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype as keyof typeof MIME_TYPE_MAP];
    cb(null , name + '-' + Date.now()+ '.'+ ext);
}
})


const upload = multer({ storage : storage }).single("image");

export default {upload};