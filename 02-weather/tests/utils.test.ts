import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { MENU_LINE, WEEKDAYS } from "../src/utils/constants.ts";
import { dayLabel, unitSymbol } from "../src/utils/format.ts";
import { weatherCodeText } from "../src/utils/weather-codes.ts";

const COLORS_URL = pathToFileURL(join(import.meta.dir, "..", "src", "utils", "colors.ts")).href;

function colorsInSubprocess(noColor: boolean): string[] {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) env[key] = value;
  }
  if (noColor) env.NO_COLOR = "1";
  else delete env.NO_COLOR;
  const script = `const c = await import(${JSON.stringify(COLORS_URL)}); process.stdout.write(JSON.stringify([c.cyan("hola"), c.yellow("hola"), c.green("hola"), c.red("hola"), c.bold("hola")]));`;
  const proc = Bun.spawnSync([process.execPath, "-e", script], {
    env,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (proc.exitCode !== 0) {
    throw new Error(`El subprocess de colors falló: ${proc.stderr.toString()}`);
  }
  return JSON.parse(proc.stdout.toString()) as string[];
}

describe("constants", () => {
  it("MENU_LINE es una línea de 40 caracteres ═", () => {
    expect(MENU_LINE).toHaveLength(40);
    expect([...MENU_LINE].every((char) => char === "═")).toBe(true);
  });

  it("WEEKDAYS contiene los 7 días en español empezando en domingo", () => {
    expect(WEEKDAYS).toEqual(["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]);
    expect(WEEKDAYS[0]).toBe("Dom");
    expect(WEEKDAYS[6]).toBe("Sáb");
  });
});

describe("unitSymbol", () => {
  it("devuelve °C para celsius", () => {
    expect(unitSymbol("celsius")).toBe("°C");
  });

  it("devuelve °F para fahrenheit", () => {
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("dayLabel", () => {
  it("combina día de la semana y día del mes en UTC", () => {
    expect(dayLabel("2026-09-04")).toBe("Vie 04");
    expect(dayLabel("2026-09-05")).toBe("Sáb 05");
    expect(dayLabel("2026-01-01")).toBe("Jue 01");
    expect(dayLabel("2000-01-01")).toBe("Sáb 01");
    expect(dayLabel("2024-02-29")).toBe("Jue 29");
  });

  it("devuelve ??? para fechas que no se pueden parsear", () => {
    expect(dayLabel("fecha-invalida")).toBe("??? va");
  });
});

describe("weatherCodeText", () => {
  it("traduce códigos WMO conocidos", () => {
    expect(weatherCodeText(0)).toBe("Despejado");
    expect(weatherCodeText(3)).toBe("Nublado");
    expect(weatherCodeText(61)).toBe("Lluvia ligera");
    expect(weatherCodeText(95)).toBe("Tormenta");
    expect(weatherCodeText(99)).toBe("Tormenta con granizo fuerte");
  });

  it("devuelve Desconocido para códigos fuera de la tabla", () => {
    expect(weatherCodeText(42)).toBe("Desconocido");
    expect(weatherCodeText(200)).toBe("Desconocido");
  });
});

describe("colors", () => {
  it("envuelve el texto en códigos ANSI cuando NO_COLOR no está definido", () => {
    const [cyan, yellow, green, red, bold] = colorsInSubprocess(false);
    expect(cyan).toBe("\x1b[36mhola\x1b[0m");
    expect(yellow).toBe("\x1b[33mhola\x1b[0m");
    expect(green).toBe("\x1b[32mhola\x1b[0m");
    expect(red).toBe("\x1b[31mhola\x1b[0m");
    expect(bold).toBe("\x1b[1mhola\x1b[0m");
  });

  it("devuelve el texto plano cuando NO_COLOR está definido", () => {
    for (const color of colorsInSubprocess(true)) {
      expect(color).toBe("hola");
    }
  });
});
