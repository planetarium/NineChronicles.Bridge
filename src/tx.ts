export const MEAD_CURRENCY = {
    ticker: "Mead",
    decimalPlaces: 18,
    minters: null,
    totalSupplyTrackable: false,
    maximumSupply: null,
};

export const additionalGasTxProperties = {
    maxGasPrice: {
        currency: MEAD_CURRENCY,
        rawValue: 10n ** 13n,
    },
    gasLimit: 4n,
};

export const SUPER_FUTURE_DATETIME = new Date(2200, 12, 31, 23, 59, 59, 999);
