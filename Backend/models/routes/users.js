const router= require( 'express').Router();
const { error } = require('console');
const { User, validate } = require('.user./models/user');

router.post('/', async(req, res) => {
    try{
        const{error}=validate(req.body);
        if (error)
        return res.status(400).send(error.details[0].message);
        
        const user = new User.findOne({email:req.body.email});
        if(user)
        return res.status(409).send({message:"user with given email is already exist"})
        
        const salt= await  bcrypt.genSalt(Number(process.env.SALT));
        const hashpassword =await bcrypt.hash(req.body.password,salt);

        await new User({...req.body,password:hashpassword}).save();
        res.status(201).send("User created");
    }catch(err){
        res.status(500).send({message:"Internal server error"});
    }
    });

    module.exports=router;