const bcrypt = require('bcryptjs');

module.exports = {
    register: async (req, res) => {
        const {username, password, isAdmin} = req.body;
        const db = await req.app.get('db');
        const result = await db.get_user([username]);
        const existingUser = await result[0];
        if (existingUser) {
            return res.status(409).json('Username Taken');
        }
        const salt = await bcrypt.genSaltSync(10)
        const hash = await bcrypt.hashSync(password, salt);
        const registeredUser = await db.register_user([isAdmin, username, hash]);
        const user = registeredUser[0];
        req.session.user = {
            isAdmin: user.is_admin,
            username: user.username,
            id: user.id
        }
        res.status(201).json(req.session.user)
    },

    login: async (req, res) => {
        const {username, password} = req.body;
        const db = await req.app.get('db');
        const foundUser = await db.get_user([username]);
        const user = await foundUser[0];
        if(!user) {
            return res.status(401).json('User not found. Please register as a new user before logging in.');
        }
        const isAuthenticated = await bcrypt.compareSync(password, user.hash)
        if (!isAuthenticated) {
            res.status(403).json('Incorrect Password');
        } else{
            req.session.user = {
                isAdmin: user.is_admin,
                username: user.username,
                password: user.hash,
                id: user.id
                
            }
            return res.status(200).json(req.session.user);
        }
    },

    logout: async (req, res) => {
        await req.session.destroy()
        return res.sendStatus(200)
    }
}