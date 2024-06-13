'use client'; // Ensure this is the first line to enable client-side code

import { useState } from 'react';
import axios from 'axios';
import './globals.css'; // Import the global styles

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [conversations, setConversations] = useState<{ prompt: string; response: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/chat', { prompt });
      const newConversation = {
        prompt,
        response: res.data.result
      };
      setConversations([...conversations, newConversation]);
      setPrompt(''); // Clear the input field after submission
    } catch (error) {
      console.error(error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>ChatGPT Clone</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5} // Change this line
          placeholder="Type your prompt here..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <div className="conversations">
        <h2>Conversations:</h2>
        {conversations.map((conversation, index) => (
          <div key={index} className="conversation">
            <p><strong>You:</strong> {conversation.prompt}</p>
            <p><strong>ChatGPT:</strong> {conversation.response}</p>
          </div>
        ))}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
