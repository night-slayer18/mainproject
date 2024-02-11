const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Use express.urlencoded for form data
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'C:/Users/acer/mainproject/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]), (req, res) => {
  res.send('Files uploaded successfully');
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
