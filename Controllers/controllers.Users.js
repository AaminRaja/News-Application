let user = require('../Models/models.User')
let news = require('../Models/models.news')
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const cookieParser = require('cookie-parser');


//Not used cookie parser

let userSignup = async (req, res, next) => {
    console.log("new user sign up");
    try {
        let { Username, EmailAddress, PhoneNumber, Password, Preferences } = req.body
        if (!(Username && EmailAddress && PhoneNumber && Password)) {
            return res.status(400).json({ error: true, message: "Send Username, EmailAddress, PhoneNumber, Password and Preferences to backend" })
            // If any required data is missing from the frontend when making a request to the backend, the backend should respond with a 400 Bad Request status
        }

        let existingUserByUsername = await user.findOne({ Username })
        if (existingUserByUsername) {
            return res.status(409).json({ error: true, message: "This Username is already registered" })  //409 Conflict status
        }

        let existingUserByEmailAddress = await user.findOne({ EmailAddress })
        if (existingUserByEmailAddress) {
            return res.status(409).json({ error: true, message: "This email is already registered" })  //409 Conflict status
        }

        let existingUserByPhonNumber = await user.findOne({ PhoneNumber })
        if (existingUserByPhonNumber) {
            return res.status(409).json({ error: true, message: "This Phone Number is already registered" })  //409 Conflict status
        }

        let hashedPassword = await bcryptjs.hash(Password, 10)

        let newUser = await user.create({ Username, EmailAddress, PhoneNumber, Password: hashedPassword, Preferences })
        console.log(newUser);

        res.status(200).json({ error: false, message: "User Added successfully" }) //201:Created //No need of sendinhg data from backend to to frontend when Register a user

    } catch (error) {
        next(error)
    }
}

let generateAccessToken = (user) => {
    console.log("Generating access token");
    let token = jwt.sign({ userRole: user.Role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' })
    // let decodedToken = jwt.decode(token)
    // console.log('Access Token Payload:', decodedToken);
    return token;
}

let generateRefreshToken = (user) => {
    console.log("Generating refresh token");
    return jwt.sign({ userRole: user.Role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '10d' })
}

let userLogin = async (req, res, next) => {
    console.log('trying to login');
    try {
        let { loginMode, identifier, Password } = req.body
        console.log(loginMode);
        if (!(loginMode, identifier, Password)) {
            return res.status(400).json({ error: true, message: "Send loginMode, identifier and Password to backend" })
        }

        if (loginMode == 'Username') {
            let registeredUserByUsername = await user.findOne({ Username: identifier })
            if (registeredUserByUsername) {
                if (await bcryptjs.compare(Password, registeredUserByUsername.Password)) {
                    console.log(registeredUserByUsername);
                    registeredUserByUsername.Password = undefined
                    console.log(registeredUserByUsername);

                    let accessToken = generateAccessToken(registeredUserByUsername)
                    let refreshToken = generateRefreshToken(registeredUserByUsername)

                    console.log(`AccessToken:${accessToken}`);
                    console.log(`RefreshToken:${refreshToken}`);

                    // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/' })
                    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/' })

                    res.status(200).json({ error: false, message: "User Login Successfull", user: registeredUserByUsername, accessToken })
                } else {
                    res.status(401).json({ error: true, message: "Invalid Password" })
                }
            } else {
                res.status(404).json({ error: true, message: "No user with this Username" })
            }
        } else if (loginMode == 'Email') {
            let registeredUserByEmailAddress = await user.findOne({ EmailAddress: identifier })
            if (registeredUserByEmailAddress) {
                if (await bcryptjs.compare(Password, registeredUserByEmailAddress.Password)) {
                    console.log(registeredUserByEmailAddress);
                    registeredUserByEmailAddress.Password = undefined
                    console.log(registeredUserByEmailAddress);

                    let accessToken = generateAccessToken(registeredUserByEmailAddress)
                    let refreshToken = generateRefreshToken(registeredUserByEmailAddress)

                    // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/' })
                    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/' })

                    res.status(200).json({ error: false, message: "User Login Successfull", user: registeredUserByEmailAddress, accessToken })
                } else {
                    res.status(401).json({ error: true, message: "Invalid Password" })
                }
            } else {
                res.status(404).json({ error: true, message: "No user with this Email Address" })
            }
        } else if (loginMode == 'Phone Number') {
            let registeredUserByPhonNumber = await user.findOne({ PhoneNumber: identifier })
            if (registeredUserByPhonNumber) {
                if (await bcryptjs.compare(Password, registeredUserByPhonNumber.Password)) {
                    console.log(registeredUserByPhonNumber);
                    registeredUserByPhonNumber.Password = undefined
                    console.log(registeredUserByPhonNumber);

                    let accessToken = generateAccessToken(registeredUserByPhonNumber)
                    let refreshToken = generateRefreshToken(registeredUserByPhonNumber)

                    let decode = jwt.decode(accessToken)
                    console.log(decode);

                    // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/' })
                    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/' })

                    res.status(200).json({ error: false, message: "User Login Successfull", user: registeredUserByPhonNumber, accessToken })

                } else {
                    res.status(401).json({ error: true, message: "Invalid Password" })
                }
            } else {
                res.status(404).jso({ error: true, message: "No user with this Phone Number" })
            }
        }

    } catch (error) {
        next(error)
    }
}

let authenticateAccessToken = async (req, res, next) => {
    console.log("Authenticating access token");
    let authHeader = req.headers['authorization'] //header names are automatically converted to lowercase in Node.js. So better to use the lowercase
    // console.log(`Auth header : ${authHeader}`);
    let token = authHeader && authHeader.split(' ')[1]
    console.log(`Token getting in authenticateAccessToken : ${token}`);

    let decoded = jwt.decode(token)
    console.log(`decoded : ${JSON.stringify(decoded)}`);

    if (!token) {
        return res.status(401).json({ error: true, message: "No accesstoken in request header" }) // Unauthorized
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log('Access toke expired');
            return res.status(403).json({ error: true, message: "Access token expired" }) //Forbidden
        }
        // console.log(`user in authentication : ${JSON.stringify(user)}`);
        // console.log(`user before parse and stringify : ${user}`);
        // console.log(JSON.parse(JSON.stringify(user)));
        req.user = JSON.parse(JSON.stringify(user))
        next()
    })
}

