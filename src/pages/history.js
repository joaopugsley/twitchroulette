import Image from 'next/image';
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import { useTranslation } from "react-i18next";

export default function History() {

    const router = useRouter()

    const { t, i18n: {changeLanguage, language} } = useTranslation();
    const [lang, setLang] = useState(language);

    useEffect(() => {

        if (lang !== language) {

            changeLanguage(lang);
            localStorage.setItem("preferredLanguage", lang);

        }

    }, [lang, changeLanguage, language]);

    useEffect(() => {

        const userLang = localStorage.getItem("preferredLanguage");
    
        if(userLang) {
            changeLanguage(userLang);
        }
    
    }, []);

    const [history, setHistory] = useState([]);

    useEffect(() => {

        let giveawayHistory = localStorage.getItem("giveawayHistory");

        if(giveawayHistory) {

            giveawayHistory = JSON.parse(giveawayHistory);

            setHistory(giveawayHistory);

        }

    }, []);

    const deleteFromHistory = event => {

        const raffleId = event.currentTarget.getAttribute("data-giveaway-id");

        let giveawayHistory = localStorage.getItem("giveawayHistory");

        if(giveawayHistory) {

            giveawayHistory = JSON.parse(giveawayHistory);

            delete giveawayHistory[raffleId];

            setHistory(giveawayHistory);

            giveawayHistory = JSON.stringify(giveawayHistory);

            localStorage.setItem("giveawayHistory", giveawayHistory);

        }

    }

    const localStorageAvailable = () => {
        if(localStorage) {
            return true;
        }
        return false;
    };

    useEffect(() => {

        if(!localStorageAvailable()) {
            router.push("/");
        }

    }, []);

    return (
        <main>
            <title>{t("history_page_title")}</title>
            <div onClick={() => router.push("/")} className="fixed left-3 top-2 flex flex-row px-[10px] py-[5px] bg-white select-none z-50 rounded-md drop-shadow-sm hover:scale-110 hover:cursor-pointer">
                <Image alt="Back to homepage" width={18} height={18} src="./images/arrow-left.svg" className="w-auto"/>
                <span className="ml-1 font-extrabold text-purple">{t("history_back")}</span>
            </div>
            <div className="fixed right-2 top-2 flex flex-row w-auto select-none z-50">
                <Image alt="Português Brasileiro (pt-BR)" onClick={() => { setLang("pt") }} width={40} height={28} className="w-[40px] ml-[10px] h-auto hover:cursor-pointer hover:scale-110" src="/images/brazil.png" />
                <Image alt="English (en-US)" onClick={() => { setLang("en") }} width={40} height={28} className="w-[40px] ml-[10px] h-auto hover:cursor-pointer hover:scale-110" src="/images/usa.png" />
                <Image alt="Español (es-ES)" onClick={() => { setLang("es") }} width={40} height={28} className="w-[40px] ml-[10px] h-auto hover:cursor-pointer hover:scale-110" src="/images/spain.png" />
            </div>
            <div className="absolute bg-purple w-full h-full flex flex-col justify-center items-center">     
                {
                    history && Object.values(history).length > 0 ? (
                        <div className="bg-white max-h-[540px] pt-5 pb-5 pl-7 pr-7 mt-7 rounded-xl drop-shadow-xl flex flex-col justify-center w-2/5 sm:w-4/5">
                            <h1 className="text-default font-extrabold select-none">{t("history_list_title")}</h1>
                            <div className="mt-2 w-full h-full overflow-x-hidden overflow-y-scroll no-scrollbar">
                                {
                                    Object.values(history).reverse().map((giveaway, i) => (
                                        <div key={giveaway.id} className="relative mb-2 bg-default w-full h-24 rounded-md flex flex-col justify-center items-center">
                                            <div data-giveaway-id={giveaway.id} onClick={deleteFromHistory} className="absolute right-3 top-3 select-none hover:cursor-pointer hover:scale-110"><Image alt="Delete from History" src="./images/trash.svg" width={20} height={20}/></div>
                                            <div className="absolute right-2 bottom-2"><span className="text-white font-extralight">{giveaway.date}</span></div>
                                            <div className="absolute left-3 top-2"><span className="text-white font-extrabold">{giveaway.title}</span></div>
                                            <div className="text-white"><span className="font-extrabold">{t("history_giveaway_winner")}</span> <span className="font-extralight">{giveaway.winner.name}</span></div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center items-center">
                            <h3 className="text-white font-extrabold text-[10vh]">:(</h3>
                            <h1 className="text-white font-extrabold text-[3vh]">{t("history_empty_title")}</h1>
                            <h2 className="text-white font-extralight text-[2vh]">{t("history_empty_description")}</h2>
                            <div onClick={() => router.push("/")} className="border border-white mt-3 pl-[20px] pr-[20px] h-[40px] rounded-xl flex flex-row justify-center items-center text-white select-none hover:scale-105 hover:bg-white hover:text-purple transition-all ease-in-out duration-50">{t("history_homepage_button")}</div>
                        </div>
                    )
                }
            </div>
        </main>
    )

}