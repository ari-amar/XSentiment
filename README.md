# XSentiment

A web application that analyzes sentiment on X (Twitter) for any given topic.
The core algorithm is: text → word scores → sum → categorize → aggregate → percentages

## Features

- Real-time sentiment analysis of tweets
- Visual breakdown of positive, negative, and neutral sentiment
- Display of recent tweets with individual sentiment scores
- Clean, modern UI

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get X (Twitter) API Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app (or use an existing one)
3. Generate a Bearer Token

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Twitter Bearer Token:

```
TWITTER_BEARER_TOKEN=your_actual_bearer_token_here
PORT=3000
```

### 4. Run the Application

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Enter a topic in the search box (e.g., "artificial intelligence", "climate change", "coffee")
2. Click "Analyze Sentiment" or press Enter
3. View the sentiment analysis results including:
   - Total number of tweets analyzed
   - Overall sentiment (positive/negative/neutral)
   - Sentiment score
   - Percentage breakdown
   - Individual tweets with their sentiment scores

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**: X (Twitter) API v2
- **Sentiment Analysis**: sentiment.js library

## Notes

- The free tier of Twitter API allows searching tweets from the past 7 days
- Maximum 100 tweets per search query
- API rate limits apply based on your Twitter API plan

## License

MIT
