const User = require("../../model/v1/User");
const CryptoJS = require("crypto-js");
const {createToken} = require("../../token")

module.exports = () => {
    return {
        register : async (req,res) => {
            const newUser = new User({...req.body, password : CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC_KEY).toString()});
            try{
                const savedUser = await newUser.save();
                res.status(201).json(savedUser);
            }catch(e){
                res.status(500).json(e);
            }
        },

        login : async (req,res) => {
            try{
                const user = await User.findOne({username : req.body.username});
                !user && res.status(400).send({error : "Wrong username"});

                const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC_KEY).toString(CryptoJS.enc.Utf8);

                hashedPassword != req.body.password && res.status(400).send({error : "Wrong password"});

                const access_token = createToken(user._id, user.isAdmin) ;

                const {password, ...rest} = user._doc ;

                res.status(200).json({...rest,access_token});

            }catch(e){
                res.status(500).json(e);
            }
        }
    }
}