/// <reference path="node.d.ts" />

import fs = require('fs');

let decode = function (instruction: number, prev_is_lis = false): string {

    let d = (instruction >> 11) & 0b11111
    let s = (instruction >> 21) & 0b11111
    let t = (instruction >> 16) & 0b11111

    var i = instruction & 0b1111111111111111

    if (i & 0x8000) {
        i -= 0x10000
    }

    if (prev_is_lis) {
        return instruction.toString(); // return numerical value of inst
    }

    if ((instruction & 0b11111100000000000000011111111111) >>> 0 == 0b00000000000000000000000000100000) {
        return `add $${d} $${s} $${t}`
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000100010) {
        return `sub $${d} $${s} $${t}`
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011000) {
        return `mult $${s}} $${t}`
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011001) {
        return `multu $${s}} $${t}`
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011010) {
        return `div $${s}} $${t}`
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011011) {
        return `divu $${s}} $${t}`
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010000) {
        return `mfhi $${d}}`
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010010) {
        return `mflo $${d}}`
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010100) {
        return `lis $${d}}`
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10001100000000000000000000000000) {
        return `lw $${t}, ${i}($${s})`
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10101100000000000000000000000000) {
        return `sw $${t}, ${i}($${s})`
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101010) {
        return `slt $${d} $${s} $${t}`
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101011) {
        return `sltu $${d} $${s} $${t}`
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010000000000000000000000000000) {
        return `beq $${s}} $${t} ${i}`
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010100000000000000000000000000) {
        return `bne $${s}} $${t} ${i}`
    }
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 === 0b00000000000000000000000000001000) {
        return `jr $${s}}`
    }
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 === 0b00000000000000000000000000001001) {
        return `jalr $${s}}`
    }
    else {
        return "unknown instruction";
    }

}

let decode_file = function (filename:string) {
    fs.readFile(filename, 'utf-8', function (err, res) {
        let instructions: string[] = res.split(', ').map(function (value) {
            return value.replace(/\n/g, '').replace(/\r/g, '');
        });
        var prev_is_lis = false;
        for (var i = 0; i < instructions.length; i++) {
            let instruction = instructions[i];
            let instruction_str: string = decode(parseInt(instruction, 2), prev_is_lis);
            if (instruction_str.indexOf("lis") === 0) {
                prev_is_lis = true;
            } else {
                prev_is_lis = false;
            }
            console.log(instruction_str);
        }
    });
}

decode_file('VarAccessN=2.mc');

// console.log('﻿00000000000000000010000000010100'.length);

// console.log(decode_execute(0b00000011110001001111000000100010));