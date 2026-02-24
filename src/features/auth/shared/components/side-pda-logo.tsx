import Stack from "@/components/Stack";
import Image from "next/image";

const CARDS = [
    { id: 1, img: "/auth/pda-students.jpg", description: "Card 1" },
    { id: 2, img: "/auth/pda-students-2.webp", description: "Card 2" },
    { id: 3, img: "/auth/pda-students-3.webp", description: "Card 3" },
    { id: 4, img: "/auth/pda-students-4.webp", description: "Card 4" },
];

export const SidePdaLogo = () => {
    return (
        <div className="hidden md:flex flex-col w-full h-full">
            <div className="relative flex justify-center items-center bg-primary/50 rounded-xl w-full h-full overflow-clip text-primary-foreground bg-linear-1200 from-[#edcd4d] to-[#421864]">
                <div className="size-[60%] z-50 absolute top-0 left-0 right-0 bottom-0 m-auto">
                    <Stack
                        randomRotation={true}
                        sensitivity={200}
                        mobileBreakpoint={768}
                        cards={CARDS.map((card) => (
                            <figure
                                key={`card-${card.id}`}
                                className="relative w-full h-full flex flex-col rounded-lg overflow-hidden bg-red-50"
                            >
                                <Image
                                    src={card.img}
                                    alt={card.description}
                                    width={400}
                                    height={400}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <p className="text-base text-center text-foreground absolute bottom-0 bg-background/50 w-full p-2 flex items-center justify-center">
                                    {card.description}
                                </p>
                            </figure>
                        ))}
                        autoplay={true}
                        autoplayDelay={3000}
                        pauseOnHover={false}
                    />
                </div>
            </div>
        </div>
    );
};
