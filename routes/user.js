import express from 'express'
import bcrypt from 'bcrypt'
import { User } from '../models/User.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/signup', async (req, res) => {
    const {username, email, password} = req.body
    const user = await User.findOne({email})
    if(user) {
        return res.json({message: 'User already exists'})
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
        username,
        email, 
        password: hashPassword,
    })

    await newUser.save();
    return res.json({status: true, message: 'User created'})

})

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})
    if(!user) {
        return res.json({status: false, message: 'User not found'})
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if(!validPassword) {
        return res.json({status: false, message: 'Password is wrong'})
    }

    const token = jwt.sign({username: user.username}, process.env.KEY, {
        expiresIn: '1h'
    })
    res.cookie('token', token, {maxAge: 3600000, httpOnly: true})

    return res.json({status: true, message: 'User logged in'})
    
})

export {router as UserRouter}