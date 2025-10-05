require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Sentiment = require('sentiment');

const app = express();
const sentiment = new Sentiment();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock data generator for demo purposes
function generateMockTweets(topic) {
  const mockTemplates = [
    { text: `Really excited about ${topic}! This is game-changing.`, sentiment: 3 },
    { text: `Just learned about ${topic} and I'm impressed by the potential.`, sentiment: 2 },
    { text: `${topic} is interesting but needs more development.`, sentiment: 0 },
    { text: `I'm skeptical about ${topic}. Not convinced yet.`, sentiment: -1 },
    { text: `${topic} has some serious issues that need addressing.`, sentiment: -2 },
    { text: `Love how ${topic} is evolving! Great progress.`, sentiment: 3 },
    { text: `${topic} is okay, nothing special though.`, sentiment: 0 },
    { text: `Disappointing experience with ${topic} today.`, sentiment: -2 },
    { text: `${topic} exceeded my expectations! Highly recommend.`, sentiment: 3 },
    { text: `Not sure what to think about ${topic} yet.`, sentiment: 0 },
    { text: `${topic} is revolutionary! Can't wait to see where this goes.`, sentiment: 3 },
    { text: `Tried ${topic} and had mixed feelings about it.`, sentiment: 0 },
    { text: `${topic} could be better. Needs improvement.`, sentiment: -1 },
    { text: `Amazing results with ${topic}! Very satisfied.`, sentiment: 3 },
    { text: `${topic} is overhyped in my opinion.`, sentiment: -1 }
  ];

  // Generate 20-30 random tweets
  const count = Math.floor(Math.random() * 11) + 20;
  const tweets = [];

  for (let i = 0; i < count; i++) {
    const template = mockTemplates[Math.floor(Math.random() * mockTemplates.length)];
    const daysAgo = Math.floor(Math.random() * 7);
    const hoursAgo = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);

    tweets.push({
      text: template.text,
      created_at: date.toISOString()
    });
  }

  return tweets;
}

// Search tweets by topic
app.post('/api/analyze', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    let tweets = [];
    let usingMockData = false;

    if (!process.env.TWITTER_BEARER_TOKEN) {
      // Use mock data if no token configured
      tweets = generateMockTweets(topic);
      usingMockData = true;
    } else {
      // Try to fetch from Twitter API
      try {
        const response = await axios.get(
          `https://api.twitter.com/2/tweets/search/recent`,
          {
            params: {
              query: topic,
              max_results: 100,
              'tweet.fields': 'created_at,public_metrics'
            },
            headers: {
              'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            }
          }
        );

        tweets = response.data.data || [];
      } catch (apiError) {
        // If API fails (rate limit, auth error, etc.), fall back to mock data
        console.log('Twitter API failed, using mock data:', apiError.response?.data || apiError.message);
        tweets = generateMockTweets(topic);
        usingMockData = true;
      }
    }

    if (tweets.length === 0) {
      return res.json({
        topic,
        totalTweets: 0,
        sentimentScore: 0,
        sentiment: 'neutral',
        breakdown: { positive: 0, negative: 0, neutral: 0 },
        tweets: []
      });
    }

    // Analyze sentiment
    let totalScore = 0;
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    const analyzedTweets = tweets.map(tweet => {
      const analysis = sentiment.analyze(tweet.text);
      totalScore += analysis.score;

      if (analysis.score > 0) positive++;
      else if (analysis.score < 0) negative++;
      else neutral++;

      return {
        text: tweet.text,
        score: analysis.score,
        sentiment: analysis.score > 0 ? 'positive' : analysis.score < 0 ? 'negative' : 'neutral',
        created_at: tweet.created_at
      };
    });

    const avgScore = totalScore / tweets.length;
    const overallSentiment = avgScore > 0 ? 'positive' : avgScore < 0 ? 'negative' : 'neutral';

    res.json({
      topic,
      totalTweets: tweets.length,
      sentimentScore: avgScore.toFixed(2),
      sentiment: overallSentiment,
      breakdown: {
        positive: ((positive / tweets.length) * 100).toFixed(1),
        negative: ((negative / tweets.length) * 100).toFixed(1),
        neutral: ((neutral / tweets.length) * 100).toFixed(1)
      },
      tweets: analyzedTweets,
      usingMockData,
      message: usingMockData ? 'Using demo data due to Twitter API limitations' : undefined
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to analyze sentiment',
      details: error.response?.data?.detail || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
