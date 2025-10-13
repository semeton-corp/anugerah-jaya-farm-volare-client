export const formatRupiah = (number) => {
  const numeric = Number(number);
  if (isNaN(numeric)) return "0";
  return new Intl.NumberFormat("id-ID").format(numeric);
};

export const onlyDigits = (s) => {
  if (s === null || s === undefined) return "";
  let cleaned = String(s).replace(/[^0-9.,]/g, "");

  cleaned = cleaned.replace(/\./g, "").replace(",", ".");

  cleaned = cleaned.replace(/(\..*)\./g, "$1");

  return cleaned;
};

export const formatThousand = (s) => {
  if (!s) return "";
  const str = String(s).replace(",", ".");
  const [intPart, decPart] = str.split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
};
