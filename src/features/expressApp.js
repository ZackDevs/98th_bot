module.exports = () => {
    const express = require('express')
    const app = express()

    app.get('/leavenotices', function (req, res) {
    console.log(req.body)
    res.send("Great!")
    })

    app.listen(22325)
}