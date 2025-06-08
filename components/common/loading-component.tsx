import Image from "next/image";
import logo_symbol from "/public/assets/logos/simbolo_pda_fundo_branco.png";

const LoadingComponent = ({ label }: { label?: string }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center justify-center rounded-md text-primary-foreground gap-8">
          <Image
            src={logo_symbol}
            alt="Programadores do Amanhã. Logo"
            width={200}
            height={200}
            className="animate-spin"
          />
          {label && <h1 className="font-bold text-xl">{label}</h1>}
        </div>
      </div>
    </div>
  );
};
export default LoadingComponent;
