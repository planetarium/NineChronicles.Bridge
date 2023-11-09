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
        rawValue: 10n ** 18n,
    },
    gasLimit: 4n,
};
