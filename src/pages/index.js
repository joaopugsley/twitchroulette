import Image from 'next/image';
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from 'next/router'
import { scroller } from "react-scroll";
import Roulette from "@/components/roulette";
import { useTranslation } from "react-i18next";

export default function Home() {

    const router = useRouter()

    // APP WORKING
    const [started, setStarted] = useState(false);  
    const [finished, setFinished] = useState(false);

    // LANGUAGES
    const { t, i18n: { changeLanguage, language } } = useTranslation();
    const [lang, setLang] = useState(language);

    useEffect(() => {

        if (lang !== language) {

            changeLanguage(lang);
            localStorage.setItem("preferredLanguage", lang);

        }

    }, [lang, changeLanguage, language]);

    useEffect(() => {

        const userLang = localStorage.getItem("preferredLanguage");

        if (userLang) {
            setLang(userLang);
        }

    }, []);

    // LOCAL STORAGE
    const [localStorageAvailable, setLocalStorageAvailable] = useState(false);

    const testLocalStorage = () => {
        if(localStorage) {
            return true;
        }
        return false;
    };

    useEffect(() => {

        if(testLocalStorage() === true) {
            setLocalStorageAvailable(true);
        }

    }, []);

    // CHANNEL
    const [channelInput, setChannelInput] = useState("");

    const handleInputChange = (channelLink) => {
        if (channelLink !== channelInput) {
            setChannelInput(channelLink);
            localStorage.setItem("lastChannel", channelLink);
        }
        formatChannel(channelLink);
    }

    const [channel, setChannel] = useState(null);

    const formatChannel = (channelLink) => {
        channelLink = channelLink.toString().toLowerCase();
        if (channelLink.includes("twitch.tv/")) {
            const channelData = channelLink.split("twitch.tv/");
            if (channelData.length < 0) return;
            const channelName = channelData[1];
            const invalid = ["@", "!", "#", "$", "%", "¨", "&", "*", "(", ")", "-", "+", "=", ".", ",", ":", "/", "?", "]", "[", "^", "~", "|"];
            const isInvalid = invalid.some(char => channelName.includes(char));
            if (isInvalid == true) return;
            setChannel(channelName);
        }
    }

    useEffect(() => {
        const lastChannel = localStorage.getItem("lastChannel") || "";
        setChannelInput(lastChannel);
        formatChannel(lastChannel);
    }, [channelInput]);

    // TITLE
    const [title, setTitle] = useState(language == "en" ? "New Giveaway!" : "Novo Sorteio!");

    // KEYWORD
    const [keyword, setKeyword] = useState(null);

    // SUBONLY
    const [subOnly, setSubOnly] = useState(false);

    // MULTIPLE ENTRIES
    const [multipleEntries, setMultipleEntries] = useState(false);

    // SUB MULTIPLIER
    const [subMultiplier, setSubMultiplier] = useState(1);

    // ADVANCED OPTIONS DROPDOWN
    const [advancedDropdownOpened, setAdvancedDropdownOpened] = useState(false);

    const toggleAdvancedDropdown = () => {
        setAdvancedDropdownOpened(!advancedDropdownOpened);
    }

    // MIN ROULETTE DURATION
    const [minRouletteDuration, setMinRouletteDuration] = useState(10000);

    const handleMinRouletteDuration = (duration) => {
        if(isNaN(duration)) duration = 10000;
        setMinRouletteDuration(duration);
    }

    // MAX ROULETTE DURATION
    const [maxRouletteDuration, setMaxRouletteDuration] = useState(16000);

    const handleMaxRouletteDuration = (duration) => {
        if(isNaN(duration)) duration = 16000;
        setMaxRouletteDuration(duration);
    }

    // BLOCKED USERS
    const [blocked, setBlocked] = useState(["Nightbot", "StreamElements"]);
    const blockedInputRef = useRef(null);

    const removeBlockedUser = event => {
        if(started === true) return;
        const user = event.currentTarget.getAttribute("data-user");
        setBlocked(oldArray => {
            const newArray = [...oldArray];
            newArray.splice(user, 1);
            return newArray;
        })
    }

    const addBlockedUser = () => {
        if(started === true) return;
        const user = blockedInputRef.current.value;
        if(user === "" || user.includes(" ")) return;
        blockedInputRef.current.value = "";
        setBlocked(oldArray => [...oldArray, user]);
    }

    // PARTICIPANTS
    const [participants, setParticipants] = useState([]);

    const formatParticipant = (user, isSubscriber, multipleEntries) => {

        if (started !== true || finished === true) return false; // giveaway not open

        if (!isSubscriber && subOnly === true) return false; // sub only

        const multiplier = isSubscriber === true ? parseInt(subMultiplier) : 1;

        const registered = participants.some(p => p.name == user);

        if (registered === true && multipleEntries !== true) return false; // already joined && multiple entries is off

        setParticipants(oldArray => [...oldArray, { name: user, multiplier: multiplier, subscriber: isSubscriber }]);

    }

    // WEBSOCKETS
    const [ws, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

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

    useEffect(() => {

        if (started === true && connected === false) {
            setConnected(true);
            connect(channel);
        }

    }, [started, connected, channel])

    useEffect(() => {

        if (ws) {

            ws.onmessage = (event) => {
                if (!event.data.includes("PRIVMSG")) return;

                const message = event.data.split(";");

                const author = message.find(msg => msg.startsWith("display-name")).split("=")[1];
                const text = message.find(msg => msg.includes(`PRIVMSG #${channel}`)).split(`PRIVMSG #${channel} :`)[1];
                const isSubscriber = message.find(msg => msg.startsWith("subscriber=")).split("subscriber=")[1] == "1";
                const isBlocked = blocked.some(user => user.toLowerCase() === author.toLowerCase());

                if (keyword && text.toLowerCase().includes(keyword.toLowerCase()) && !isBlocked) {
                    formatParticipant(author, isSubscriber, multipleEntries);
                }
            };

        }

    }, [ws, connected, started, finished, participants, channel, keyword, multipleEntries, blocked]);

    // SCROLL FUNCTIONS
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
            {
                localStorageAvailable ? (
                    <div onClick={() => router.push("/history")} className="fixed left-3 top-2 flex flex-row px-[10px] py-[5px] bg-white select-none z-50 rounded-md drop-shadow-sm hover:scale-110 hover:cursor-pointer">
                        <Image alt="History" className="w-auto" width={18} height={18} src="./images/history.svg"/>
                        <span className="ml-1 font-extrabold text-purple">{t("button_history")}</span>
                    </div>
                ) : null
            }
            <div className="fixed right-2 top-2 flex flex-row w-auto select-none z-50">
                <Image alt="Português Brasileiro (pt-BR)" onClick={() => { setLang("pt") }} width={40} height={28} className="w-[40px] ml-[10px] h-auto hover:cursor-pointer hover:scale-110" src="/images/brazil.png" />
                <Image alt="English (en-US)" onClick={() => { setLang("en") }} width={40} height={28} className="w-[40px] ml-[10px] h-auto hover:cursor-pointer hover:scale-110" src="/images/usa.png" />
                <Image alt="Español (es-ES)" onClick={() => { setLang("es") }} width={40} height={28} className="w-[40px] ml-[10px] h-auto hover:cursor-pointer hover:scale-110" src="/images/spain.png" />
            </div>
            <div className="bg-purple w-screen h-screen flex justify-center items-center scroll-smooth">
                <div className="p-10 flex flex-col justify-center items-center">
                    <h1 className="text-4xl font-extrabold text-white text-center">TwitchRoulette!</h1>
                    <h2 className="text-1xl mt-1 font-extralight text-gray-300 text-center select-none hover:text-white transition-all sm:text-[2.8vw]">{t("homescreen_slogan_1")}<span className="font-extrabold">stream</span>{t("homescreen_slogan_2")}</h2>
                    <div onClick={scrollToStart} className="border border-white mt-3 pl-[20px] pr-[20px] h-[40px] rounded-xl flex flex-row justify-center items-center text-white select-none hover:scale-105 hover:bg-white hover:text-purple transition-all ease-in-out duration-50">{t("homescreen_start_button")}</div>
                </div>
            </div>
            <div id="start" className="relative bg-gray-100 w-screen min-h-[100vh] pt-[10vh] pb-[10vh] flex flex-col justify-center items-center scroll-smooth">
                <div className="text-default text-3xl font-bold select-none break-all sm:text-xl">{t("config_title")}</div>
                <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
                    <h3 className="text-dark-default text-2xl font-extrabold select-none sm:text-[3.5vw]">{t("config_channellink")}<a href="https://twitch.tv/" target="_blank" className="text-purple hover:cursor-pointer">Twitch</a></h3>
                    <input type="text" disabled={started} value={channelInput} onChange={event => handleInputChange(event.target.value)} id="channel" className="bg-gray-100 mt-2 p-2 rounded-md border text-default border-gray-300 focus:outline-purple w-full" placeholder="URL" />
                </div>
                {channel ? (
                    <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
                        <h3 className="text-dark-default text-2xl font-extrabold select-none sm:text-[4vw]">{t("config_giveaway_title")}</h3>
                        <input type="text" disabled={started} onChange={event => setTitle(event.target.value)} className="bg-gray-100 mt-2 p-2 rounded-md border text-default border-gray-300 focus:outline-purple w-full" placeholder={t("config_giveaway_title")} defaultValue={t("config_giveaway_title_default")} />
                    </div>
                ) : null}
                {channel ? (
                    <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
                        <h3 className="text-dark-default text-2xl font-extrabold select-none sm:text-[4vw]">{t("config_giveaway_keyword")}</h3>
                        <input type="text" disabled={started} onChange={event => setKeyword(event.target.value)} className="bg-gray-100 mt-2 p-2 rounded-md border text-default border-gray-300 focus:outline-purple w-full" placeholder={t("config_giveaway_keyword_placeholder")} />
                        <span className="text-gray-500 text-sm italic mt-1 font-extralight select-none">{t("config_giveaway_keyword_description")}</span>
                    </div>
                ) : null}
                {channel ? (
                    <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
                        <h3 className="text-dark-default text-2xl font-extrabold select-none sm:text-[4vw]">{t("config_giveaway_participation")}</h3>
                        <div className="mt-3 flex flex-row items-center">
                            <input type="checkbox" disabled={started} value="" onChange={(event) => setSubOnly(event.target.checked)} className="w-4 h-4 text-purple accent-purple bg-gray-300 border-gray-300 rounded" />
                            <label className="ml-2 text-sm text-default">{t("config_giveaway_subonly_1")}<a className="text-purple font-bold">{t("config_giveaway_subonly_2")}</a>.</label>
                        </div>
                        <div className="mt-3 flex flex-row items-center">
                            <input type="checkbox" disabled={started} value="" onChange={(event) => setMultipleEntries(event.target.checked)} className="w-4 h-4 text-purple accent-purple bg-gray-300 border-gray-300 rounded" />
                            <label className="ml-2 text-sm text-default">{t("config_giveaway_multiple_entries")}.</label>
                        </div>
                        <h3 className="text-dark-default text-2xl mt-4 font-extrabold select-none sm:text-[4vw]">{t("config_giveaway_bonus")}</h3>
                        <div className="mt-3 flex flex-col">
                            <p className="text-sm text-default sm:text-[3.3vw]">{t("config_giveaway_sub_multiplier_1")}<a className="text-purple font-bold">{t("config_giveaway_sub_multiplier_2")}</a>{t("config_giveaway_sub_multiplier_3")} {subMultiplier}x</p>
                            <input type="range" disabled={started} onChange={(event) => setSubMultiplier(event.target.value)} min="1" max="20" step="1" defaultValue="1" className="w-full mt-3 h-2 bg-gray-300 rounded-lg accent-purple appearance-none hover:cursor-pointer" />
                        </div>
                        <div className="mt-6 flex flex-col justify-center">
                            <div onClick={() => { toggleAdvancedDropdown() }} className="flex flex-row items-center bg-purple px-2 py-2 w-fit rounded-md"><span className="text-sm text-white select-none underline underline-offset-2 hover:cursor-pointer">{t("advanced_options")}</span><Image alt="Advanced" src={advancedDropdownOpened === false ? "./images/arrow-up.svg" : "./images/arrow-down.svg"} width={15} height={15} className="ml-1 select-none"/></div>
                            {
                                advancedDropdownOpened ? (
                                    <div className="ml-1 flex flex-col">
                                        <div className="mt-2 flex flex-col justify-center">
                                            <p className="text-sm text-default sm:text-[3.3vw] mt-2">{t("config_min_roulette_duration")} (ms)</p>
                                            <input type="text" disabled={started} value={minRouletteDuration} onChange={event => handleMinRouletteDuration(event.target.value)} className="bg-gray-100 mt-1 p-2 rounded-md border text-default border-gray-300 focus:outline-purple w-[130px]" placeholder="10000 - 60000"/>
                                            <p className="text-sm text-default sm:text-[3.3vw] mt-2">{t("config_max_roulette_duration")} (ms)</p>
                                            <input type="text" disabled={started} value={maxRouletteDuration} onChange={event => handleMaxRouletteDuration(event.target.value)} className="bg-gray-100 mt-1 p-2 rounded-md border text-default border-gray-300 focus:outline-purple w-[130px]" placeholder="10000 - 60000"/>
                                        </div>
                                        <div className="mt-2 flex flex-col">
                                            <span className="text-sm text-default sm:text-[3.3vw] mt-2">{t("config_blocked_users")}</span>
                                            <div className="relative mt-1 flex flex-col py-[10px] px-[10px] min-h-[30px] min-w-[150px] max-w-full bg-gray-100 rounded-md border border-gray-300">
                                                <div className="flex flex-row">
                                                    <input ref={blockedInputRef} type="text" disabled={started} className="bg-gray-100 p-2 rounded-md border text-sm border-gray-300 focus:outline-purple w-[90px] h-[30px]" placeholder="Username"/>
                                                    <div onClick={addBlockedUser} className="ml-1 w-[30px] h-[30px] bg-purple rounded-md text-white flex justify-center items-center select-none text-[25px]">+</div>
                                                </div>
                                                <div className="mt-1 flex flex-col">
                                                    {
                                                        blocked.map((user, i) => (
                                                            <div className="mt-1 flex flex-row" key={"blockedList-" + i}>
                                                                <div className="px-[10px] h-[30px] bg-purple rounded-md text-white flex justify-center items-center text-sm">{user}</div>
                                                                <div data-user={i} onClick={removeBlockedUser} className="ml-1 w-[30px] h-[30px] bg-purple rounded-md text-white flex justify-center items-center select-none"><Image alt="Remove Blocked User" src="./images/remove.svg" className="select-none" width={10} height={10}/></div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            <span className="text-gray-500 text-sm italic mt-1 font-extralight select-none">{t("config_blocked_users_warning")}</span>
                                        </div>
                                    </div>
                                ) : null
                            }
                        </div>
                    </div>
                ) : null}
                {channel && keyword ? (
                    <div className="mt-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" onClick={scrollToRoulette} fill="currentColor" className="w-[6vh] h-[6vh] drop-shadow-xl fill-current text-purple animate-bounce hover:cursor-pointer" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z" />
                        </svg>
                    </div>
                ) : null}
            </div>
            {started ? (
                <div id="roulette" className="relative bg-default w-screen h-[100vh] flex flex-col justify-center items-center scroll-smooth">
                    <div className="text-white text-3xl font-bold select-none break-all sm:text-xl">{title} - twitch.tv/{channel}</div>
                    {!finished ? (
                        <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
                            <div className="flex flex-row items-center xl:flex-col">
                                <h3 className="text-dark-default text-2xl font-extrabold select-none align-middle sm:text-[4vw]">{t("active_keyword_1")}<a className="text-purple select-text">{keyword}</a>{t("active_keyword_2")}</h3>
                                <span className="absolute right-7 font-extralight select-none text-gray-500 xl:relative xl:right-0">{participants.length} {t("active_entries_text")}</span>
                            </div>
                        </div>
                    ) : null
                    }
                    {
                        finished === true ? (
                            <Roulette participants={participants} minRollDuration={minRouletteDuration} maxRollDuration={maxRouletteDuration} giveawayTitle={title}/>
                        ) : (
                            <div className="bg-white pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
                                <div className="flex flex-col">
                                    
                                    <h3 className="text-dark-default text-2xl font-extrabold select-none align-middle sm:text-[4vw]">{t("active_entries_title")}</h3>
                                    <span className="text-gray-500 text-sm mt-1 font-extralight select-none">{t("active_entries_newer")}</span>
                                    <div className="relative flex flex-col overflow-x-hidden overflow-y-scroll h-[20vh]">
                                        {
                                            participants.reverse().map((participant, i) => (

                                                <div key={"participantList-" + i} className="w-full mt-1 p-2 pl-3 bg-default text-white text-extralight rounded-tl-md rounded-bl-md">{participant.name} {participant.subscriber === true ? (<a className="text-purple text-extrabold text-sm ml-1 select-none">[SUBSCRIBER] [{participant.multiplier}x]</a>) : null}</div>

                                            ))
                                        }
                                    </div>

                                    <div className="w-full flex flex-col justify-center items-center">

                                        {
                                            participants.length > 0 ? (
                                                <>
                                                    <div onClick={() => { setFinished(true) }} className="border border-purple mt-3 w-[110px] h-[40px] rounded-xl flex flex-row justify-center items-center text-purple select-none hover:scale-105 transition-all ease-in-out duration-50">{t("active_entries_finish_button")}</div>
                                                    <span className="text-gray-500 text-sm mt-1 font-extralight select-none">{t("active_entries_finish_warning")}</span>
                                                </>
                                            ) : null
                                        }

                                    </div>

                                </div>

                            </div>
                        )
                    }
                    <div className="absolute bottom-[2%] text-white select-none">{t("footer_text_1")} ❤ {t("footer_text_2")} <a href="https://github.com/joaopugsley/" className="text-purple hover:text-white hover:drop-shadow-xl">Insannity</a></div>
                </div>
            ) : null}
        </main>
    )
}
