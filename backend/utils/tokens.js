const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const signAccessToken = (payload)=>{
 
    return jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXP || "1h"});
}


const signRefreshToken =  (payload)=>{
    return jwt.sign(payload,process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXP || "7d"});
}


const hashToken = (token)=>{
    return crypto.createHash('sha256').update(token).digest('hex');
}

const verifyAccess = (token)=>{
    return jwt.verify(token,process.env.JWT_ACCESS_SECRET);
}

const verifyRefresh = (token)=>{
return jwt.verify(token,process.env.JWT_REFRESH_SECRET);
}

module.exports = {signAccessToken,signRefreshToken,hashToken,verifyAccess,verifyRefresh};