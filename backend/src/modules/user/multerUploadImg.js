import multer from "multer";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//     console.log(file);
//   },
//   filename: (req, file, cb) => {
//     // Define how the file should be named
//     //const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "_" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

const upload = multer({ storage: multer.memoryStorage() }); //The memory storage engine stores the files in memory as Buffer objects. It doesn’t have any options.



export { upload };