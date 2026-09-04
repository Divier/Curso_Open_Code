# Revisión Weather CLI

- [x] **Colores:** implementada la paleta — cyan (menú/prompts), amarillo (temp), verde (ok), rojo (error) — en `src/colors.ts`, con soporte de `NO_COLOR`.
- [ ] **AGENTS.md:** dice que `index.ts` es stub, pero la app ya funciona — hay que actualizarlo.
- [ ] **Ciudades:** geocoding solo trae 1 resultado; nombres ambiguos pueden fallar.
- [ ] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
- [ ] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather-cli/`.
- [ ] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [ ] **Carga:** ¿hay estado de carga en las tareas asíncronas?Por favor, coloca la paleta de colores de acuerdo con el archivo ideas revisión.md. 
- [x] **7 day forecast:** implementada la previsión de 7 días para todas las ciudades (opción 6) — temp máx/mín, condiciones (WMO→es) y probabilidad de lluvia.