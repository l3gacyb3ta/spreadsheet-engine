import { NodeInterface, CellValue, CellSum, Sheet, CellProd } from "./model"

const ident_to_coords = (identifier: string): [number, number] => {
    const letterRegex = /^[A-Z]+/;
    const numberRegex = /[0-9]+$/;

    const letterMatch = identifier.match(letterRegex);
    const numberMatch = identifier.match(numberRegex);

    if (!letterMatch || !numberMatch) {
        throw new Error("Invalid spreadsheet identifier");
    }

    const letters = letterMatch[0];
    const number = parseInt(numberMatch[0], 10);

    // Convert letters to a number representing the column index
    let columnIndex = 0;
    for (let i = 0; i < letters.length; i++) {
        columnIndex = columnIndex * 26 + (letters.charCodeAt(i) - 65);
    }

    // Subtract 1 from both column and row indices to get 0-based coordinates
    return [number - 1, columnIndex];
}

const ParseFormula = (raw: string, sheet: Sheet): NodeInterface => {
    let value = parseFloat(raw);
    if (!Number.isNaN(value))
        return new CellValue(value);

    if (raw.startsWith("SUM(")) {
        let raw_params: string[] = raw.replaceAll("SUM(", "").replaceAll(")", "").split(", ");
        let coords = raw_params.map((x) => { return ident_to_coords(x) });
        let cells = coords.map((x) => { return sheet.get_node(x[0], x[1]) }).filter((x) => { return x !== null }).map((x) => (x.id))

        let sum = new CellSum(cells);

        cells.map((x) =>  {
            sheet.graph.edges.push({
                source: sum.id,
                end: x
            })
        })

        return sum
    } else if (raw.startsWith("PROD(")) {
        let raw_params: string[] = raw.replaceAll("PROD(", "").replaceAll(")", "").split(", ");
        let coords = raw_params.map((x) => { return ident_to_coords(x) });
        let cells = coords.map((x) => { return sheet.get_node(x[0], x[1]) }).filter((x) => { return x !== null }).map((x) => (x.id))

        let sum = new CellProd(cells);

        cells.map((x) =>  {
            sheet.graph.edges.push({
                source: sum.id,
                end: x
            })
        })

        return sum
    }


    return new CellValue(-1.1)
}



export { ParseFormula, ident_to_coords };