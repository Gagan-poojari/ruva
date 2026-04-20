const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send('Siu!')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
