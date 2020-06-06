var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require('fs');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
var mongoose = require('mongoose');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
dotenv.config();


var Teacher = require('../models/teacher');
router.use(methodOverride('_method'));


// Create mongo connection
const conn = mongoose.createConnection(process.env.MONGO_URI);

// Init gfs
let quizgfs, assignmentgfs, materialgfs;

conn.once('open', () => {
  // Init stream
  quizgfs = Grid(conn.db, mongoose.mongo);
  quizgfs.collection('quiz');
  assignmentgfs = Grid(conn.db, mongoose.mongo);
  assignmentgfs.collection('assignment');
  materialgfs = Grid(conn.db, mongoose.mongo);
  materialgfs.collection('material');
  

});

// Create storage engine
const quizstorage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'quiz'
        };
        resolve(fileInfo);
    });
  }
});
const assignmentstorage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'assignment'
        };
        resolve(fileInfo);
    });
  }
});
const materialstorage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'material'
        };
        resolve(fileInfo);
    });
  }
});
const quizupload = multer({ storage: quizstorage });
const assignmentupload = multer({ storage: assignmentstorage });
const materialupload = multer({ storage: materialstorage });


// Main Teacher Page

router.get('/', (req, res) => {

      res.render('teacher.ejs');
    }
  );

//Quiz Part

router.get('/quiz', (req, res) => {
  quizgfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('teacherquiz.ejs', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('teacherquiz.ejs', { files: files });
    }
  });
});

//assignment Part

router.get('/assignment', (req, res) => {
  assignmentgfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('teacherassignment.ejs', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('teacherassignment.ejs', { files: files });
    }
  });
});

//Material Part 

router.get('/material', (req, res) => {
  materialgfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('teachermaterial.ejs', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('teachermaterial.ejs', { files: files });
    }
  });
});

// Post Routes

// Add Quiz
router.post('/addquiz', quizupload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/teacher');
});


// Add Assignment
router.post('/addassignment', assignmentupload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/teacher');
});

// Add material
router.post('/addmaterial', materialupload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/teacher');
});


//Delete Routes

router.delete('/quiz/:id', (req, res) => {
  quizgfs.remove({ _id: req.params.id, root: 'quiz' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/teacher');
  });
});

router.delete('/assignment/:id', (req, res) => {
  assignmentgfs.remove({ _id: req.params.id, root: 'assignment' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/teacher');
  });
});
router.delete('/material/:id', (req, res) => {
  materialgfs.remove({ _id: req.params.id, root: 'material' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/teacher');
  });
});
module.exports = router;
