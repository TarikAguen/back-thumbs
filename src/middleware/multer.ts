import multer from 'multer';

// Config multer pr fichiers entrants
const upload = multer({
  storage: multer.memoryStorage(), // Stockage en mémoire avant d'envoyer à S3
});
