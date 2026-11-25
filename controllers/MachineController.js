const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    create: async(req,res) =>{
        try{
            const { name } = req.body;

            if (!name) {
              return res.status(400).send({ message: 'missing_required_fields' });
            }

            const checkMachine = await prisma.machine.findFirst({
                where: {
                  name: name,
                  status: 'use',
                },
              });

              if (checkMachine) {
                return res.status(400).send({ message: 'machine_name_already' });
              }  


              const machine = await prisma.machine.create({
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
                message: 'add_machine_success',
                data: machine,
            });

        }catch(e){
            return res.status(500).send({ error: e.message });
        }
    },

    list: async(req,res) =>{
        try{
            const rows = await prisma.machine.findMany({
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
