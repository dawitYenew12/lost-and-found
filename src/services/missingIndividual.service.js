import { MissingIndividual } from '../models/missingPerson.model.js';

export const missingIndividualService = async (missingIndividualBody) => {
      const missingCase = await MissingIndividual.create(missingIndividualBody);
      return missingCase;
}

export default missingIndividualService;