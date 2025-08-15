"use client";

import { StatusBadge } from "./StatusBadge";

export interface Signer {
  id: number;
  name: string;
  address: string;
  status: "succeed" | "failed" | "waiting";
}

export function SignersTable({ signers }: { signers: Signer[] }) {
  const cellClasses = "p-1 text-center bg-stone-900 border border-zinc-800 text-white";
  const textClasses = "text-sm tracking-tight leading-4 max-sm:text-xs";

  return (
    <section className="flex flex-col gap-2 items-start self-stretch">
      <h2 className="text-base tracking-tighter leading-5 text-white max-sm:text-sm">
        Signers confirmed ({signers.length})
      </h2>

      <div className="w-[550px] rounded-lg border border-zinc-800 overflow-hidden max-md:overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {signers.map(signer => (
              <tr key={signer.id} className="max-md:min-w-[400px]">
                <td className={`${cellClasses}  text-center font-medium`}>
                  <span className={textClasses}>{signer.id}</span>
                </td>

                <td className={`${cellClasses} max-sm:w-25`}>
                  <span className={textClasses}>{signer.name}</span>
                </td>

                <td className={`${cellClasses} min-w-0`}>
                  <span className={`${textClasses} block truncate`}>{signer.address}</span>
                </td>

                <td className={`${cellClasses} text-center`}>
                  {/* <StatusBadge status={signer.status as RequestPaymentStatus} text={signer.status} /> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
