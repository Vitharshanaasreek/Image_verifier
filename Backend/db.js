const mongoose = require('mongoose');
// MongoDB connection URL
const mongoURL = 'mongodb://127.0.0.1:27017/login';
module.exports=()=>{
    const connectionParams={
        useNewUrlParser: true,
        useUnifiedTopology:true,
    }
    try{
        mongoose.connect(mongoURL,connectionParams);
        console.log( "Database Connected Successfully");
    }
    catch(err){
        console.error(err,"Error in Database Connection");
    }
}
