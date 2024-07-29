export const toUsdcString = (
  amount: bigint,
  includeCommas: boolean = false
): string => {
  let amountString = amount.toString();
  // Pad with leading zeros if necessary
  amountString = amountString.padStart(7, "0");

  // Insert decimal point 6 places from the right
  const wholePart = amountString.slice(0, -6);
  let fractionalPart = amountString.slice(-6);

  // Trim trailing zeros from the fractional part
  fractionalPart = fractionalPart.replace(/0+$/, "");

  // If all digits were zeros, ensure at least one zero remains
  if (fractionalPart.length === 0) {
    fractionalPart = "0";
  }

  if (includeCommas) {
    const formattedWholePart = new Intl.NumberFormat().format(
      parseInt(wholePart, 10)
    );
    if (fractionalPart === "0") {
      return formattedWholePart;
    }

    let result = `${formattedWholePart}.${fractionalPart}`;
    result = result.replace(/^,/, "");

    return result;
  } else {
    let result = `${wholePart}.${fractionalPart}`;

    return parseFloat(result).toString();
  }
};
