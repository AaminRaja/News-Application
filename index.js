const express = require('express');
let userRoutes = require('./Routes/Routes.users')
let newsrouter = require('./Routes/Routes.news')
let connectDataBase = require('./DataBase Connection/connectDataBase')
let cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser');

let app = express()
// app.use(cors())
app.use(cors({
    origin: 'http://localhost:3000',
    // origin: 'https://joyful-bonbon-984e24.netlify.app/',
    credentials: true,               // Allow credentials (cookies)
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include all methods you might use
    // allowedHeaders: ['Content-Type', 'Authorization'], // Include headers that might be sent
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRoutes)
app.use('/api/news', newsrouter)

app.use('*', (req, res) => {
    res.json({ error: true, message: "Page not found" })
})

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    // res.status(500).json({ error: true, message: err.message || 'Internal Server Error' });
    res.json({ error: true, message: err })
})

let startServer = async () => {
    try {
        await connectDataBase(process.env.MONGO_URI)
        console.log('MongoDB connected Successfully');

        let port = process.env.PORT || 8080
        app.listen(port, () => {
            console.log(`Server is running at port : http://localhost:${port}`);
        })

    } catch (error) {
        console.log(error);
    }
}

startServer()