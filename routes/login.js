const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = express.Router()

// SHHHHHH dont tell anyone the secret password
const secretKey = 'purpleBanana'

router.route('/')   // Note: remove the .get when we pair the api with the app
.get( (req, res) => {
    res.render('login')
}).post( async (req, res) => {
    const { username, password } = req.body

    //res.send(`Error: the password ${password} belongs to user kaiverson, not user ${username}`)
    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Both username and password are required' });
        }

        const connectionPool = req.app.get('mariadbPool')
        const connection = await connectionPool.getConnection()
        console.log('Database connection acquired!')

        const [rows, fields] = await connection.execute(
            'SELECT password FROM accounts WHERE username = ?',
            [username]
        )
        console.log('rows:', rows)
        console.log('fields:', fields)
      
        connection.release()
        console.log('Database disconnected (gracefully)')

        console.log(rows.password)

      
        const user = rows && rows.length > 0 ? rows[0] : null;
        console.log(user)
        if (user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password)
            if (isPasswordMatch) {
                const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' })
                return res.status(200).json({ token })
            } else {
                return res.status(401).json({ error: 'Invalid password' })
            }
        } else {
            return res.status(401).json({ error: 'Invalid username' })
        }
    } catch (error) {
        console.error('Error authenticating user:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
      
})

module.exports = router
