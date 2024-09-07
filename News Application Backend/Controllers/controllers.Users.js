let user = require('../Models/models.User')
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const cookieParser = require('cookie-parser');


//Not used cookie parser

let userSignup = async(req, res, next) => {
    try {
        let {Username, EmailAddress, PhoneNumber, Password, Preferences} = req.body
        if(!(Username && EmailAddress && PhoneNumber && Password)){
            return res.status(400).json({error:true, message:"Send Username, EmailAddress, PhoneNumber, Password and Preferences to backend"})
            // If any required data is missing from the frontend when making a request to the backend, the backend should respond with a 400 Bad Request status
        }

        let existingUserByUsername = await user.findOne({Username})
        if(existingUserByUsername){
            return res.status(409).json({error:true, message:"This Username is already registered"})  //409 Conflict status
        }

        let existingUserByEmailAddress = await user.findOne({EmailAddress})
        if(existingUserByEmailAddress){
            return res.status(409).json({error:true, message:"This email is already registered"})  //409 Conflict status
        }

        let existingUserByPhonNumber = await user.findOne({PhoneNumber})
        if(existingUserByPhonNumber){
            return res.status(409).json({error:true, message:"This Phone Number is already registered"})  //409 Conflict status
        }
        
        let hashedPassword = await bcryptjs.hash(Password, 10)

        let newUser = await user.create({Username, EmailAddress, PhoneNumber, Password:hashedPassword, Preferences})
        console.log(newUser);
        
        res.status(200).json({error:false, message:"User Added successfully"}) //201:Created //No need of sendinhg data from backend to to frontend when Register a user

    } catch (error) {
        next(error)
    }
}

let generateAccessToken = (user) => {
    return jwt.sign({userRole:user.Role}, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '20s'})
}

let generateRefreshToken = (user) => {
    return jwt.sign({userRole:user.Role}, process.env.REFRESH_TOKEN_SECRET, {expiresIn : '10d'})
}

let userLogin = async(req, res, next) => {
    console.log('trying to login');
    try {
        let {loginMode, identifier, Password} = req.body
        console.log(loginMode);
        if(!(loginMode, identifier, Password)){
            return res.status(400).json({error:true, message:"Send loginMode, identifier and Password to backend"})
        }

        if(loginMode == 'Username'){
            let registeredUserByUsername = await user.findOne({Username:identifier})
            if(registeredUserByUsername){
                if(await bcryptjs.compare(Password, registeredUserByUsername.Password)){
                    console.log(registeredUserByUsername);
                    registeredUserByUsername.Password = undefined
                    console.log(registeredUserByUsername);
                    
                    let accessToken = generateAccessToken(registeredUserByUsername)
                    let refreshToken = generateRefreshToken(registeredUserByUsername)

                    console.log(`AccessToken:${accessToken}`);
                    console.log(`RefreshToken:${refreshToken}`);
                    
                    res.cookie('refreshToken', refreshToken, {httpOnly:true, secure:false, sameSite:'Lax', maxAge:10 * 24 * 60 * 60 * 1000, path: '/'})

                    res.status(200).json({error:false, message:"User Login Successfull", user:registeredUserByUsername, accessToken})
                }else{
                    res.status(401).json({error:true, message:"Invalid Password"})
                }
            }else{
                res.status(404).json({error:true, message:"No user with this Username"})
            }
        }else if(loginMode == 'Email'){
            let registeredUserByEmailAddress = await user.findOne({EmailAddress:identifier})
            if(registeredUserByEmailAddress){
                if(await bcryptjs.compare(Password, registeredUserByEmailAddress.Password)){
                    console.log(registeredUserByEmailAddress);
                    registeredUserByEmailAddress.Password = undefined
                    console.log(registeredUserByEmailAddress);

                    let accessToken = generateAccessToken(registeredUserByEmailAddress)
                    let refreshToken = generateRefreshToken(registeredUserByEmailAddress)

                    res.cookie('refreshToken', refreshToken, {httpOnly:true, secure:false, sameSite:'Lax', maxAge:10 * 24 * 60 * 60 * 1000, path: '/'})

                    res.status(200).json({error:false, message:"User Login Successfull", user:registeredUserByEmailAddress, accessToken})
                }else{
                    res.status(401).json({error:true, message:"Invalid Password"})
                }
            }else{
                res.status(404).json({error:true, message:"No user with this Email Address"})
            }
        }else if(loginMode == 'Phone Number'){
            let registeredUserByPhonNumber = await user.findOne({PhoneNumber:identifier})
            if(registeredUserByPhonNumber){
                if(await bcryptjs.compare(Password, registeredUserByPhonNumber.Password)){
                    console.log(registeredUserByPhonNumber);
                    registeredUserByPhonNumber.Password = undefined
                    console.log(registeredUserByPhonNumber);

                    let accessToken = generateAccessToken(registeredUserByPhonNumber)
                    let refreshToken = generateRefreshToken(registeredUserByPhonNumber)

                    res.cookie('refreshToken', refreshToken, {httpOnly:true, secure: false, sameSite:'Lax', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/'})

                    res.status(200).json({error:false, message:"User Login Successfull", user:registeredUserByPhonNumber, accessToken})

                }else{
                    res.status(401).json({error:true, message:"Invalid Password"}) 
                }
            }else{
                res.status(404).jso({error:true, message:"No user with this Phone Number"})   
            }
        }

    } catch (error) {
        next(error)
    }
}

let authenticateAccessToken = async(req, res, next) => {
    let authHeader = req.headers['Authorization']
    console.log(authHeader);
    let token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error:true, message:"No accesstoken in request header"}) // Unauthorized
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err){
            return res.status(403).json({error:true, message:"Access token expired"}) //Forbidden
        }
        req.user = user
        next()
    })    
}

