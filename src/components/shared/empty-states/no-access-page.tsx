import Image from "next/image";
import logo_symbol from "/public/assets/images/empty/no-access.png";

const NoAccessPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Image
        src={logo_symbol}
        alt="Programadores do Amanhã. Logo"
        width={500}
        height={500}
        className=""
      />
      <p className="text-xl font-black text-center">
        A página que você está tentando acessar não está disponível para você.
        <br /> Se você acredita que isso é um erro, entre em contato com a
        <mark className="ml-2 bg-primary rounded-lg px-2 py-0.5">@Karlla</mark>
      </p>
    </div>
  );
};
export default NoAccessPage;
