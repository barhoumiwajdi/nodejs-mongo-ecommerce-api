const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const api_config = require("../config/api.js");

const AuthController = {

    /* create new user */
    async create_user(req, res, next) {

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        try {
            const user = await newUser.save();
            res.status(201).json({
                type: 'success',
                message: "User has been created successfuly",
                user
            })
        } catch (err) {
            res.status(500).json({
                type: "error",
                message: "Something went wrong please try again",
                err
            })
        }
    },

    /* login existing user */
    async login_user(req, res) {

        const user = await User.findOne({ username: req.body.username });

        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
            res.status(500).json({
                type: "error",
                message: "User not exists or invalid credentials",
            })
        } else {

            const accessToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin
            },
                api_config.api.jwt_secret,
                { expiresIn: "1d" }
            );

            const { password, ...data } = user._doc;

            res.status(200).json({
                type: "success",
                message: "Successfully logged",
                ...data,
                accessToken
            })
        }
    }
};

module.exports = AuthController;

exports.forgetpassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        console.log(user);
        if (user) {
            const resetToken = randomString.generate(20);
            const reset = {
                userId: user._id,
                token: resetToken
            }
            await Token.create(reset)
            const link = `${process.env.protocol}resetPassword/${resetToken}`

            let transporter = nodemailer.createTransport({
                host: process.env.host,
                port: process.env.port,
                secure: false,
                auth: {
                    user: process.env.email,
                    pass: process.env.password,
                },
            });

            await transporter.sendMail({
                from: `${process.env.email}`,
                to: `${req.body.email}`,
                subject: "Reset your password",

                html: `<h1>reset your password </h1> 
        <p> Bonjour  ${req.body.firsName} ${req.body.lastName},this's the link to reset your password! </p> <br>
         <a href="${link}">reset link</a>
        `
            })
            res.status(200).send({ message: 'link sent successfully' })

        } else {
            res.status(400).send({ message: `user not found!` })
        }

    } catch (error) {
        res.status(500).send({ message: error.message || "An error occured" });
    }
}

/**
 * 
 * 
 */
exports.resetPassword = async (req, res) => {
    try {
        const token = await Token.findOne({ token: req.params.token })
        console.log(token.userId);
        if (token) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            await User.findByIdAndUpdate(token.userId, { password: req.body.password, passwordHashed: hash }, { new: true })
            res.status(200).send({ message: 'password updated' })
        } else {
            res.status(400).send({ message: 'token invalid' })
        }
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occured" });
    }
}