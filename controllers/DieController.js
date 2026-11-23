const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


module.exports = {
    create: async(req,res) =>{
        try{
         
            const { name } = req.body;

            if (!name) {
              return res.status(400).send({ message: 'missing_required_fields' });
            }

            const checkDie = await prisma.die.findFirst({
                where: {
                  name: name,
                  status: 'use',
                },
              });

              if (checkDie) {
                return res.status(400).send({ message: 'Die_name_already' });
              }  


              const die = await prisma.die.create({
                data: {
                  name: name
                },
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              });

            return res.send({
                message: 'add_die_success',
                data: group,
            });


        }catch(e){
            return res.status(500).send({ error: e.message });
        }
    },

    list: async(req,res) =>{
        try{
            
            const rows = await prisma.die.findMany({
                where: {
                  status: 'use'
                }
            })
            return res.send({ results: rows })

        }catch(e){
            return res.status(500).send({ error: e.message });
        }
    }

    

}