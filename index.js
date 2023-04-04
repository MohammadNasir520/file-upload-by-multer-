

// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const multer = require('multer');
// const filestack = require('filestack-js')
// const client = filestack.init("AIC3udYINRkuqKBkpIER6z");
// require("dotenv").config()

// app.use(cors()); // enable CORS for all origins
// app.use(bodyParser.json()); // handle JSON payloads
// app.use(express.json())

// // connect to MongoDB database
// const database = module.exports = () => {
//     const connectionParams = {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     }

//     try {
//         mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c5dej4c.mongodb.net/duckcart?retryWrites=true&w=majority`, connectionParams)
//         console.log('database connected successfully')

//     } catch (error) {
//         console.log(error)
//     }
// }
// database()

// // define PDF schema
// const pdfSchema = new mongoose.Schema({
//     url: String,
//     name: String,
// });

// // define PDF model
// const Pdf = mongoose.model('Pdf', pdfSchema);

// // configure multer to handle file uploads
// const upload = multer({
//     storage: multer.memoryStorage({
//         filename: function (req, file, callback) {
//             console.log('file for name', file)
//             callback(res.json('error'), file.originalname);
//         }
//     })
// });





// app.post('/api/upload', upload.single('pdfFile'), async (req, res) => {
//     try {
//         console.log('hit')
//         console.log(req.file.buffer)




//         const file = req.file;


//         // Upload file to Filestack

//         const filestackResponse = await client.upload(file.buffer)
//         const pdfUrl = filestackResponse.url;
//         console.log('response', filestackResponse)


//         // Save PDF url to database
//         const pdf = new Pdf({ url: pdfUrl, name: file.originalname });
//         const savedPdf = await pdf.save();

//         res.json(savedPdf);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json('Error uploading PDF');
//     }
// });



// app.get('/api/download/:id', async (req, res) => {
//     try {
//         // Get the PDF from the database by ID
//         const pdf = await Pdf.findById(req.params.id);

//         // Download the PDF from the URL using Axios
//         const response = await axios.get(pdf.url, {
//             responseType: 'arraybuffer'
//         });

//         // Set the Content-Disposition header to force a download
//         res.setHeader('Content-Disposition', `attachment; filename="${pdf.name}"`);

//         // Pipe the PDF buffer to the response
//         const pdfBuffer = Buffer.from(response.data, 'binary');
//         res.type('application/pdf').send(pdfBuffer);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json('Error downloading PDF');
//     }
// });






// app.listen(5000, () => {
//     console.log('Server started on port 5000');
// });

const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require('cors');
const bodyParser = require('body-parser');

// express app initialization
const app = express();
app.use(bodyParser.json());
app.use(cors()); // enable CORS for all origins
// app.use(bodyParser.json()); // handle JSON payloads
app.use(express.json())
// File upload folder
const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    credentials: true
};

app.use(cors(corsOptions));


const UPLOADS_FOLDER = "./uploads/";

// var upload = multer({ dest: UPLOADS_FOLDER });

// define the storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName =
            file.originalname
                .replace(fileExt, "")
                .toLowerCase()
                .split(" ")
                .join("-") +
            "-" +
            Date.now();

        cb(null, fileName + fileExt);
    },
});



// preapre the final multer upload object
var upload = multer({
    storage: storage,
    limits: {
        fileSize: 15000000, // 15MB
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "avatar") {
            if (
                file.mimetype === "image/png" ||
                file.mimetype === "image/jpg" ||
                file.mimetype === "image/jpeg"
            ) {
                cb(null, true);
            } else {
                cb(new Error("Only .jpg, .png or .jpeg format allowed!"));
            }
        } else if (file.fieldname === "doc") {
            if (file.mimetype === "application/pdf") {
                cb(null, true);
            } else {
                cb(new Error("Only .pdf format allowed!"));
            }
        } else {

        }
    },
});

// application route
app.post(
    "/",
    upload.fields([
        {
            name: "avatar",
            maxCount: 2,
        },
        {
            name: "doc",
            maxCount: 1,
        },
    ]),
    (req, res, next) => {
        // res.json("success");
        console.log('files', req.files)
        console.log('doc console:', req.files.doc[0].path)
        // console.log('avater console:', req.files.avatar[0].path)
        res.json(req.files)
    }
);

// default error handler
app.use((err, req, res, next) => {
    if (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).json("There was an upload error!");
        } else {
            res.status(500).json(err.message);
        }
    } else {
        res.json("success");
    }
});




app.get('/downloadPdf', (req, res) => {



    const filePath = './uploads/md.nasiruddincertificate-1680634241113.pdf';
    res.download(filePath);

})




app.listen(5000, () => {
    console.log("app listening at port 5000");
});


