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
    res.cookie('token', token, {maxAge: 3600000, httpOnly: true,  sameSite: 'none', secure: true})

    return res.json({status: true, message: 'User Login Succesfully'})
    
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
                return res.json({ status: false, message: 'Email not sent' + error })
            } else {
                return res.json({ status: true, message: 'Email sent: ' + info.response })
            }
        });

    } catch (err) {
        console.error("Error resetting password:", err);
        return res.json({ status: false, message: 'An error occurred while resetting password' })
    }
});

router.post('/reset-pwd/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    
    try {
        const decoded = jwt.verify(token, process.env.KEY);
        const id = decoded.id;

        const hashPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(
            id,
            {
                password: hashPassword
            }
        );

        return res.json({ status: true, message: 'Password reset successfully' });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.json({ status: false, message: 'Token has expired, please request a new one' });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.json({ status: false, message: 'Invalid token, please request a new one' });
        } else {
            console.error('Error resetting password:', err);
            return res.json({ status: false, message: 'An unexpected error occurred' });
        }
    }
});

const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            // Redirect to login page if token is missing
            return res.redirect('/login');
        }

        const decoded = await jwt.verify(token, process.env.KEY);
        next();
    } catch (err) {
        // Redirect to login page if token is invalid
        return res.redirect('/login');
    }
}



router.get('/verify', verifyUser, (req, res) => {
    return res.json({status: true, message: 'User verified'})
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({status: true, message: 'User logged out'})
})





export {router as UserRouter}