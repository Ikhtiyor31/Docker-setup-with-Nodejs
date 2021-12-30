const User = require("../models/userModel")
const bcrypt = require('bcryptjs')

exports.signUp = async (req, res) => {
    try {
        const {username, password} = req.body
        const hashpassword = await bcrypt.hash(password, 12)
        const newUser = await User.create({
            username,
            password: hashpassword
        })
        res.status(201).json({
            status: "succes",
            data: {
                user: newUser
            }
        })
    } catch(err) {
        res.status(400).json({
            status: "fail"
        })
    }
} 

exports.signIn = async (req, res) => {
    const {username, password} = req.body;
    req.session.user = username;
    try {
        const user = await User.findOne({username})
        if (!user) {
            res.status(404).json({
                status: 'fail',
                message: 'user not found'
            })
        }
        const isCorrect = await bcrypt.compare(password, user.password)
        if (isCorrect){
            res.status(200).json({
                status: 'success'
            })
        } else {
            res.status(400).json({
                status: 'fail',
                message: 'incorrect username or password'
            })
        }
    } catch(err) {
        res.status(400).json({
            status: "fail"
        })
    }
}