let generateNewAccessToken = async (req, res, next) => {
    console.log("Genrating new access token");
    try {
        let refreshToken = req.cookies?.refreshToken;
        let userFromFrontend = JSON.parse(JSON.stringify(req.body.user))
        console.log(userFromFrontend);
        console.log(`Refresh Token from request : ${refreshToken}`);

        // let decoded = jwt.decode(refreshToken)
        // console.log(`decoded refresh token in generate new access token : ${JSON.parse(decoded)}`);

        if (!refreshToken) {
            return res.status(401).json({ error: true, messag: "No refresh token from frontend" }); // Unauthorized
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            console.log("Enter verification of refresh token");
            // console.log(`userFromFrontend : ${userFromFrontend}`);
            if (err) {
                console.log("refreshToken is expired");
                return res.status(403).json({ error: true, message: "Refresh token expired" }); // Invalid token
            }

            let newAccessToken = generateAccessToken(userFromFrontend)
            let newRefreshToken = generateRefreshToken(userFromFrontend)

            let decoded = jwt.decode(newAccessToken)
            console.log(`decoded in generateNewAccessToken : ${JSON.stringify(decoded)}`);

            console.log(`newAccessToken : ${newAccessToken}`);
            console.log(`newRefreshToken : ${newRefreshToken}`);

            // res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/' })
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 10 * 24 * 60 * 60 * 1000, path: '/' })

            return res.json({ error: false, message: "New Access token generated by using refresh token", newAccessToken })
        })
    } catch (error) {
        next()
    }
}

let updateUserDetails = async (req, res, next) => {
    console.log('updating user details');
    console.log(req.body);
    // console.log(user);
    try {
        // let { Username, EmailAddress, PhoneNumber, Password, Preferences, _id } = req.body
        let { Username, Password, Preferences, _id } = req.body
        let userToBeUpdate = await user.findOne({ _id: _id })
        if (userToBeUpdate) {
            let existingUserByUsername = await user.find({ Username })
            if (existingUserByUsername.length > 1) {
                return res.status(409).json({ error: true, message: "This Username is already registered" })
            }

            await user.findOneAndUpdate({ _id: _id }, { Username, Password, Preferences }, { new: true })
            let updatedUser = await user.findOne({ _id: _id })
            // console.log(updatedUser);
            return res.status(200).json({ error: false, message: "User updated successfully", updatedUser })
        } else {
            return res.status(404).json({ error: true, message: "No user in this id" })
        }
    } catch (error) {
        next(error)
    }
}

let saveNews = async (req, res, next) => {
    console.log('saving a news');
    try {
        let { userRole } = req.user
        if (userRole === 'Reader') {
            let newsId = req.params.id //id of news
            console.log(`news id : ${newsId}`);
            let { userId } = req.body //id of user
            // console.log(`userId : ${userId}`);
            console.log(req.body);
            let userFromDataBase = await user.findOne({ _id: userId })
            let savedIds = userFromDataBase.savedNews
            console.log(`savedIds : ${savedIds}`);
            if (savedIds.includes(newsId)) {
                return res.status(400).json({ error: true, message: "News already saved" })
            } else {
                let newSavedIds = [...savedIds, newsId]
                console.log(`newSavedIds : ${newSavedIds}`);
                await user.updateOne({ _id: userFromDataBase._id }, { $set: { savedNews: newSavedIds } })
                res.status(200).json({ error: false, message: "News saved successfully" })
            }
        } else {
            res.status(401).json({ error: true, message: "This user is not authorized to access This request" })
        }
    } catch (error) {
        next(error)
    }
}

