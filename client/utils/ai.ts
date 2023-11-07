import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { PromptTemplate } from "langchain/prompts";

const getPrompt = async (content) => {
  const formattedInstructions = parser.getFormatInstructions();

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

  return input;
};

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

export const analyze = async (content) => {
  const input = await getPrompt(content);
  const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo-1106" });

  const result = await model.call(input);

  try {
    return parser.parse(result);
  } catch (error: any) {
    console.log(error);
  }
};
