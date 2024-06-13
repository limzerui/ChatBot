import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type Data = {
  result?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  console.log("OPENAI_API_KEY:", apiKey);

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log("Response from OpenAI:", response.data);

    const { choices } = response.data;
    res.status(200).json({ result: choices[0].message.content });
  } catch (error) {
    if (error.response) {
      console.error("Error response from OpenAI API:", error.response.data);
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      console.error("No response received from OpenAI API:", error.request);
      res.status(500).json({ error: 'No response received from OpenAI API' });
    } else {
      console.error("Error setting up OpenAI API request:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
}
