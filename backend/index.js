const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const folderPath = "C:/Users/acer/mainproject/backend/data/";

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Use express.urlencoded for form data
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"C:/Users/acer/mainproject/backend/data/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]), (req, res) => {
//   res.send('Files uploaded successfully');
// });

app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]), async(req, res) => {
  // Assuming 'video' is the key for the uploaded video file
  const videoFile = req.files['video'][0];

  if (!videoFile) {
    return res.status(400).send('No video file provided');
  }

  const filename = videoFile.originalname;
  console.log(filename)
  const originalFilename = videoFile.originalname;
  const fileExtension = path.extname(originalFilename);
  const filenameWithoutExtension = path.basename(originalFilename, fileExtension);
  const modifiedFilename = `${filenameWithoutExtension}_1${fileExtension}`;
  console.log(modifiedFilename)
  const filePath = path.join(folderPath, modifiedFilename);

  //const filePath = path.join(folderPath, filename);

  await waitForFile(filePath); 

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

async function waitForFile(filePath) {
  let previousSize = -1;
  let currentSize;
  let fileExists = false;

  return new Promise((resolve, reject) => {
    const checkFile = () => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fileExists = true;
        }
      });

      if (!fileExists) {
        // File doesn't exist yet, continue checking
        return;
      }

      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }

        currentSize = stats.size;

        if (currentSize === previousSize) {
          // File size remains constant, indicating file writing is complete
          clearInterval(checkInterval);
          resolve();
        } else {
          previousSize = currentSize;
        }
      });
    };

    const checkInterval = setInterval(checkFile, 10000); // Check file every second
    checkFile(); // Check file immediately
  });
}

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
