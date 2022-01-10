const CryptoJS = require("crypto-js");
const User = require("../../model/v1/User");

module.exports = () => {
    return {
        updateUser : async (req,res) => {
            if(req.body.password){
                req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC_KEY).toString();
            }

            try{
                const updateUser = await User.findByIdAndUpdate(req.params.id, { $set : req.body }, { new : true});
                res.status(200).json(updateUser);
            }catch(e){
                res.status(500).json(e);
            }
        },

        deleteUser : async (req,res) => {
            try{
                await User.findByIdAndDelete(req.params.id);
                res.status(200).json("user hasbeen deleted ..")
            }catch(e){
                res.status(500).json(e);
            }
        },

        // GEt User
        getUser : async (req,res) => {
            try{
                const user = await User.findById(req.params.id);
                const {password, ...rest} = user._doc ;
                res.status(200).json(rest)
            }catch(e){
                res.status(500).json(e);
            }
        },

        // GEt ALL USERS
        getAllUsers : async (req,res) => {
            const query = req.query.new ;
            try{
                const users = query ? await User.find().sort({_id : -1}).limit(2) : await User.find() ;
                res.status(200).json(users);
            }catch(e){
                res.status(500).json(e);
            }
        },

        //get all Coordinators
        getCoordinators: async (req,res) => {
            try{
                const users = await User.find() ;
                res.status(200).json(users);
            }catch(e){
                res.status(500).json(e);
            }
        },

        //users stats
        usersStats : async (req,res) => {
            const date = new Date();
            const lastYear = new Date(date.setFullYear(date.getFullYear()-1));
            try{              
                const data = await User.aggregate([
                    {
                        $match : {
                            createdAt : {
                                $gte : lastYear
                            }
                        }
                    },
                    {
                        $project : {
                            month : {
                                $month : "$createdAt"
                            }
                        } 
                    },
                    {
                        $group : {
                            _id : "$month",
                            total : {$sum : 1}
                        }
                    }
                ]);
        
                res.status(200).json(data);
            }catch(e){
                res.status(500).json("error");
            }
        }

    }
}