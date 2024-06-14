'use client';

import { useState } from 'react';
import './globals.css';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let newConversation = { prompt, response: '' };
      setConversations((prevConversations) => [...prevConversations, newConversation]);

      let tempState = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const newValue = (tempState + chunk).split('\n\n').filter(Boolean);

        for (const item of newValue) {
          try {
            const json = JSON.parse(item.replace(/^data: /, ''));
            const content = json.choices[0].delta?.content || '';
            newConversation.response += content;
            setConversations((prevConversations) => {
              const updatedConversations = [...prevConversations];
              updatedConversations[updatedConversations.length - 1] = newConversation;
              return updatedConversations;
            });
            tempState = '';
          } catch (e) {
            tempState = item;
          }
        }
      }

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
          rows={5}
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
