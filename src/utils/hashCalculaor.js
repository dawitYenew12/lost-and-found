import crypto from 'crypto';

export const calculateHash = (missingIndividualBody) => {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(missingIndividualBody));
    return hash.digest("hex");
}