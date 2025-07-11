const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const connectDb = require('./connectDB/connectDb');
const Car = require('./model/Car');
const fs = require('fs');
const User = require('./model/User');
const bcrypt = require('bcrypt')
const app = express();

dotenv.config();
const cors = require('cors');
app.use(cors());


const PORT = process.env.PORT || 5000;

connectDb();
app.use(express.json());

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.post('/car', upload.single('coverImage'), async (req, res) => {
  try {
    const { carname, description, price } = req.body;
    const coverImage = req.file ? req.file.filename : null;

    if (!carname || !description || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newCar = new Car({
      carname,
      description,
      price,
      coverImage
    });

    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/car',async(req,res)=>{
    try {
        const cars = await Car.find()
        res.status(200).json({cars})
    } catch (error) {
        console.log("Error while fetching cars data")
        res.status(400).json({message:"Error while fetching cars data"})
    }
})

app.get('/car/:id',async(req,res)=>{
    const {id} = req.params
    try {
        const carbyId = await Car.findById(id)
        res.status(400).json({carbyId})
    } catch (error) {
        console.log("Error while fetching cars data")
        res.status(404).json({message:"Error while fetching cars data by id"})
    }
})

app.delete('/car/:id',async(req,res)=>{
    const {id} = req.params
    try {
        const cardelete = await Car.deleteOne({_id:id}) 
        res.status(200).json({message:"Deleted Successfully",cardelete})
    } catch (error) {
        console.log("Error while Deleting cars data")
        res.status(404).json({message:"Error while deleting cars data by id"})
    }
})


app.post('/signin',async(req,res)=>{
    const {username,password,role} = req.body
    try {
        if(!username || !password){
            res.status(400).json({message:"Provide proper data"})
        }
        const user = await User.findOne({username})
        const hashed = await bcrypt.hash(password,10)
        if(user){
            res.status(500).json({message:"User already exsist"})
        }
        const newUser = new User({username,password:hashed,role})
        await newUser.save()
        res.status(201).json({message:"User created successfully",newUser})
    } catch (error) {
        console.log("Error while creating new user",error)
        res.status(400).json({message:"error while creating new user",error})
    }
})

app.post('/login',async(req,res)=>{
    try {
        const {username,password} = req.body
        if(!username || !password){
            res.status.json({message:"Please fill the data correctly"})
        }
        const user = await User.findOne({username})
        const isMatch = await bcrypt.compare(password,user.password)
        if(isMatch){
            res.status(201).json({user})
        }else{
            res.status(500).json({message:"Incorrect Credintials"})
        }
    } catch (error) {
        console.log("Error while Login",error)
        res.status(400).json({message:"error while login",error})
    }
})

app.put('/car/:id', upload.single('coverImage'), async (req, res) => {
  const { id } = req.params;
  const { carname, description, price,status } = req.body;

  try {
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    car.carname = carname || car.carname;
    car.description = description || car.description;
    car.price = price || car.price;
    car.status = status || car.status

    if (req.file) {
      car.coverImage = req.file.filename;
    }

    const updatedCar = await car.save();
    res.status(200).json({ message: 'Car updated successfully', updatedCar });
  } catch (error) {
    console.error('Error while updating car:', error);
    res.status(500).json({ message: 'Error while updating car', error });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
