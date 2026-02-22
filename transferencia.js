require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
        rejectUnauthorized: false,
    },
});

/**
 * Realiza una transferencia bancaria segura entre dos cuentas.
 * @param {number} cuentaOrigenId - ID de la cuenta origen
 * @param {number} cuentaDestinoId - ID de la cuenta destino
 * @param {number} monto - Monto a transferir
 */
async function realizarTransferencia(cuentaOrigenId, cuentaDestinoId, monto) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Restar saldo a la cuenta de origen
        const resOrigen = await client.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2 RETURNING saldo', [monto, cuentaOrigenId]);
        if (resOrigen.rowCount === 0) throw new Error('Cuenta origen no encontrada');
        if (resOrigen.rows[0].saldo < 0) throw new Error('Saldo insuficiente en la cuenta de origen');

        // Sumar saldo a la cuenta de destino
        const resDestino = await client.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo', [monto, cuentaDestinoId]);
        if (resDestino.rowCount === 0) throw new Error('Cuenta destino no encontrada');

        await client.query('COMMIT');
        console.log('Transferencia realizada con éxito.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en la transferencia, transacción revertida:', error.message);
        console.error(error); // Mostrar el error completo para diagnóstico
    } finally {
        client.release();
    }
}

// Ejemplo de uso
// realizarTransferencia(1, 2, 100.00);
// realizarTransferencia(2, 1, 600.00);

module.exports = { realizarTransferencia, pool };
