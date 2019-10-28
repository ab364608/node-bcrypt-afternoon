require('dotenv').config();
const express = require('express');
const session = require('express-session');
const massive = require('massive');

const authCtrl = require('./controllers/authController');
const treasureCtrl = require('./controllers/treasureController');
const auth = require('./middleware/authMiddleware');

const {CONNECTION_STRING, SESSION_SECRET} = process.env;

const app = express();

app.use(express.json());

massive(CONNECTION_STRING).then(dbInstance => {
    app.set('db', dbInstance);
    console.log('Database Connected');
})

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    cookies: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

// LOGIN, LOGOUT, REGISTER
app.post('/auth/register', authCtrl.register);
app.post('/auth/login', authCtrl.login);
app.get('/auth/logout', authCtrl.logout);

//TREASURE
app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure);
app.get('/api/treasure/user', auth.usersOnly, treasureCtrl.getUserTreasure);
app.post('/api/treasure/user', auth.usersOnly, treasureCtrl.addUserTreasure);
app.get('/api/treasure/all', auth.usersOnly, auth.adminsOnly, treasureCtrl.getAllTreasure);

const PORT = 4000;
app.listen(PORT, () => console.log(`Running on Port: ${PORT}`));