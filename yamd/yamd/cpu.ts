/// <reference path="node.d.ts" />

import fs = require('fs');
import reg = require('./constants');

let zeroPad = function (num: number, places: number = 32): string {
    var zero = places - num.toString(2).length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num.toString(2);
}

let step = function (state: reg.State): reg.State {
    
    let instruction: number = parseInt(state.memory[parseInt(state.PC, 2)], 2);

    let d = (instruction >> 11) & 0b11111
    let s = (instruction >> 21) & 0b11111
    let t = (instruction >> 16) & 0b11111

    var i = instruction & 0b1111111111111111

    if (i & 0x8000) {
        i -= 0x10000
    }

    state.PC = zeroPad(parseInt(state.PC, 2) + 4);

    if ((instruction & 0b11111100000000000000011111111111) >>> 0 == 0b00000000000000000000000000100000) {
        // ADD
        let r = state.registers;
        state.registers[d] = zeroPad(parseInt(r[s], 2) + parseInt(r[t], 2));
        return state;
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000100010) {
        // SUB
        let r = state.registers;
        state.registers[d] = zeroPad(parseInt(r[s], 2) - parseInt(r[t], 2));
        return state;
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011000) {
        // return `mult $${s}} $${t}`
        throw "not supported";
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011001) {
        // return `multu $${s}} $${t}`
        throw "not supported";
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011010) {
        // return `div $${s}} $${t}`
        throw "not supported";
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011011) {
        // return `divu $${s}} $${t}`
        throw "not supported";
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010000) {
        // return `mfhi $${d}}`
        throw "not supported";
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010010) {
        // return `mflo $${d}}`
        throw "not supported";
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010100) {
        // LIS
        state.registers[d] = state.memory[parseInt(state.PC, 2)]
        state.PC = zeroPad(parseInt(state.PC, 2) + 4);
        return state;
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10001100000000000000000000000000) {
        // return `lw $${t}, ${i}($${s})`
        state.registers[t] = state.memory[i + parseInt(state.registers[s], 2)];
        return state;
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10101100000000000000000000000000) {
        // return `sw $${t}, ${i}($${s})`
        state.memory[i + parseInt(state.registers[s], 2)] = state.registers[t];
        return state;
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101010) {
        // return `slt $${d} $${s} $${t}`
        throw "not supported";
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101011) {
        // return `sltu $${d} $${s} $${t}`
        throw "not supported";
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010000000000000000000000000000) {
        // return `beq $${s}} $${t} ${i}`
        throw "not supported";
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010100000000000000000000000000) {
        // return `bne $${s}} $${t} ${i}`
        throw "not supported";
    }
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 === 0b00000000000000000000000000001000) {
        // return `jr $${s}}`
        state.PC = state.registers[s];
        return state;
    }
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 === 0b00000000000000000000000000001001) {
        // return `jalr $${s}}`
        let tmp = state.registers[s];
        state.registers[31] = state.PC;
        state.PC = tmp;
        return state;
    }
    else {
        throw "unknown instruction", instruction;
    }

}

let getInitialState = function (input1: number = 1, input2: number = 2, program: string[] = []): reg.State {
    var initialState: reg.State = {
        PC: "00000000000000000000000000000000",
        LO: "00000000000000000000000000000000",
        HI: "00000000000000000000000000000000",
        registers: [],
        memory: {}
    }
    for (var i = 0; i < 30; i++) {
        initialState.registers[i] = "00000000000000000000000000000000";
    }
    initialState.registers[1] = zeroPad(input1);
    initialState.registers[2] = zeroPad(input2);
    initialState.registers[30] = "00000001000000000000000000000000";
    initialState.registers[31] = "11111110111000011101111010101101";


    program.forEach(function (instruction, i) {
        initialState.memory[i * 4] = instruction;
    });

    return initialState;
}



let execute_file = function (filename: string) {
    fs.readFile(filename, 'utf-8', function (err, res) {
        let instructions: string[] = res.split(', ').map(function (value) {
            return value.replace(/\n/g, '').replace(/\r/g, '');
        });
        let state = getInitialState(1, 2, instructions);
        while (state.PC !== reg.terminationPC) {

            let PC_value = parseInt(state.PC, 2) / 4;
            let reg3_value = parseInt(state.registers[3], 2);
            let reg29_value = parseInt(state.registers[29], 2);

            console.log(`PC: ${PC_value} $3: ${reg3_value} $29: ${reg29_value}`);
            state = step(state);
        }
    });
}

execute_file('VarAccessN=2.mc');

// console.log('﻿00000000000000000010000000010100'.length);

// console.log(decode_execute(0b00000011110001001111000000100010));