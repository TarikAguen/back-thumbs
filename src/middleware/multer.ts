import multer from 'multer';

// Configuration de multer pour gérer les fichiers entrants
const upload = multer({
  storage: multer.memoryStorage(), // Stockage en mémoire avant d'envoyer à S3
});
