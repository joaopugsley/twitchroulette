import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="TwitchRoulette is the perfect platform for Twitch streamers to conduct custom giveaways. Easily create and personalize your giveaways in just a few clicks, with multipliers and keywords. Enhance engagement, loyalty, and drive traffic to your channel with TwitchRoulette."></meta>
        <meta name="keywords" content="Twitch, TwitchRoulette, giveaway, streamers, tools, broadcasts, roulette, livestreaming"></meta>
        <meta name="author" content="TwitchRoulette"></meta>
        <meta property="og:title" content="TwitchRoulette - Giveaways for Twitch Streamers"></meta>
        <meta property="og:description" content="Make your broadcasts more fun with our giveaway tools."></meta>
        <meta property="og:url" content="https://twitchroulette.live"></meta>
        <meta property="og:type" content="website"></meta>
        <meta name="google-site-verification" content="zh3jsLwGQrCCKb3wfyTmDCUIiMRRs2_9dlbF1yZD8G8" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
