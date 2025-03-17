import React, { useState } from 'react';
import Automata from "./components/Automata";
import { CellType, RuleType } from "./models/cellModel";
import { compareArrays, emptyArray, generateNewRow, randomArray, randomRule } from "./utils/cellUtils";
import AutomataConfig from "./components/AutomataConfig";
import ConfigRulesSection from "./components/ConfigRulesSection";
import ImportRulesSection from "./components/ImportRulesSection";
import './App.scss';

const defaultNumberOfCells = 31
const defaultNumberOfMaxSteps = 40
const defaultDelay = 50

const App: React.FC = () => {
    const [boardWidth, setBoardWidth] = useState<number>(defaultNumberOfCells);
    const [neighborhood, setNeighborhood] = useState<number>(1);
    const [running, setRunning] = useState<NodeJS.Timeout | undefined>(undefined);
    const [delay, setDelay] = useState<number>(defaultDelay);
    const [iterations, setIteration] = useState<number>(0);
    const [cells, setCells] = useState<CellType[][]>([randomArray(boardWidth)]);
    const [maxNumberSteps, setMaxNumberSteps] = useState<number>(defaultNumberOfMaxSteps);
    const ruleLength = neighborhood * 2 + 1;
    const numberOfRules = Math.pow(2, ruleLength);
    const [rules, setRules] = useState<RuleType[]>(randomRule(numberOfRules));

    React.useEffect(() => {
        setRules(randomRule(numberOfRules))
    }, [numberOfRules])

    React.useEffect(() => {
        setCells([randomArray(boardWidth)])
    }, [boardWidth])

    const initBoard = () => {
        setIteration(0)
        setCells([randomArray(boardWidth)])
    }
    const clear = () => {
        setIteration(0)
        setCells([emptyArray(boardWidth)])
    }

    const nextInterval = React.useCallback(() => {
        if (iterations >= maxNumberSteps) return;
        setIteration((iterations) => {
            return iterations + 1
        })
        setCells((rows) => {
            const newRows = [...rows];
            const generatedNewRow = generateNewRow(rows[rows.length - 1], neighborhood, rules);
            newRows.push(generatedNewRow);
            return newRows;
        })
    }, [maxNumberSteps, neighborhood, rules, iterations]);

    const _setRunning = React.useCallback((isRunning: boolean) => {
        if (running) {
            clearInterval(running);
        }
        if (isRunning) {
            const running = setInterval(nextInterval, delay);
            setRunning(running);
        } else {
            setRunning(undefined);
        }
    }, [running, delay, nextInterval]);


    React.useEffect(() => {
        if (cells.length < 2) return
        if (compareArrays(cells[cells.length - 1], cells[cells.length - 2])) {
            _setRunning(false)
        }
    }, [cells, _setRunning])

    React.useEffect(() => {
        if (iterations >= maxNumberSteps) {
            _setRunning(false)
        }
    }, [iterations, maxNumberSteps, _setRunning])


    
    let startActive = (iterations < maxNumberSteps);
    let stepActive = !running && startActive;
    const actions = (
        <div className="buttons is-centered">
            <div className={"configItem"}>
                {                    
                    running
                        ? <button className="button is-danger" disabled={!startActive} onClick={() => _setRunning(false)}>Stop</button>
                        : <button className="button is-success" disabled={!startActive}  onClick={() => _setRunning(true)}>Start</button>   
                }
            </div>
            <div className={"configItem"}>
                <button className="button is-info" disabled={!stepActive} onClick={nextInterval}>Step</button>
            </div>
            <div className={"configItem"}>
                <button className="button is-info" onClick={initBoard}>Random Init</button>
            </div>
            <div className={"configItem "}>
                <button className="button is-danger" onClick={clear}>Clear</button>
            </div>
        </div>
    )
    const onClick = (cell: CellType, key: number) => {
        if (iterations === 0) {
            const newCell: CellType = { ...cell, active: !cell.active }
            const newRows = [...cells];
            newRows[0][key] = newCell
            setCells(newRows);
        }
    }

    return (
        <div className="App container">
            <div className="header" style={{marginTop: "20px", marginBottom: "20px"}} >
                
                <h1 className="title"><img src="/logo.svg" alt="Logo" style={{ height: "50px", marginRight: "10px", marginBottom: "-15px" }} /> BIN - cellular automata visualization</h1>
            </div>
            <AutomataConfig
                boardWidth={boardWidth}
                delay={delay}
                maxNumberSteps={maxNumberSteps}
                setMaxNumberSteps={setMaxNumberSteps}
                neighborhood={neighborhood}
                setNeighborhood={(value) => {
                    setNeighborhood(value)

                }}
                setBoardWidth={setBoardWidth}
                setDelay={setDelay}
            />
            
            <br/>
            {actions}
            Iteration: <span className="tag is-success">{iterations}</span>
            <br/>
            <br/>
            <div style={{minHeight: "600px"}}>
                {cells.map((row, key) => (
                    <Automata cells={row}
                              key={key}
                              onClick={key === 0 ? onClick : undefined}
                    />
                ))}
            </div>
            <br/>
            <ConfigRulesSection
                ruleLength={ruleLength}
                rules={rules}
                setRules={setRules}
            />
            <ImportRulesSection
                setNeighborhood={setNeighborhood}
                setRules={setRules}
                setBoardWidth={setBoardWidth}
                setMaxNumberSteps={setMaxNumberSteps}
            />


            <div className="note">The visualization tool was developed by Alena Tesařová (xtesar36) as a BIN 2021 project.</div>

        </div>
    );
}

export default App;
