const express = require('express');
let userRoutes = require('./Routes/Routes.users')
let newsrouter = require('./Routes/Routes.news')
let connectDataBase = require('./DataBase Connection/connectDataBase')
let cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser');
const logger = require('./logger');

let app = express()
// app.use(cors())
app.use(cors({
    // origin: 'http://localhost:3000',
    origin: 'the-n.netlify.app',
    credentials: true,               // Allow credentials (cookies)
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include all methods you might use
    // allowedHeaders: ['Content-Type', 'Authorization'], // Include headers that might be sent
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRoutes)
app.use('/api/news', newsrouter)

app.use('*', (req, res) => {
    logger.warn(`Unknown route accessed: ${req.originalUrl}`);
    res.status(404).json({ error: true, message: "Page not found" });
    // res.json({ error: true, message: "Page not found" })
})

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: true, message: err.message || 'Internal Server Error' });
    // res.json({ error: true, message: err })
})

let startServer = async () => {
    try {
        await connectDataBase(process.env.MONGO_URI)
        logger.info('MongoDB connected successfully');
        console.log('MongoDB connected Successfully');

        let port = process.env.PORT || 8080
        app.listen(port, () => {
            logger.info(`Server is running at port: http://localhost:${port}`);
            console.log(`Server is running at port : http://localhost:${port}`);
        })

    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        console.log('Failed to connect to MongoDB: ', error);
    }
}

startServer()