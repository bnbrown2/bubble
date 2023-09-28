const express = require('express');
const router = express.Router();


// Way to get bio by inputting username in URL
router.get('/:username', async (req, res) => {
    try {
      const username = req.params.username
      console.log(`${username} entered in for username`)
      const bio = await getUser(username)
      res.send(bio)
    } catch (error) {
      res.send(error)
    }
})

// Define a PUT route to update a user's bio
router.put('/:username', async (req, res) => {
    try {
      const username = req.params.username;
      const newBio = req.body.bio; // Assuming the request contains a JSON body with a "bio" property
  
      // Update the user's bio in the database
      await pool.promise().query("UPDATE accounts SET bio = ? WHERE username = ?", [
        newBio,
        username,
      ]);
  
      res.send('Bio updated successfully')
    } catch (error) {
      res.status(500).send('Error updating bio: ' + error.message)
    }
})
  
  module.exports = router;