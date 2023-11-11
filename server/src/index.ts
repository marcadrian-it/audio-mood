import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import util from 'util';
import path from 'path';
import url from 'url';
import { exec as execCb } from 'child_process';

const app = express();
const exec = util.promisify(execCb);
// Define paths
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const paths = {
  exec: path.resolve(__dirname, './whisper.cpp/main'),
  model: path.resolve(__dirname, './whisper.cpp/models/ggml-tiny.en.bin'),
};
const command = `${paths.exec} -m ${paths.model} -f output.wav -otxt -of output`;

app.use(cors());

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage: storage }); // configure multer to save files in 'uploads' directory

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  // Convert the uploaded audio file to the required format using ffmpeg

  await exec(
    `ffmpeg -i ${req!.file!.path} -ar 16000 -ac 1 -c:a pcm_s16le output.wav`
  );

  // Run the command with the -otxt flag to output the result to a text file
  await fs.writeFile('output.txt', '');
  const { stdout, stderr } = await exec(command);
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);

  // Read the contents of the output file
  const transcription = await fs.readFile('output.txt', 'utf8');
  console.log(`Transcription: ${transcription}`);

  // Delete the uploaded and converted audio files
  await fs.unlink(req!.file!.path);
  await fs.unlink('output.wav');

  let body = {
    transcription: transcription.trim(),
    stdout: stdout.trim(),
  };
  res.status(200).send(body);
});

const server = app.listen(3010, () => {
  console.log('Server is running on port 3010');
});

server.timeout = 180000;
