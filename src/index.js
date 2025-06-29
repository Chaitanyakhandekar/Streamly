import connectDB from "./db/db.js";
import dotenv from 'dotenv'
dotenv.config({path:'./.env'})
import { server } from "./app.js";

;connectDB()
.then(()=>{
    server.listen(process.env.PORT,(error,req,res)=>{
        console.log(`Server is running on port ${process.env.PORT || 3000}`)
    })
})
.catch((error)=>{
    console.log('\n Server Connection Failed !!! ',error)
})