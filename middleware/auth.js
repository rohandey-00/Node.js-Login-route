const jwt = require('jsonwebtoken');


const auth = (req, res, next)=>{
    //grabe the token 
    // console.log( req.cookies );
    const token = req.cookies.token;
    //if token not exist
    if(!token){
        res.status(403).send("Please login first");
    }

   try {
     //decoding the token
     const decode = jwt.verify(token, 'shhhhh')
     req.user=decode;

   } catch (error) {
        console.log(error);
        res.send("Invalid token!");
   }

return next();
}

module.exports = auth;
    