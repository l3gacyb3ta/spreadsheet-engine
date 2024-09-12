import { ReactElement } from "react";

let id_base = 0

interface NodeInterface {
    id: number;
    dependencies: number[] | null;
    getValue(visited: number[], graph: Graph): number;
    renderToFormula(sheet: Sheet): string;
}

class CellValue implements NodeInterface {
    id: number;
    dependencies: null;

    value: number;

    constructor(value: number) {
        id_base += 1;
        this.id = id_base;
        this.dependencies = null;
        this.value = value;
    }

    renderToFormula() {
        return this.value.toString();
    }

    getValue(): number {
        return this.value;
    }
}

function xyToSpreadsheet(x: number, y: number): string {
    if (x < 0 || y < 0) {
        throw new Error("Invalid coordinates");
    }



    // Convert column index to letters
    let letters = "";
    while (y >= 0) {
        const letter = String.fromCharCode(65 + (y % 26));
        letters = letter + letters;
        y = Math.floor(y / 26) - 1;
    }

    return letters + (x + 1);
}

class CellSum implements NodeInterface {
    id: number;
    dependencies: number[];

    constructor(dependencies: number[] = []) {
        id_base += 1;
        this.id = id_base;

        this.dependencies = dependencies;
        for (let dinx in dependencies) {
            // add edge
        }
    }

    getValue(visited: number[], graph: Graph): number {
        if (this.id in visited) {
            throw new Error("Cyclical Graph!");
        }

        let acc = 0;

        let dependants = graph.getNodes(this.dependencies);
        for (let id in dependants) {
            acc += dependants[id].getValue([...visited, this.id], graph);
        }

        return acc;
    }

    renderToFormula(sheet: Sheet): string {
        console.log(this.dependencies.map((x) => { return xyToSpreadsheet(sheet.get_coords(x)[0], sheet.get_coords(x)[1]) }))
        return `SUM(${this.dependencies.map((x) => { return xyToSpreadsheet(sheet.get_coords(x)[0], sheet.get_coords(x)[1]) }).join(", ")})`
    }
}

class CellProd implements NodeInterface {
    id: number;
    dependencies: number[];

    constructor(dependencies: number[] = []) {
        id_base += 1;
        this.id = id_base;

        this.dependencies = dependencies;
        for (let dinx in dependencies) {
            // add edge
        }
    }

    getValue(visited: number[], graph: Graph): number {
        if (this.id in visited) {
            throw new Error("Cyclical Graph!");
        }

        let acc = 1;

        let dependants = graph.getNodes(this.dependencies);
        for (let id in dependants) {
            acc *= dependants[id].getValue([...visited, this.id], graph);
        }

        return acc;
    }

    renderToFormula(sheet: Sheet): string {
        console.log(this.dependencies.map((x) => { return xyToSpreadsheet(sheet.get_coords(x)[0], sheet.get_coords(x)[1]) }))
        return `PROD(${this.dependencies.map((x) => { return xyToSpreadsheet(sheet.get_coords(x)[0], sheet.get_coords(x)[1]) }).join(", ")})`
    }
}

type Edge = {
    source: number;
    end: number;
}

type Nodes = {
    [id: number]: NodeInterface;
};

class Graph {
    nodes: Nodes;
    edges: Edge[];

    constructor() {
        this.nodes = {};
        this.edges = [];
    }

    getNode(id: number): NodeInterface {
        return this.nodes[id]
    }

    getNodeValue(id: number): number {
        return this.nodes[id].getValue([], this);
    }

    getNodes(ids: number[]): NodeInterface[] {
        return ids.map(
            (id: number) => {
                return this.nodes[id];
            }
        )
    }

    addNode(node: NodeInterface): number {
        this.nodes[node.id] = node;
        return node.id;
    }

    getParents(id: number): number[] {
        return this.edges.filter((x) => { return x.end == id }).map((x) => { return x.source })
    }

    getDependants(id: number): number[] {
        return this.edges.filter((x) => { return x.source == id }).map((x) => { return x.end })
    }

    connectNodes(source: number, destination: number) {
        if (this.nodes[source].dependencies) {
            this.nodes[source].dependencies.push(destination)
        }

        this.edges.push({
            source,
            end: destination
        })
    }

    newValue(value: number): number {
        const node = new CellValue(value);
        this.addNode(node);

        return node.id;
    }

    removeNode(id: number) {
        let edges = this.edges.map((x, idx): [Edge, number] => { return [x, idx] }).filter((x, idx) => {
            return (x[0].source == id) || (x[0].end == id)
        });
        let ids = edges.map((x) => {return x[1]})
        this.edges = this.edges.filter((_, idx) => { return !(idx in ids) })

        edges.map((x) => {
            let source = x[0].source;
            let end = x[0].end;

            let node = (source == id) ? end : source;

            this.removeNode(node)
        })
    }
}

class Sheet {
    sheet: (number | null)[][]
    graph: Graph

    constructor(width: number, height: number) {
        this.sheet = [[]];
        for (let y in [...Array(height).keys()]) {
            this.sheet[y] = [];
            for (let x in [...Array(width).keys()]) {
                this.sheet[y][x] = null;
            }
        }

        this.graph = new Graph;
    }

    get_node(x: number, y: number): NodeInterface | null {
        if (!(this.sheet[y][x])) {
            return null
        }

        return this.graph.getNode(this.sheet[y][x]);
    }

    get_coords(id: number): [number, number] {
        for (let y in this.sheet)
            for (let x in this.sheet[y])
                if (this.sheet[y][x] == id) { return [parseInt(x), parseInt(y)] }
        return [-1, -1]
    }

    getParents(id: number): [number, number][] {
        return this.graph.getParents(id).map((x) => { return this.get_coords(x) })
    }

    getDependants(id: number): [number, number][] {
        return this.graph.getDependants(id).map((x) => { return this.get_coords(x) })
    }

    add_node(x: number, y: number, node: NodeInterface): number {
        if (this.sheet[y][x]) {
            node.id = this.sheet[y][x]
            this.graph.addNode(node)
            return node.id
        } else {
            this.graph.addNode(node);
            this.sheet[y][x] = node.id;

            // console.log(this.sheet[y][x])

            return node.id;
        }
    }

    pruneGraph() {
        
    }

    render(): ([number, number] | null)[][] {
        return this.sheet.map((row) => {
            return row.map((cell) => {
                if (cell != null) {
                    return [this.graph.getNodeValue(cell), cell];
                } else {
                    return null
                }
            })
        })
    }
}


export { CellSum, CellValue, Graph, Sheet, CellProd, NodeInterface };
