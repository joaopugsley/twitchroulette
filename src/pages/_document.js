import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="TwitchRoulette is a website that conducts giveaways for Twitch streamers. Make your broadcasts more fun with our giveaway tools."></meta>
        <meta name="keywords" content="Twitch, TwitchRoulette, giveaway, streamers, tools, broadcasts, roulette, livestreaming"></meta>
        <meta name="author" content="TwitchRoulette"></meta>
        <meta property="og:title" content="TwitchRoulette - Giveaways for Twitch Streamers"></meta>
        <meta property="og:description" content="Make your broadcasts more fun with our giveaway tools."></meta>
        <meta property="og:url" content="https://twitchroulette.live"></meta>
        <meta property="og:type" content="website"></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
