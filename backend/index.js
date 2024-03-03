const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const folderPath = 'C:/Users/acer/vidsum/code/';

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Use express.urlencoded for form data
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'C:/Users/acer/vidsum/code/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]), (req, res) => {
//   res.send('Files uploaded successfully');
// });

app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]), (req, res) => {
  // Assuming 'video' is the key for the uploaded video file
  const videoFile = req.files['video'][0];

  if (!videoFile) {
    return res.status(400).send('No video file provided');
  }

  const filename = videoFile.originalname;
  const filePath = path.join(folderPath, filename);

  // Read the file content
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading file');
    } else {
      // Send the file content as the response
      res.setHeader('Content-Type', 'video/mp4'); // Set the appropriate content type
      res.send(data);
    }
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
