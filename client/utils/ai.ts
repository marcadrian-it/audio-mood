import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { PromptTemplate } from "langchain/prompts";
import { Document } from "langchain/document";
import { loadQARefineChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

interface Entry {
  id: string;
  createdAt: Date;
  content: string;
}

interface DocumentMetadata {
  id: string;
  createdAt: Date;
}

interface AnalyzeResult {
  sentimentScore: number;
  mood: string;
  summary: string;
  subject: string;
  negative: boolean;
  color: string[];
}

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    sentimentScore: z
      .number()
      .describe(
        "sentiment of the text and rated on a scale from -10 to 10, where -10 is extremely negative, 0 is neutral, and 10 is extremely positive."
      ),
    mood: z
      .string()
      .describe("the mood of the person who wrote the journal entry."),
    summary: z.string().describe("quick summary of the entire entry."),
    subject: z.string().describe("the subject of the journal entry."),
    negative: z
      .boolean()
      .describe(
        "is the journal entry negative? (i.e. does it contain negative emotions?)."
      ),
    color: z
      .array(z.string())
      .describe(
        "an array of hexidecimal color codes (color palette) that represents the mood of the entry. Example happy palette representing happiness, sad palette representing bad mood etc."
      ),
  })
);

const getPrompt = async (content: string): Promise<string> => {
  console.log("Start getPrompt");
  console.log("Content:", content);

  const formattedInstructions = parser.getFormatInstructions();
  console.log("Formatted instructions:", formattedInstructions);

  const prompt = new PromptTemplate({
    template:
      "Analyze the following journal entry. Follow the instructions and format your response to match the format instructions, no matter what! \n {formattedInstructions}\n{entry}",
    inputVariables: ["entry"],
    partialVariables: {
      formattedInstructions,
    },
  });

  const input = await prompt.format({
    entry: content,
  });
  console.log("Input:", input);

  console.log("End getPrompt");
  return input;
};

export const analyze = async (
  content: string
): Promise<AnalyzeResult | undefined> => {
  console.log("Start analyze");
  console.log("Content:", content);

  const input = await getPrompt(content);
  console.log("Input:", input);

  const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo-1106" });

  const result = await model.call(input);
  console.log("Result:", result);

  try {
    const parsedResult = parser.parse(result);
    console.log("Parsed result:", parsedResult);

    console.log("End analyze");
    return parsedResult;
  } catch (error: any) {
    console.log("Error during parsing:", error);
  }
};

export const qa = async (
  question: string,
  entries: Entry[]
): Promise<string> => {
  const docs = entries.map((entry) => {
    return new Document({
      pageContent: entry.content,
      metadata: { id: entry.id, createdAt: entry.createdAt },
    });
  });

  const embeddings = new OpenAIEmbeddings();
  const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo-1106" });
  const chain = loadQARefineChain(model);
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const relevantDocs = await store.similaritySearch(question);

  const res = await chain.call({
    input_documents: relevantDocs,
    question,
  });

  return res.output_text;
};
