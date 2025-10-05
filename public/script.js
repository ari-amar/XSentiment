const topicInput = document.getElementById('topicInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');

analyzeBtn.addEventListener('click', analyzeSentiment);
topicInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    analyzeSentiment();
  }
});

async function analyzeSentiment() {
  const topic = topicInput.value.trim();

  if (!topic) {
    showError('Please enter a topic to analyze');
    return;
  }

  // Show loading, hide results and errors
  loading.classList.remove('hidden');
  results.classList.add('hidden');
  error.classList.add('hidden');

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze sentiment');
    }

    displayResults(data);
  } catch (err) {
    showError(err.message);
  } finally {
    loading.classList.add('hidden');
  }
}

function displayResults(data) {
  // Show info message if using mock data
  if (data.usingMockData && data.message) {
    const infoMsg = document.getElementById('infoMessage');
    if (infoMsg) {
      infoMsg.textContent = data.message;
      infoMsg.classList.remove('hidden');
    }
  } else {
    const infoMsg = document.getElementById('infoMessage');
    if (infoMsg) {
      infoMsg.classList.add('hidden');
    }
  }

  // Update summary
  document.getElementById('resultTopic').textContent = data.topic;
  document.getElementById('totalTweets').textContent = data.totalTweets;
  document.getElementById('sentimentScore').textContent = data.sentimentScore;

  const sentimentBadge = document.getElementById('overallSentiment');
  sentimentBadge.textContent = data.sentiment.charAt(0).toUpperCase() + data.sentiment.slice(1);
  sentimentBadge.className = `stat-value sentiment-badge ${data.sentiment}`;

  // Update breakdown
  document.getElementById('positivePercent').textContent = `${data.breakdown.positive}%`;
  document.getElementById('neutralPercent').textContent = `${data.breakdown.neutral}%`;
  document.getElementById('negativePercent').textContent = `${data.breakdown.negative}%`;

  document.getElementById('positiveBar').style.width = `${data.breakdown.positive}%`;
  document.getElementById('neutralBar').style.width = `${data.breakdown.neutral}%`;
  document.getElementById('negativeBar').style.width = `${data.breakdown.negative}%`;

  // Update tweets list
  const tweetsList = document.getElementById('tweetsList');
  tweetsList.innerHTML = '';

  if (data.tweets.length === 0) {
    tweetsList.innerHTML = '<p>No tweets found for this topic.</p>';
  } else {
    data.tweets.forEach(tweet => {
      const tweetCard = document.createElement('div');
      tweetCard.className = `tweet-card ${tweet.sentiment}`;

      const tweetHeader = document.createElement('div');
      tweetHeader.className = 'tweet-header';

      const sentimentLabel = document.createElement('span');
      sentimentLabel.className = `tweet-sentiment ${tweet.sentiment}`;
      sentimentLabel.textContent = tweet.sentiment.charAt(0).toUpperCase() + tweet.sentiment.slice(1);

      const scoreLabel = document.createElement('span');
      scoreLabel.textContent = `Score: ${tweet.score}`;
      scoreLabel.style.fontSize = '0.9em';
      scoreLabel.style.color = '#666';

      tweetHeader.appendChild(sentimentLabel);
      tweetHeader.appendChild(scoreLabel);

      const tweetText = document.createElement('p');
      tweetText.className = 'tweet-text';
      tweetText.textContent = tweet.text;

      const tweetDate = document.createElement('p');
      tweetDate.className = 'tweet-date';
      tweetDate.textContent = new Date(tweet.created_at).toLocaleString();

      tweetCard.appendChild(tweetHeader);
      tweetCard.appendChild(tweetText);
      tweetCard.appendChild(tweetDate);

      tweetsList.appendChild(tweetCard);
    });
  }

  results.classList.remove('hidden');
}

function showError(message) {
  error.textContent = message;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}
