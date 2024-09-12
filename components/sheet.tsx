'use client';
import { CellValue, Sheet } from "@/lib/model";
import { ParseFormula } from "@/lib/parse";
import { useState } from "react";
import { createRoot } from 'react-dom/client';
import { styleText } from "util";

const SheetComponent = ({ sheet }: { sheet: Sheet }) => {
    const item_clicked = (x: number, y: number) => {
        return (e: React.MouseEvent<HTMLInputElement>) => {
            let element = document.getElementById(`sheet-${x}-${y}`);
            let node = sheet.get_node(x, y);
            let formula = (node) ? node.renderToFormula(sheet) : "";

            let input = <input autoFocus className="w-8" onKeyUp={(e) => {
                if (!(e.target instanceof HTMLInputElement)) {
                    throw new Error("unreachable")
                }

                if (e.key == "Enter") {
                    // let value = parseFloat();

                    sheet.add_node(x, y, ParseFormula(e.target.value ?? "0", sheet));
                    setTable(sheet.render());
                }
            }} defaultValue={formula} />

            if (element) {
                if (element.firstChild) {
                    // element.removeChild(element.firstChild);
                }
                createRoot(element).render(input);
            }
        }
    }

    let [table, setTable] = useState<([number, number] | null)[][]>(sheet.render());

    return <div className="table w-full shadow rounded-lg">
        {table.map((row, y, rowarr) => {
            return <div key={`${y}-row`} className="table-row">{
                row.map((item, x, arr) => {
                    let top_left = x == 0 && y == 0 ? "rounded-tl-lg" : "";
                    let top_right = (x + 1) == arr.length && y == 0 ? "rounded-tr-lg" : "";
                    let bottom_left = x == 0 && (y + 1) == rowarr.length ? "rounded-bl-lg" : "";
                    let bottom_right = (x + 1) == arr.length && (y + 1) == rowarr.length ? "rounded-br-lg" : "";

                    let every_other = y % 2 == 1 ? "bg-slate-200" : "bg-white";

                    let extra_classes = `${top_left}${top_right}${bottom_left}${bottom_right} ${every_other}`

                    return <div key={`${y}-${x}`} id={`sheet-${x}-${y}`} onMouseOver={() => {
                        if (item) {
                            const parents = sheet.getParents(item[1]);
                            console.log(sheet.graph.edges)
                            for (let idx in parents) {
                                let [px, py] = parents[idx];
                                let element = document.getElementById(`sheet-${px}-${py}`);
                                if (element) {
                                    element.className += " border-red-300 border-2"
                                }
                            }

                            const dependants = sheet.getDependants(item[1]);
                            console.log(sheet.graph.edges)
                            for (let idx in dependants) {
                                let [px, py] = dependants[idx];
                                let element = document.getElementById(`sheet-${px}-${py}`);
                                if (element)
                                    element.className += " border-green-300 border-2"
                            }
                        }
                    }} 
                    onMouseLeave={() => {
                        if (item) {
                            const parents = sheet.getParents(item[1]);
                            for (let idx in parents) {
                                let [px, py] = parents[idx];
                                let element = document.getElementById(`sheet-${px}-${py}`);
                                if (element)
                                    element.className = element.className.replaceAll("border-red-300 border-2", "")
                            }

                            const dependants = sheet.getDependants(item[1]);
                            console.log(sheet.graph.edges)
                            for (let idx in dependants) {
                                let [px, py] = dependants[idx];
                                let element = document.getElementById(`sheet-${px}-${py}`);
                                if (element)
                                    element.className = element.className.replaceAll("border-green-300 border-2", "")
                            }
                        }
                    }}
                    className={`table-cell border border-slate-300 font-mono p-1 w-16 ${extra_classes}`} onClick={item_clicked(x, y)}>
                        {item ? item[0] : ""}
                    </div>
                })
            }</div>
        })}
    </div>
}

export default SheetComponent;