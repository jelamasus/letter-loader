import { OpenAI } from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { load } from 'cheerio';

export class GptClientWrapper {
  private readonly client: OpenAI;

  constructor(apiKey: string, proxy: string) {
    const httpAgent = new HttpsProxyAgent(proxy);

    this.client = new OpenAI({
      apiKey,
      httpAgent,
      maxRetries: 5,
    });
  }

  public async detectInvitationLetter(letter: string): Promise<boolean> {
    const letterText = this.extractPureText(letter);

    const gptResponse = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      tools: [
        {
          type: 'function',
          function: {
            name: 'is_invitational_letter',
            description:
              'Determining that the letter is a job offer, a full-fledged job offer, and not just a job posting',
            strict: true,
            parameters: {
              type: 'object',
              properties: {
                is_invitational_letter: {
                  type: 'boolean',
                  description:
                    'A flag that determines whether the letter is a job offer, a full-fledged job offer, and not just informing about a vacancy',
                },
              },
              required: ['is_invitational_letter'],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: {
          name: 'is_invitational_letter',
        },
      },
      messages: [{ role: 'user', content: letterText }],
    });

    const rawResponse = gptResponse.choices.find(
      (response) =>
        !!response.message.tool_calls && response.message.tool_calls.length > 0,
    );

    if (!rawResponse) {
      throw new Error('Failed to extract gpt response');
    }

    const responseString = rawResponse.message.tool_calls?.find(
      (call) => call.type === 'function',
    )?.function.arguments;

    if (!responseString) {
      throw new Error('Failed to extract gpt response string');
    }

    const response = JSON.parse(responseString) as {
      is_invitational_letter: boolean;
    };

    return response.is_invitational_letter;
  }

  private extractPureText(text: string): string {
    let extracted: string;

    try {
      const html = load(text, null, false);
      extracted = html.text();
    } catch {
      extracted = text;
    }

    return extracted;
  }
}
