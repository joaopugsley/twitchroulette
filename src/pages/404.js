import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import { useTranslation } from "react-i18next";

export default function Custom404() {

    const router = useRouter()

    const { t, i18n: {changeLanguage} } = useTranslation();

    useEffect(() => {

        const userLang = localStorage.getItem("preferredLanguage");
    
        if(userLang) {
          changeLanguage(userLang);
        }
    
    }, []);

    return (
        <main>
            <title>404 - TwitchRoulette</title>
            <div className="absolute bg-purple w-full h-full flex flex-col justify-center items-center">
                <h1 className="text-white text-extrabold text-[10vh] select-none">404</h1>
                <h1 className="text-white text-extralight text-[3vh] select-none">{t("404_error_title")}</h1>
                <h1 className="text-gray-300 text-extralight text-[2vh] select-none hover:text-white sm:text-[3vw]">{t("404_error_description")}</h1>
                <div onClick={() => router.push("/")} className="border border-white mt-3 pl-[20px] pr-[20px] h-[40px] rounded-xl flex flex-row justify-center items-center text-white select-none hover:scale-105 hover:bg-white hover:text-purple transition-all ease-in-out duration-50">{t("404_homepage_button")}</div>
            </div>
        </main>
    )

}