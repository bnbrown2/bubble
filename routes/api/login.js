const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = express.Router()

// SHHHHHH dont tell anyone the secret password
const config = require('../../config')
const secretKey = config.secretKey

router.route('/')
.get( (req, res) => {
    res.status(200).json({'message': 'all good (probably)'})
})
.post( async (req, res) => {
    const { username, password } = req.body

    //res.send(`Error: the password ${password} belongs to user kaiverson, not user ${username}`)
    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Both username and password are required' });
        }

        const connectionPool = req.app.get('mariadbPool')
        const connection = await connectionPool.getConnection()
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] Database connection acquired!`)

        const [rows, fields] = await connection.execute(
            'SELECT password FROM accounts WHERE username = ?',
            [username]
        )
      
        connection.release()
        const timestamp2 = new Date().toISOString()
        console.log(`[${timestamp2}] Database disconnected (gracefully)`)
      
        const user = rows ? rows : null;
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
