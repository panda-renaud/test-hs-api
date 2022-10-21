
// @params
// @data <string>
// @start <object>
function generateMaskedData({ data, start, reversEndSymbols, mask }) {
    return data.substring(start.from, start.to) + mask + data.substring(data.length - reversEndSymbols);
}

module.exports = {
    generateMaskedData,
};