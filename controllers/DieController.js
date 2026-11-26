const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function parseId(value) {
    const id = typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value) : value;
    return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

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
                    dieId: die.id,
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
                      id: true,
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


    update: async (req, res) => {
        try {
            const body = req.body ?? {};
            const name = typeof body.name === 'string' ? body.name.trim() : '';
            if (!name || body.dieId == null || body.groupId == null || body.machineId == null) {
                return res.status(400).send({ message: 'missing_required_fields' });
            }

            const dieId = parseId(body.dieId);
            const groupId = parseId(body.groupId);
            const machineId = parseId(body.machineId);
            const mappingId = body.mappingId == null ? null : parseId(body.mappingId);
            if (dieId === null || groupId === null || machineId === null ||
                (body.mappingId != null && mappingId === null) || name.length > 1000) {
                return res.status(400).send({ message: 'invalid_die_update_fields' });
            }

            const result = await prisma.$transaction(async (tx) => {
                const currentDie = await tx.die.findFirst({
                    where: { id: dieId, status: 'use' },
                    select: { id: true, MapDieMachineGroup: { select: { id: true } } },
                });
                if (!currentDie) return { status: 404, message: 'die_not_found' };

                const mappings = currentDie.MapDieMachineGroup;
                if (mappingId === null && mappings.length > 1) {
                    return { status: 409, message: 'die_mapping_id_required' };
                }
                const mapping = mappingId === null ? mappings[0] : mappings.find(row => row.id === mappingId);
                if (mappingId !== null && !mapping) {
                    return { status: 404, message: 'die_mapping_not_found' };
                }

                const duplicate = await tx.die.findFirst({
                    where: { id: { not: dieId }, name, status: 'use' },
                    select: { id: true },
                });
                if (duplicate) return { status: 400, message: 'Die_name_already' };

                const group = await tx.group.findFirst({
                    where: { id: groupId, status: 'use' },
                    select: { id: true },
                });
                if (!group) return { status: 404, message: 'group_not_found' };

                const machine = await tx.machine.findFirst({
                    where: { id: machineId, status: 'use' },
                    select: { id: true },
                });
                if (!machine) return { status: 404, message: 'machine_not_found' };

                const die = await tx.die.update({
                    where: { id: dieId },
                    data: { name },
                    select: { id: true, name: true, status: true },
                });
                const mapDieMachineGroup = mapping
                    ? await tx.mapDieMachineGroup.update({
                        where: { id: mapping.id },
                        data: { groupId, machineId },
                    })
                    : await tx.mapDieMachineGroup.create({
                        data: { dieId, groupId, machineId },
                    });

                return { status: 200, message: 'update_die_success', data: { die, mapDieMachineGroup } };
            }, { isolationLevel: 'Serializable' });

            const { status, ...response } = result;
            return res.status(status).send(response);
        } catch (e) {
            if (e.code === 'P2034') {
                return res.status(409).send({ message: 'die_update_conflict' });
            }
            return res.status(500).send({ error: e.message });
        }
    }

    

}
