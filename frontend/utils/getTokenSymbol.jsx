const getTokenSymbol = (clubId) => {
    const symbols = {
        1: "SPFC",
        2: "MENGO",
        3: "VASCO",
        4: "VERDAO",
        5: "SACI",
        6: "FLU",
        7: "SCCP",
    };
    return symbols[clubId] || "TOKEN";
};
export default getTokenSymbol;