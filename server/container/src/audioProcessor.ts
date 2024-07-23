import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

interface Config {
  model: string;
  execPath: string;
  modelPathTemplate: string;
}

class AudioProcessor {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private get modelPath(): string {
    return this.config.modelPathTemplate.replace("{model}", this.config.model);
  }

  async processAudio(inputFile: string): Promise<string> {
    const outputFile = `${inputFile}.json`;
    const command = `${this.config.execPath} -m ${this.modelPath} -f ${inputFile} -oj -of ${outputFile}`;

    try {
      await execAsync(command);
      return outputFile;
    } catch (error) {
      throw new Error(`Failed to process audio file: ${error}`);
    }
  }

  async cleanupFiles(files: string[]): Promise<void> {
    try {
      await Promise.all(files.map((file) => fs.unlink(file)));
    } catch (error) {
      console.error(`Error cleaning up temporary files: ${error}`);
    }
  }
}

export default AudioProcessor;
