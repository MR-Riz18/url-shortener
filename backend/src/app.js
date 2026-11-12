import express from 'express'
import urlRoutes from './routes/urls.routes.js'
import urlModel from './models/url.schema.js'

const app = express()
app.use(express.json())

app.use('/api/urls', urlRoutes)

// Redirect route (Phase 4): GET /<shortCode> redirects to the original URL
app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params
        const url = await urlModel.findOne({ shortCode })

        if (!url) {
            return res.status(404).json({
                message: 'No shortened URL found'
            })
        }

        url.clicks += 1
        await url.save()

        return res.redirect(url.originalURL)
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Something went wrong on the server'
        })
    }
})

export default app
