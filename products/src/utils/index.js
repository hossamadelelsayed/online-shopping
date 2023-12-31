const bcrypt = require('bcrypt');
const jwt  = require('jsonwebtoken');
const amqplib = require('amqplib')
const { APP_SECRET , MESSAGE_BROKER_URL , EXCHANGE_NAME , QUEUE_NAME} = require('../config');
const { connect } = require('mongoose');

//Utility functions
module.exports.GenerateSalt = async() => {
        return await bcrypt.genSalt()    
},

module.exports.GeneratePassword = async (password, salt) => {
        return await bcrypt.hash(password, salt);
};


module.exports.ValidatePassword = async (enteredPassword, savedPassword, salt) => {
        return await this.GeneratePassword(enteredPassword, salt) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
        return await jwt.sign(payload, APP_SECRET, { expiresIn: '1d'} )
}, 

module.exports.ValidateSignature  = async(req) => {

        const signature = req.get('Authorization');

        console.log(signature);
        
        if(signature){
            const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
            req.user = payload;
            return true;
        }

        return false
};

module.exports.FormateData = (data) => {
        if(data){
            return { data }
        }else{
            throw new Error('Data Not found!')
        }
    }
// message broker ( the better solution)

// create channel
module.exports.CreateChannel = async ()=>{
        try{
                const connection = await amqplib.connect(MESSAGE_BROKER_URL);
                const channel = await connection.createChannel();
                await channel.assertExchange(EXCHANGE_NAME,'direct',false);
                return channel;
        }catch(err){
                throw err;
        }
}

// publish messages
module.exports.PublishMessage = async (channel , binding_key , message)=>{
        try{
                await channel.publish(EXCHANGE_NAME,binding_key,Buffer.from(message));
                console.log('published message ===>',message)
        }catch(err){
                throw err;
        }

}









// old school http web comunication pattern ( web hooks )

// module.exports.PublishCustomerEvent = (payload) => {
//         axios.post('http://localhost:8000/customer/app-events',{
//                 payload
//         })
// }

// module.exports.PublishShoppingEvent = (payload) => {
//         axios.post('http://localhost:8000/shopping/app-events',{
//                 payload
//         })
// }
