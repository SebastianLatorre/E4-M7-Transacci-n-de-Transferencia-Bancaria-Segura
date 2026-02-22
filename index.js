require('dotenv').config();
const { realizarTransferencia } = require('./transferencia');

// Puedes cambiar los valores para probar distintos escenarios
const cuentaOrigenId = 1;
const cuentaDestinoId = 2;
const monto = 100.0;

realizarTransferencia(cuentaOrigenId, cuentaDestinoId, monto)
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error general en la ejecución:', err);
        process.exit(1);
    });
