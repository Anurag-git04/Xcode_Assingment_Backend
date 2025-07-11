const mongoose = require('mongoose')

require('dotenv').config()

const connectDb = async()=>{
    try {
        mongoose.connect(process.env.Mongo_Uri)
        console.log('Mongo DB is connected Successfully')
    } catch (error) {
        console.log('Error while connecting DB')
    }
}

module.exports = connectDb