let unSaveNews = async (req, res, next) => {
    console.log('removing a news from saved news');
    try {
        let { userRole } = req.user
        if (userRole === 'Reader') {
            let newsId = req.params.id //id of news
            let { userId } = req.body //id of user
            let userFromDataBase = await user.findOne({ _id: userId })
            let savedIds = userFromDataBase.savedNews
            if (savedIds.includes(newsId)) {
                let newSavedIds = savedIds.filter((ele) => {
                    return ele !== newsId
                })
                console.log(newSavedIds);
                await user.updateOne({ _id: userId }, { $set: { savedNews: newSavedIds } })
                res.status(200).json({ error: false, message: "News un-saved successfully" })
            } else {
                res.status(400).json({ error: true, message: "News not found in saved" })
            }
        } else {
            res.status(401).json({ error: true, message: "This user is not authorized to access This request" })
        }

    } catch (error) {
        next(error)
    }
}

let fetchSavedNewsIds = async (req, res, next) => {
    console.log('Fetching saved news ids');
    try {
        let { userRole } = req.user
        if (userRole === 'Reader') {
            let { user_id } = req.query
            let data = await user.find({ _id: user_id }, { savedNews: 1, _id: 0 })
            console.log(data);
            let savedNewsIds = data[0].savedNews
            console.log(savedNewsIds.length);
            if (savedNewsIds.length) {
                return res.status(200).json({ error: false, message: "Saved news ids fetched successfully", savedNewsIds })
            } else {
                return res.status(200).json({ error: true, message: "No saved news for this user" })
            }
        } else {
            return res.status(401).json({ error: true, message: "This user is not authorized to access This request" })
        }
    } catch (error) {
        console.log(error);
    }
}

let fetchSavedNews = async (req, res, next) => {
    console.log('fetching saved news');
    try {
        let { userRole } = req.user
        console.log(userRole);
        // console.log(`req.user : ${req.user}`);
        // console.log(`userRole : ${userRole}`);
        if (userRole === 'Reader') {
            let { user_id, currentPageNumber, newsPerPage } = req.query
            let data = await user.find({ _id: user_id }, { savedNews: 1, _id: 0 })
            console.log(data);
            let savedNewsIds = data[0].savedNews
            console.log(savedNewsIds);
            if (savedNewsIds.length) {

                if (currentPageNumber && newsPerPage) {
                    currentPageNumber = parseInt(currentPageNumber) || 1
                    newsPerPage = parseInt(newsPerPage) || 9
                    let skip = (currentPageNumber - 1) * newsPerPage

                    console.log(currentPageNumber, newsPerPage);

                    let savedNewsArray = await news.find({ _id: { $in: savedNewsIds }, isDeleted: false }).sort({ _id: -1 }).skip(skip).limit(newsPerPage)

                    let totalNumberOfSavedNews = await news.countDocuments({ _id: { $in: savedNewsIds }, isDeleted: false })

                    let totalNumberOfPages = Math.ceil(totalNumberOfSavedNews / newsPerPage)

                    res.status(200).json({ error: false, message: "Fetching saved newses", savedNewsArray, totalNumberOfPages })
                } else {
                    let savedNewsArray = await news.find({ _id: { $in: savedNewsIds }, isDeleted: false })
                    res.status(200).json({ error: false, message: "Fetching saved newses", savedNewsArray })
                }
            } else {
                res.status(204).json({ error: true, message: "No saved news for this user" })
            }
            // res.status(200).json({ error: false, message: "Fetching saved newses", savedNewsIds })
        } else {
            res.status(401).json({ error: true, message: "This user is not authorized to access This request" })
        }
    } catch (error) {
        next(error)
    }
}

let verifyCurrentPassword = async (req, res, next) => {
    console.log("Verifying password");
    try {
        let { currentPassword } = req.query
        let { id } = req.params

        if (currentPassword && id) {
            let currentUser = await user.findById({ _id: id })

            if (await bcryptjs.compare(currentPassword, currentUser.Password)) {
                return res.status(200).json({ error: false, message: "Current password is verified" })
            } else {
                return res.status(401).json({ error: true, message: "Current Password is not matching with user password" })
            }
        } else {
            res.status(400).json({ error: true, message: "Send both Current password and id of current user" })
        }
    } catch (error) {
        next(error)
    }
}

module.exports = { userSignup, userLogin, authenticateAccessToken, generateNewAccessToken, saveNews, unSaveNews, updateUserDetails, fetchSavedNewsIds, fetchSavedNews, verifyCurrentPassword }