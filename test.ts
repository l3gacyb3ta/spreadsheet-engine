import { Sheet } from "./lib/model";
import { ident_to_coords, ParseFormula } from "./lib/parse";

console.log(ParseFormula("SUM(A10, B2, B3)", new Sheet(5, 5)))
console.log(ident_to_coords("A10"))
