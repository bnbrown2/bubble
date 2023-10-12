const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

router
.route('/')
.get((req, res) => {
    res.render('register')
}).post( async (req, res) => {
    const { username, password, email, name } = req.body

    try {
        const connectionPool = req.app.get('mariadbPool')
        const connection = await connectionPool.getConnection()
        console.log('Database connection acquired!')

        // Check if username and email are unique
        const [usernameRows] = await connection.query('SELECT * FROM accounts WHERE username = ?', [username])
        const [emailRows] = await connection.query('SELECT * FROM accounts WHERE email = ?', [email])

        if (usernameRows) {
            console.log(usernameRows)
            res.status(400).json({ error: 'Username is already taken' })
            connection.release()
            return
        }

        if (emailRows && emailRows.length > 0) {
            res.status(400).json({ error: 'Email is already in use' })
            connection.release()
            return
        }

        // If both username and email are unique, hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert the new user into the database
        const result = await connection.query(
            'INSERT INTO accounts (username, password, email, name, salt) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email, name, 'a']
        )

        // Check if the user was successfully inserted
        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'User registered successfully' })
        } else {
            res.status(500).json({ error: 'Failed to register user' })
        }

        connection.release()
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router
