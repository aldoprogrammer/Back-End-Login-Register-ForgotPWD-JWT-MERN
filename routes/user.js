import express from 'express'
import bcrypt from 'bcrypt'
import { User } from '../models/User.js'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

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


router.post('/forgot-pwd', async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })    
        if (!user) {
            return res.json({ status: false, message: 'User not found' })
        }

        const token = jwt.sign({ id: user._id }, process.env.KEY, {
            expiresIn: '5m'
        })

        const resetPasswordURL = `${process.env.FRONTEND_URL}/resetPassword/${token}`

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        var mailOptions = {
            from: 'aldoresetpwd@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: `You have requested to reset your password. Please click the following link to reset your password: ${resetPasswordURL}`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.error("Error sending email:", error);
                return res.json({ status: false, message: 'Email not sent' + error })
            } else {
                console.log("Email sent:", info.response);
                return res.json({ status: true, message: 'Email sent: ' + info.response })
            }
        });

    } catch (err) {
        console.error("Error resetting password:", err);
        return res.json({ status: false, message: 'An error occurred while resetting password' })
    }
});


export {router as UserRouter}