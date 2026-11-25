const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


module.exports = {
    create: async(req,res) =>{
        try{
         
            const { name, groupId, machineId } = req.body;

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

              const result = await prisma.$transaction(async (tx) => {
                
                const die = await tx.die.create({
                  data: {
                    name: name
                  },
                  select: {
                    id: true,
                    name: true,
                    status: true,
                  },
                })

                const  mapDieMachineGroup = await tx.mapDieMachineGroup.create({
                  data:{
                    machineId: parseInt(machineId),
                    dieId: parseInt(die.id),
                    groupId: parseInt(groupId)
                  }
                })

                return {
                  die,
                  mapDieMachineGroup
                };
              });


            return res.send({
                message: 'create_die_success',
                data: result,
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
                },
                include: {
                  MapDieMachineGroup: {
                    orderBy: { id: 'asc' },
                    select: {
                      Group: { select: { id: true, name: true } },
                      Machine: { select: { id: true, name: true } },
                    },
                  },
                },
            })
            return res.send({ results: rows })

        }catch(e){
            return res.status(500).send({ error: e.message });
        }
    },


    update: async(req, res) =>{
      try{
        
      }catch(e){
        return res.status(500).send({ error: e.message });
      }
    }

    

}
