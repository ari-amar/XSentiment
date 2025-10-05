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

// Search tweets by topic
app.post('/api/analyze', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!process.env.TWITTER_BEARER_TOKEN) {
      return res.status(500).json({
        error: 'Twitter API token not configured. Please add TWITTER_BEARER_TOKEN to .env file'
      });
    }

    // Fetch tweets from X API
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

    const tweets = response.data.data || [];

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
      tweets: analyzedTweets
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
