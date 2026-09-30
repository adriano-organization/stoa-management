import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const pedido = await requestLocale;
  /* Uma língua desconhecida no URL cai na língua por omissão em vez de
     rebentar — o `proxy.ts` já filtra a esmagadora maioria destes casos. */
  const locale = hasLocale(routing.locales, pedido) ? pedido : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    /* Datas e números no formato suíço, sem depender do fuso do servidor. */
    timeZone: "Europe/Zurich",
  };
});
