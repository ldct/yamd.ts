/// <reference path="node.d.ts" />

import fs = require('fs');
import reg = require('./constants');

let zeroPad = function (num: number, places: number = 32): string {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

let step = function (state: reg.State): reg.State {
    
    let instruction: number = parseInt(state.memory[state.PC], 2);

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
        return state;
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011001) {
        // return `multu $${s}} $${t}`
        return state;
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011010) {
        // return `div $${s}} $${t}`
        return state;
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011011) {
        // return `divu $${s}} $${t}`
        return state;
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010000) {
        // return `mfhi $${d}}`
        return state;
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010010) {
        // return `mflo $${d}}`
        return state;
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010100) {
        // LIS
        state.registers[d] = state.memory[parseInt(state.PC, 2)]
        return state;
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10001100000000000000000000000000) {
        // return `lw $${t}, ${i}($${s})`
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10101100000000000000000000000000) {
        // return `sw $${t}, ${i}($${s})`
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101010) {
        // return `slt $${d} $${s} $${t}`
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101011) {
        // return `sltu $${d} $${s} $${t}`
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010000000000000000000000000000) {
        // return `beq $${s}} $${t} ${i}`
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010100000000000000000000000000) {
        // return `bne $${s}} $${t} ${i}`
    }
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 === 0b00000000000000000000000000001000) {
        // return `jr $${s}}`
    }
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 === 0b00000000000000000000000000001001) {
        // return `jalr $${s}}`
    }
    else {
        console.log("unknown instruction");
        return state;
    }

}

let execute_file = function (filename: string) {
    fs.readFile(filename, 'utf-8', function (err, res) {
        let instructions: string[] = res.split(', ').map(function (value) {
            return value.replace(/\n/g, '').replace(/\r/g, '');
        });
        var prev_is_lis = false;
        
    });
}

execute_file('mips.mc');

// console.log('﻿00000000000000000010000000010100'.length);

// console.log(decode_execute(0b00000011110001001111000000100010));