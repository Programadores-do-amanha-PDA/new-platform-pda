"use client";
import Image from "next/image";

const  NO_ACCESS_IMAGE_PATH = "/assets/images/empty/no-access.png";

const NoAccessPage = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-6 p-6 md:p-10 w-full h-full">
      <Image
        src={NO_ACCESS_IMAGE_PATH}
        alt="Programadores do Amanhã. Logo"
        width={500}
        height={500}
        className=""
      />
      <p className="font-black text-xl text-center">
        A página que você está tentando acessar não está disponível para você.
      </p>
    </div>
  );
};
export default NoAccessPage;
