const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


module.exports = {
    create: async(req,res) =>{
        try{
         
        }catch(e){
            return res.status(500).send({ error: e.message });
        }
    },

    list: async(req,res) =>{
        try{
         
        }catch(e){
            return res.status(500).send({ error: e.message });
        }
    }

    




}