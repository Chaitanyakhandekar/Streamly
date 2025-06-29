import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

dotenv.config()

async function connectDB(){
    try {
        const connectionInfo = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
        console.log(`\n Connected to MongoDB !! DB Host: ${connectionInfo.connection.host}`)
    } catch (error) {
        console.log('MongoDB Connection Failed!...  : ',error)
        process.exit(1)
    }
}

export default connectDB;