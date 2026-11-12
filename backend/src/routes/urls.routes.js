import express from 'express'
import urlModel from '../models/url.schema.js'
import mongoose from 'mongoose'
import { customAlphabet } from 'nanoid'

const router = express.Router()
const generateId = customAlphabet('1234567890abcdef', 7)

router.post('/shorten', async (req, res) => {
    try {
        const { originalURL } = req.body

        if (!originalURL) {
            return res.status(400).json({
                message: 'URL is required'
            })
        }

        let parsedUrl
        try {
            parsedUrl = new URL(originalURL)
        } catch {
            return res.status(400).json({
                message: 'Invalid URL format'
            })
        }

        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return res.status(400).json({
                message: 'URL must start with http:// or https://'
            })
        }

        const shorteners = [
            'bit.ly',
            'tinyurl.com',
            't.co',
            'shorturl.at'
        ]

        const hostname = parsedUrl.hostname.toLowerCase()

        if (shorteners.includes(hostname)) {
            return res.status(400).json({
                message: 'This URL is already shortened'
            })
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                message: 'Database is not connected. Check your MONGO_URI in .env and restart the server.'
            })
        }

        const existingUrl = await urlModel.findOne({ originalURL })

        const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '')

        if (existingUrl) {
            return res.status(200).json({
                message: 'URL already shortened',
                originalURL: existingUrl.originalURL,
                shortCode: existingUrl.shortCode,
                shortUrl: `${baseUrl}/${existingUrl.shortCode}`,
                clicks: existingUrl.clicks
            })
        }

        let shortCode = generateId()
        let codeExists = await urlModel.findOne({ shortCode })

        while (codeExists) {
            shortCode = generateId()
            codeExists = await urlModel.findOne({ shortCode })
        }

        const newUrl = await urlModel.create({
            originalURL,
            shortCode
        })

        return res.status(201).json({
            message: 'URL shortened',
            originalURL: newUrl.originalURL,
            shortCode: newUrl.shortCode,
            shortUrl: `${baseUrl}/${newUrl.shortCode}`,
            clicks: newUrl.clicks
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Something went wrong on the server'
        })
    }
})

router.get('/', async (req, res) => {
    try {
        const urls = await urlModel.find().sort({ createdAT: -1 })
        if(!urls) {
            return res.status(404).json({
                message: 'No shortened URLs found'
            })
        }

        return res.status(200).json({
            message: 'All shortened URLs',
            urls: urls.map(url => ({
                originalURL: url.originalURL,
                shortCode: url.shortCode,
                shortUrl: `${process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`}/${url.shortCode}`,
                clicks: url.clicks,
                createdAT: url.createdAT
            }))
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Something went wrong on the server'
        })
    }
})

router.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params
        const url = await urlModel.findOne({ shortCode })
    
        if(!url) {
            return res.status(404).json({
                message: 'No shortened URL found'
            })
        }
    
        return res.status(200).json({
            message: "Shortened URL Found",
            originalURL: url.originalURL,
            shortCode: url.shortCode,
            shortUrl: `${process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`}/${url.shortCode}`,
            clicks: url.clicks,
            createdAT: url.createdAT
        })        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Something went wrong on the server'
        })
    }
})

router.delete('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params
        const url = await urlModel.deleteOne({ shortCode })
    
        if(!url) {
            return res.status(404).json({
                message: 'No shortened URL found'
            })
        }

        
    
        return res.status(200).json({
            message: "URL Deleted Successfully ",
        })        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: 'Something went wrong on the server'
        })
    }
})

export default router
    