let generateNewAccessToken = async(req, res, next) => {
    try {
        let refreshToken = req.cookies?.refreshToken;
        console.log(`Refresh Token from request : ${refreshToken}`);
      
        if(!refreshToken){
            return res.status(401).json({error:true, messag:"No refresh token from frontend"}); // Unauthorized
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if(err){
                return res.status(403).json({error:true, message:"Refresh token expired"}); // Invalid token
            }

            let newAccessToken = generateAccessToken(user)
            let newRefreshToken = generateRefreshToken(user)

            res.cookie('refreshToken', newRefreshToken, {httpOnly:true, secure: false, sameSite:'Lax', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/'})

            res.json({error:false, message:"New Access token generated by using refresh token", newAccessToken})
        })
    } catch (error) {
        next()
    }
}

let updateUserDetails = async(req, res, next) => {
    try {
        let {Username, EmailAddress, PhoneNumber, Password, Preferences, _id} = req.body
        let userToBeUpdate = await user.findOne({_id:_id})
        if(userToBeUpdate){
            await user.findOneAndUpdate({_id:_id}, {Username, EmailAddress, PhoneNumber, Password, Preferences}, {new:true})
        }else{
            res.status(404).json({error:true, message:"No user in this id"})
        }
    } catch (error) {
        next(error)
    }
}

let saveNews = async(req, res, next) => {
    try {
        let {userRole} = req.user
        if(userRole === 'Reader'){
            let newsId = req.params.id //id of news
            let userId = req.body._id //id of user
            let userFromDataBase = await user.findOne({_id:userId})
            let savedIds = userFromDataBase.savedNews
            let newSavedIds = [...savedIds, newsId]
            await user.updateOne({_id:userFromDataBase._id}, {$set:{savedNews:newSavedIds}})
        }else{
            res.status(401).json({error:true, message:"This user is not authorized to access This request"})
        }
    } catch (error) {
        next(error)
    }
}

let unSaveNews = async(req, res, next) => {
    try {
        let {userRole} = req.user
        if(userRole === 'Reader'){
            let newsId = req.params.id //id of news
            let userId = req.body._id //id of user
            let userFromDataBase = await user.findOne({_id:userId})
            let savedIds = userFromDataBase.savedNews
            let newSavedIds = savedIds.filter((ele) => {
                return ele !== newsId
            })
            console.log(newSavedIds);
            await user.updateOne({_id:userFromDataBase._id}, {$set:{savedNews:newSavedIds}})
        }else{
            res.status(401).json({error:true, message:"This user is not authorized to access This request"}) 
        }
        
    } catch (error) {
        next(error)
    }
}

module.exports = {userSignup, userLogin, authenticateAccessToken, generateNewAccessToken, saveNews, unSaveNews, updateUserDetails}