const Order = require("../../model/v1/Order")

module.exports = () => {
    return {
        create : async (req,res) => {
            const newOrder = new Order(req.body);
            try{
                const savedOrder = await newOrder.save();
                res.status(200).json(savedOrder);
            }catch(e){
                res.status(500).json(e);
            }
        },

        update : async (req,res)=>{
            try{
                const updateOrder = await Order.findByIdAndUpdate(req.params.id, {
                    $set : req.body
                },
                {
                    new :true
                }
              );

              res.status(200).json(updateOrder);
            }catch(e){
                res.status(500).json(e);
            }
        },

        delete : async (req,res) => {
            try{
                const deleteOrder = await Order.findByIdAndDelete(req.params.id);
                res.status(200).json("Order hasbeen deleted..")
            }catch(e){
                res.status(500).json(e);
            }
        },

        getOrder : async (req,res) => {
            try{
                const Order = await Order.find({userId : req.params.userId});
                res.status(200).json(Order);
            }catch(e){
                res.status(500).json(e);
            }
        },

        getAllOrders : async (req,res) => {
            try{
                const Orders = await Order.find();
                res.status(200).send(Orders)
            }catch(e){
                res.status(500).json(e);
            }
        },

        income : async (req,res) => {
            const date = new Date(25-12-2021);
            // const lastMonth = new Date(date.setMonth(date.getMonth()-1));
            // const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

            const lastMonth = new Date(date.setMonth(date.getMonth()-1));
            const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));

            try{
                const income = await Order.aggregate([
                    {
                        $match : {
                            createdAt : {
                                $gte : previousMonth
                            }
                        }
                    },
                    {
                        $project : {
                            month : {
                                $month : "$createdAt",                       
                            },
                            sales : "$amount"
                        }
                    },
                    {
                        $group : {
                            _id : "$month",
                            total : {
                                $sum : "$sales"
                            }
                        }
                    }
                ]);

                console.log(income)

                res.status(200).json(income)
            }catch(e){
                res.status(500).json(e);
            }
        }
    }
}