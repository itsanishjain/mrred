import FirecrawlApp from "firecrawl";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export async function generateLLMsTxt(
  apiKey: string,
  url: string,
  maxUrls: number = 2,
  showFullText: boolean = true
) {
  // Initialize the client
  const firecrawl = new FirecrawlApp({ apiKey });

  // Define generation parameters
  const params = {
    maxUrls,
    showFullText,
  };

  // Generate LLMs.txt with polling
  const results = await firecrawl.generateLLMsText(url, params);

  return results;
}

const apiKey = process.env.FIRECRAWL_API_KEY;

export const generateLLMsTxtWrapper = async () => {
  try {
    const results = await generateLLMsTxt(
      apiKey!,
      "https://lens.xyz/docs/protocol",
      50,
      true
    );

    // Access generation results
    if (results.success) {
      //   console.log(`Status: ${results.status}`);
      //   console.log(`Generated Data:`, results.data);
      fs.writeFileSync("lens-protocol-llm.txt", results.data.llmsfulltxt || "");
    } else {
      console.error(`Error: ${results.error || "Unknown error"}`);
    }
    return;
  } catch (error) {
    console.error("Error generating LLMs.txt:", error);
  }
};

console.log("Generating LLMs.txt");
console.log("API Key: ", apiKey);
if (apiKey) {
  generateLLMsTxtWrapper();
}
