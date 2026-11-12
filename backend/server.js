import app from './src/app.js'
import connectDB from './src/db/db.js'
import 'dotenv/config'

app.listen(3000, () => {
    console.log('Server running on port 3000')
})

connectDB()

