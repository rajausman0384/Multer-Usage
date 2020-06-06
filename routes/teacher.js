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

// router.get('/files/:filename', (req, res) => {
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     // Check if file
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: 'No file exists'
//       });
//     }
//     // File exists
//     const readstream = gfs.createReadStream(file.filename);
//     return readstream.pipe(res);
//   });
// });



// // @route GET /image/:filename
// // @desc Display Image
// router.get('/image/:filename', (req, res) => {
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     // Check if file
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: 'No file exists'
//       });
//     }

//     // Check if image
//     if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
//       // Read output to browser
//       const readstream = gfs.createReadStream(file.filename);
//       readstream.pipe(res);
//     } else {
//       res.status(404).json({
//         err: 'Not an image'
//       });
//     }
//   });
// });

/* GET Operations */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');

// });
// router.get('/viewattquiz', function(req, res, next) {
//     res.sendFile(path.join(__dirname, '../uploads/' + req.params.fname));
// });
// router.get('/viewsubmitassign', function(req, res, next) {
//   Student.find().sort('name').exec(function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.get('/viewmaterial', function(req, res, next) {
//   Teacher.find().sort('name').exec(function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.get('/quiz/:id', function(req, res, next) {
//   Class.find({ _id: req.params.id }).populate('teacher').populate('students.sid').exec(function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.get('/assign/:id', function(req, res, next) {
//   Student.findById(req.params.id)
//       .then((student) => {
//           res.statusCode = 200;
//           res.setHeader('Content-Type', 'application/json');
//           res.json(student);
//       }, (err) => next(err))
//       .catch((err) => next(err));

// });

// //POST Operations
// router.post('/addquiz', uploadquiz.single('file-upload'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file);
// });
// router.post('/addassignment', uploadassignment.single('file-upload'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file);
// });
// router.post('/addmaterial', uploadmaterial.single('file-upload'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file);
// });
// router.post('/addmarks', uploadmarks.single('file-upload'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file);
// });
// var teacherquiz = multer.diskStorage({ 
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/teachers/quiz')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// })
// var teacherassign = multer.diskStorage({ 
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/teachers/assign')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// })
// var teachermaterial = multer.diskStorage({ 
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/teachers/material')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// })
// var teachermarks = multer.diskStorage({ 
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/teachers/marks')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// })
// var uploadquiz = multer({storage:teacherquiz});
// var uploadassignment = multer({storage: teacherassign});
// var uploadmaterial = multer({storage: teachermaterial});
// var uploadmarks = multer({storage: teachermarks});
// /* GET Operations */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');

// });
// router.get('/viewattquiz', function(req, res, next) {
//     res.sendFile(path.join(__dirname, '../uploads/' + req.params.fname));
// });
// router.get('/viewsubmitassign', function(req, res, next) {
//   Student.find().sort('name').exec(function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.get('/viewmaterial', function(req, res, next) {
//   Teacher.find().sort('name').exec(function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.get('/quiz/:id', function(req, res, next) {
//   Class.find({ _id: req.params.id }).populate('teacher').populate('students.sid').exec(function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.get('/assign/:id', function(req, res, next) {
//   Student.findById(req.params.id)
//       .then((student) => {
//           res.statusCode = 200;
//           res.setHeader('Content-Type', 'application/json');
//           res.json(student);
//       }, (err) => next(err))
//       .catch((err) => next(err));

// });

// //POST Operations
// router.post('/addquiz', uploadquiz.single('file-upload'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file);
// });
// router.post('/addassignment', uploadassignment.single('file-upload'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file);
// });
// router.post('/addmaterial', uploadmaterial.single('file-upload'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file);
// });
// router.post('/addmarks', uploadmarks.single('file-upload'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file);
// });
//PUT Operations
// router.put('/marks/:id', function(req, res, next) {
//   Class.findOneAndUpdate({ _id: req.params.cid }, {
//           "$push": {
//               "students": {
//                   "sid": req.params.sid
//               }
//           }
//       }, { new: true, upsert: false },
//       function(error, results) {
//           if (error) {
//               return next(error);
//           }
//           // Respond with valid data
//           res.json(results);
//       });
// });


//Delete Operations
// router.delete('/material/:id', function(req, res, next) {
//   Teacher.deleteOne({ _id: req.params.id }, function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.delete('/marks/:fname', function(req, res, next) {
//   Class.deleteOne({ _id: req.params.id }, function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.delete('/quiz/:id', function(req, res, next) {
//   Student.deleteOne({ _id: req.params.id }, function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
// router.delete('/assign/:id', function(req, res, next) {
//   Student.deleteOne({ _id: req.params.id }, function(error, results) {
//       if (error) {
//           return next(error);
//       }
//       // Respond with valid data
//       res.json(results);
//   });
// });
module.exports = router;
