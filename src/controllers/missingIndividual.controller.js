import { missingIndividualService   } from '../services/missingIndividual.service.js';
export const createMissingIndividual = async (req, res) => {
   const missingIndividualCase = await missingIndividualService(req.body);
    res.send('saved');
}

export default createMissingIndividual;