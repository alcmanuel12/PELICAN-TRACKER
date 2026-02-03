// server/data/route.js

// Lista de paradas extraída de tu archivo "RutaAutobusCompleta.json"
// El autobús viajará del índice 0 al 26 interpolando la posición.
const FULL_ROUTE = [
    [37.471176263, -5.641579812], // 0. Puerta de Sevilla
    [37.472620977, -5.638498400], // 1. Plaza de san Fernando (CHECKPOINT INICIO)
    [37.474740347, -5.636476307], // 2. Dolores Quintanilla
    [37.474728788, -5.637672159], // 3. Miraflores de Santa Maria
    [37.476544394, -5.640185723], // 4. Plazuela del higueral
    [37.476525160, -5.642549288], // 5. Santa Ana
    [37.474045639, -5.642596340], // 6. Bernardo Enrique Cerezo
    [37.475674154, -5.645990281], // 7. Hytasa (CHECKPOINT 1)
    [37.476804283, -5.647849022], // 8. Carretera de Guadajoz
    [37.475031821, -5.648510605], // 9. León de San Francisco
    [37.474008465, -5.649880597], // 10. Romero1
    [37.473239426, -5.652744708], // 11. Romero2
    [37.471062667, -5.652448650], // 12. Octavio
    [37.469788945, -5.653491861], // 13. Anfiteatro
    [37.470299941, -5.654496371], // 14. Anfiteatro2
    [37.470004800, -5.656394726], // 15. Tientos
    [37.467062686, -5.656087910], // 16. Cibeles (CHECKPOINT 2)
    [37.464550044, -5.654656540], // 17. Fuente del alamo
    [37.461633532, -5.655678378], // 18. Urbano X
    [37.463465112, -5.652644235], // 19. Ciudad de los niños
    [37.463390063, -5.649295584], // 20. Doctor Villa Diaz
    [37.464276872, -5.646408170], // 21. San Antón (CHECKPOINT 3 - San Bartolomé)
    [37.463405000, -5.644555170], // 22. Almendral
    [37.464906242, -5.644575467], // 23. Alfonso X
    [37.465565852, -5.645822510], // 24. Paseo de San Antón
    [37.467234399, -5.644487215], // 25. Plaza de la constitucion
    [37.470577333, -5.643609766]  // 26. Anfiteatro
];

module.exports = { FULL_ROUTE };