import Image from 'next/image';
import { useState, useEffect } from "react";
import { scroller } from "react-scroll";
import Roulette from "@/components/roulette";
import { useTranslation } from "react-i18next";

export default function Home() {

  const { t, i18n: {changeLanguage, language} } = useTranslation();

  const [lang, setLang] = useState(language);

  const [ws, setSocket] = useState(null);
  const [connected, setConnected] = useState(false)

  const [channel, setChannel] = useState(null);
  const [title, setTitle] = useState(language == "en" ? "New Giveaway!" : "Novo Sorteio!");
  const [keyword, setKeyword] = useState(null);
  const [subOnly, setSubOnly] = useState(false);
  const [subMultiplier, setSubMultiplier] = useState(1);
  const [participants, setParticipants] = useState([]);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {

    if(lang !== language) {

      changeLanguage(lang);
      localStorage.setItem("preferredLanguage", lang);

    }

  }, [lang]);

  useEffect(() => {

    const userLang = localStorage.getItem("preferredLanguage");

    if(userLang) {
      setLang(userLang);
    }

  }, []);

  useEffect(() => {

    if(started === true && connected === false) {
      setConnected(true);
      connect(channel);
    }

  }, [started, connected])

  useEffect(() => {

    if(ws) {

      ws.onmessage = (event) => {
        if(!event.data.includes("PRIVMSG")) return;
  
        const message = event.data.split(";");
  
        const author = message.find(msg => msg.startsWith("display-name")).split("=")[1];
        const text = message.find(msg => msg.includes(`PRIVMSG #${channel}`)).split(`PRIVMSG #${channel} :`)[1];
        const isSubscriber = message.find(msg => msg.startsWith("subscriber=")).split("subscriber=")[1] == "1";

        if(keyword && text.toLowerCase().includes(keyword.toLowerCase())) {
          formatParticipant(author, isSubscriber);
        }
  
      };

    }

  }, [ws, connected, started, finished, participants])

  const formatParticipant = (user, isSubscriber) => {

    if(started !== true || finished === true) return false; // giveaway not open

    if(!isSubscriber && subOnly === true) return false; // sub only

    const multiplier = isSubscriber === true ? parseInt(subMultiplier) : 1;

    const registered = participants.some(p => p.name == user);

    if(registered === true) return false; // ja está participando

    setParticipants(oldArray => [...oldArray, {name: user, multiplier: multiplier}]);

  }

  const formatChannel = (channelLink) => {
    channelLink = channelLink.toString().toLowerCase();
    if(channelLink.includes("twitch.tv/")) {
      const channelData = channelLink.split("twitch.tv/");
      if(channelData.length < 0) return;
      const channelName = channelData[1];
      const invalid = ["@", "!", "#", "$", "%", "¨", "&", "*", "(", ")", "-", "+", "=", ".", ",", ":", "/", "?", "]", "[", "^", "~", "|"];
      const isInvalid = invalid.some(char => channelName.includes(char));
      if(isInvalid == true) return;
      setChannel(channelName);
    }
  }

  const connect = (channel) => {
    // connect to twitch channel

    const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    socket.onopen = () => {
      socket.send(`CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership`);
      socket.send(`PASS SCHMOOPIIE`);
      socket.send(`NICK justinfan12345`);
      socket.send(`JOIN #${channel}`);
    };

    setSocket(socket);

  };

  const scrollToStart = () => {
    scroller.scrollTo("start", {
      duration: 600,
      smooth: "easeInOutQuart"
    })
  }

  const scrollToRoulette = () => {
    setStarted(true);
    setTimeout(() => {
      scroller.scrollTo("roulette", {
        duration: 600,
        smooth: "easeInOutQuart"
      })
    }, 100)
  }

  return (
    <main>
      <title>TwitchRoulette</title>
      <div className="bg-purple w-screen h-screen flex justify-center items-center scroll-smooth">
        <div className="absolute right-2 top-2 flex flex-row justify-between w-[90px] select-none">
          <Image alt="Português Brasileiro (pt-BR)" onClick={() => {setLang("pt")}} width={40} height={28} className="w-[40px] h-auto cursor-pointer hover:scale-110" src="https://media.discordapp.net/attachments/1085074834523967569/1092597129018617886/image.png"/>
          <Image alt="English (en-US)" onClick={() => {setLang("en")}} width={40} height={28} className="w-[40px] h-auto cursor-pointer hover:scale-110" src="https://cdn.discordapp.com/attachments/1085074834523967569/1092597230248144896/image.png"/>
        </div>
        <div className="p-10 flex flex-col justify-center items-center">
          <h1 className="text-4xl font-extrabold text-white text-center select-none">TwitchRoulette!</h1>
          <h1 className="text-1xl mt-1 font-extralight text-gray-300 text-center select-none hover:text-white transition-all sm:text-[2.8vw]">{t("homescreen_slogan_1")}<a className="font-extrabold">stream</a>{t("homescreen_slogan_2")}</h1>
          <div onClick={scrollToStart} className="border border-white mt-3 pl-[20px] pr-[20px] h-[40px] rounded-xl flex flex-row justify-center items-center text-white select-none hover:scale-105 transition-all ease-in-out duration-50">{t("homescreen_start_button")}</div>
        </div>
      </div>
      <div id="start" className="relative bg-gray-100 w-screen h-[100vh] flex flex-col justify-center items-center scroll-smooth sm:h-[120vh]">
        <div className="text-default text-3xl font-bold select-none">{t("config_title")}</div>
        <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
          <h1 className="text-dark-default text-2xl font-extrabold select-none sm:text-[3.5vw]">{t("config_channellink")}<a href="https://twitch.tv/" className="text-purple hover:cursor-pointer">Twitch</a></h1>
          <input type="text" disabled={started} onChange={event => formatChannel(event.target.value)} id="channel" className="bg-gray-100 mt-2 p-2 rounded-md border text-default border-gray-300 focus:border-purple w-full" placeholder="URL"/>
        </div>
        { channel ? (
          <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
            <h1 className="text-dark-default text-2xl font-extrabold select-none sm:text-[4vw]">{t("config_giveaway_title")}</h1>
            <input type="text" disabled={started} onChange={event => setTitle(event.target.value)} className="bg-gray-100 mt-2 p-2 rounded-md border text-default border-gray-300 focus:border-purple w-full" placeholder={t("config_giveaway_title")} defaultValue={t("config_giveaway_title_default")}/>
          </div>
        ) : null}
        { channel ? (
          <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
            <h1 className="text-dark-default text-2xl font-extrabold select-none sm:text-[4vw]">{t("config_giveaway_keyword")}</h1>
            <input type="text" disabled={started} onChange={event => setKeyword(event.target.value)} className="bg-gray-100 mt-2 p-2 rounded-md border text-default border-gray-300 focus:border-purple w-full" placeholder={t("config_giveaway_keyword_placeholder")}/>
            <h1 className="text-gray-500 text-sm italic mt-1 font-extralight select-none">{t("config_giveaway_keyword_description")}</h1>
          </div>
        ) : null}
        { channel ? (
          <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
            <h1 className="text-dark-default text-2xl font-extrabold select-none sm:text-[4vw]">{t("config_giveaway_participation")}</h1>
            <div className="mt-3 flex flex-row items-center">
              <input type="checkbox" disabled={started} value="" onChange={(event) => setSubOnly(event.target.checked)} className="w-4 h-4 text-purple accent-purple bg-gray-300 border-gray-300 rounded"/>
              <label className="ml-2 text-sm text-default">{t("config_giveaway_subonly_1")}<a className="text-purple font-bold">{t("config_giveaway_subonly_2")}</a>.</label>
            </div>
            <h1 className="text-dark-default text-2xl mt-4 font-extrabold select-none sm:text-[4vw]">{t("config_giveaway_bonus")}</h1>
            <div className="mt-3 flex flex-col">
              <h1 className="text-sm text-default sm:text-[3.3vw]">{t("config_giveaway_sub_multiplier_1")}<a className="text-purple font-bold">{t("config_giveaway_sub_multiplier_2")}</a>{t("config_giveaway_sub_multiplier_3")} {subMultiplier}x</h1>
              <input type="range" disabled={started} onChange={(event) => setSubMultiplier(event.target.value)} min="1" max="20" step="1" defaultValue="1" className="w-full mt-3 h-2 bg-gray-300 rounded-lg accent-purple appearance-none cursor-pointer"/>
            </div>
          </div>
        ) : null}
        { channel && keyword ? (
          <div className="mt-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" onClick={scrollToRoulette} fill="currentColor" className="w-[6vh] h-[6vh] drop-shadow-xl fill-current text-purple animate-bounce cursor-pointer" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
            </svg>
          </div>
        ) : null}
      </div>
      { started ? (
        <div id="roulette" className="relative bg-default w-screen h-[100vh] flex flex-col justify-center items-center scroll-smooth">
          <div className="text-white text-3xl font-bold select-none">{title} - twitch.tv/{channel}</div>
          { !finished ? (
            <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
              <div className="flex flex-row items-center xl:flex-col">
                <h1 className="text-dark-default text-2xl font-extrabold select-none align-middle sm:text-[4vw]">{t("active_keyword_1")}<a className="text-purple select-text">{keyword}</a>{t("active_keyword_2")}</h1>
                <h1 className="absolute right-7 font-extralight select-none text-gray-500 xl:relative xl:right-0">{participants.length} {t("active_entries_text")}</h1>
              </div>
            </div>
          ) : null
          }
          {
            finished === true ? (
              <Roulette participants={participants}/>
            ) : (
              <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
                <div className="flex flex-col">
                  <h1 className="text-dark-default text-2xl font-extrabold select-none align-middle sm:text-[4vw]">{t("active_entries_title")}</h1>
                  <h1 className="text-gray-500 text-sm mt-1 font-extralight select-none">{t("active_entries_newer")}</h1>
                  <div className="relative flex flex-col overflow-x-hidden overflow-y-scroll h-[20vh]">
                    {
                      participants.reverse().map((participant, i) => (

                        <div key={"plist-" + i} className="w-full mt-1 p-2 pl-3 bg-default text-white text-extralight rounded-tl-md rounded-bl-md">{participant.name} {participant.subscriber === true ? (<a className="text-purple text-extrabold text-sm ml-1 select-none">[SUBSCRIBER] [{participant.multiplier}x]</a>) : null}</div>

                      ))
                    }
                  </div>
                  
                  <div className="w-full flex flex-col justify-center items-center">

                    {
                      participants.length > 0 ? (
                        <>
                          <div onClick={() => {setFinished(true)}} className="border border-purple mt-3 w-[110px] h-[40px] rounded-xl flex flex-row justify-center items-center text-purple select-none hover:scale-105 transition-all ease-in-out duration-50">{t("active_entries_finish_button")}</div>
                          <h1 className="text-gray-500 text-sm mt-1 font-extralight select-none">{t("active_entries_finish_warning")}</h1>
                        </>
                      ) : null
                    }

                  </div>

                </div>

              </div>
            )
          }
          <div className="absolute bottom-[2%] text-white select-none">{t("footer_text_1")} ❤ {t("footer_text_2")} <a href="https://github.com/insannityxd/" className="text-purple hover:text-white hover:drop-shadow-xl">Insannity</a></div>
        </div>
      ) : null }
    </main>
  )
}
