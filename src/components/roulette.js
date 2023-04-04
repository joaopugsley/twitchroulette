import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Roulette({ participants = [] }) {

    const { t } = useTranslation();

    const RouletteRef = useRef();

    const [rolling, setRolling] = useState(false);

    const [rouletteFill, setRouletteFill] = useState([]);

    const [roulettePosition, setRoulettePosition] = useState(0);
    
    const [rollDuration, setRollDuration] = useState(0);

    const [winner, setWinner] = useState(null);

    const roll = () => {

        console.log(participants);

        if(rolling) {
            return;
        }

        setRolling(true);

        let entries = [];

        participants.forEach(entry => {
            for(let x = 0; x < entry.multiplier; x++) {
                entries.push(entry);
            }
        })

        const Winner = entries[Math.floor(Math.random() * entries.length)];

        const rouletteSize = RouletteRef.current.clientWidth;
        const blockSize = 100;

        const displayItems = Math.ceil(rouletteSize/blockSize);

        const minDuration = 6000;
        const maxDuration = 15000;

        const minSlideDelay = 100;
        const maxSlideDelay = 300;

        const rollDuration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
        const slideDelay = Math.floor(Math.random() * (maxSlideDelay - minSlideDelay + 1)) + minSlideDelay;

        const rollFrames = parseInt(rollDuration/slideDelay);

        let fill = [];

        for(let x = 0; x < rollFrames + displayItems; x++) {

            if(x === (rollFrames + (displayItems/2) - 1)) {
                fill.push(Winner);
            } else {
                fill.push(participants[Math.floor(Math.random() * participants.length)]);
            }
            
        }

        setRouletteFill(fill);

        setRollDuration(rollDuration);

        setRoulettePosition((blockSize * rollFrames) - (blockSize * 0.4) + (Math.random() * blockSize * 0.8));

        setTimeout(() => {
            setWinner(Winner);
        }, rollDuration + 250);

    };

    return (
        <div className="w-2/5 mt-7 pt-3 pb-3 bg-white rounded-xl drop-shadow-xl flex flex-col justify-center items-center sm:w-11/12">
            <h1 className="font-extralight select-none text-gray-500 xl:relative xl:right-0">{participants.length} {t("active_entries_text")}</h1>
            {
                rolling ? (
                    <div className="absolute top-3 mt-8 bg-purple w-[10px] h-[10px] z-50 rotate-45"></div>
                ) : null
            }
            <div ref={RouletteRef} className="mt-3 flex flex-row overflow-hidden h-[100px] w-11/12 z-40" style={{height: `${rolling ? "100px" : "0px"}`}}>
                <div id="roulette__container" className="relative h-full min-w-fit flex flex-row" style={{transform: `translateX(-${roulettePosition}px)`, transition: `cubic-bezier(0.25, 0.46, 0.45, 1.0) ${rollDuration}ms`}}>

                    {
                        rouletteFill.map((participant, i) => (

                            <div key={"proulette-" + i} className="w-[100px] h-[100px] bg-white border-[1px] border-r-0 border-solid border-purple flex flex-col justify-center items-center overflow-hidden">
                                <h1 className="text-purple text-extrabold text-[0.6vw] sm:text-[3vw]">{participant.name}</h1>
                                <h1 className="text-white text-extralight text-sm select-none bg-purple mt-[5px] pt-[1px] pb-[1px] pl-[5px] pr-[5px]">{`${participant.multiplier || 1}x`}</h1>
                            </div>

                        ))
                    }

                </div>

            </div>
            
            {
                winner ? (
                    <div className="w-full flex flex-col justify-center items-center">
                        <h1 className="text-gray-500 text-sm mt-3 font-extralight select-none">{t("roulette_winner")} <a className="hover:text-purple select-text">{winner.name}</a></h1>
                    </div>
                ) : null
            }

            {
                !rolling && !winner ? (
                    <div onClick={() => {roll()}} className="border border-purple mt-3 pl-[20px] pr-[20px] h-[40px] rounded-xl flex flex-row justify-center items-center text-purple select-none hover:scale-105 transition-all ease-in-out duration-50">{t("roulette_draw_button")}</div>
                ) : null
            }

        </div>
    )
}