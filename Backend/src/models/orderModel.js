import baseLogger from '../utils/logger.js';

const logger = baseLogger.child({ context: 'OrderModel' });

export const getAllOrders = async (conn) => {
    logger.debug('Fetching all orders from the database');
    const sql = 'SELECT * FROM orders';
    const [result] = await conn.execute(sql);
    logger.info(`Fetched ${result.length} orders`);
    return result;
}

export const getOrderById = async (conn, orderId) => {
    logger.debug(`Fetching order with ID: ${orderId}`);
    const sql = 'SELECT * FROM orders WHERE id = ?';
    const [result] = await conn.execute(sql, [orderId]);
    if (result.length === 0) {
        logger.warn(`No order found with ID: ${orderId}`);
        return null;
    }
    logger.info(`Order found: ${JSON.stringify(result[0])}`);
    return result[0];
}

export const createOrder = async (conn, orderData) => {
    logger.debug(`Creating new order with data: ${JSON.stringify(orderData)}`);
    const sql = 'INSERT INTO orders (table_number, customer_name, location, total_amount, payment_method, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await conn.execute(sql, [orderData.table_number, orderData.customer_name, orderData.location, orderData.total_amount, orderData.payment_method, orderData.payment_status, orderData.order_status]);
    logger.info(`Order created with ID: ${result.insertId}`);
    return result.insertId;
}

export const updateOrder = async (conn, orderId, orderData) => {
    logger.debug(`Updating order with ID: ${orderId} with data: ${JSON.stringify(orderData)}`);
    const sql = 'UPDATE orders SET table_number = ?, customer_name = ?, location = ?, total_amount = ?, payment_method = ?, payment_status = ?, order_status = ? WHERE id = ?';
    const [result] = await conn.execute(sql, [orderData.table_number, orderData.customer_name, orderData.location, orderData.total_amount, orderData.payment_method, orderData.payment_status, orderData.order_status, orderId]);
    if (result.affectedRows === 0) {
        logger.warn(`No order found to update with ID: ${orderId}`);
        return false;
    }
    logger.info(`Order with ID: ${orderId} updated successfully`);
    return true;
}

export const deleteOrder = async (conn, orderId) => {
    logger.debug(`Deleting order with ID: ${orderId}`);
    const sql = 'DELETE FROM orders WHERE id = ?';
    const [result] = await conn.execute(sql, [orderId]);
    if (result.affectedRows === 0) {
        logger.warn(`No order found to delete with ID: ${orderId}`);
        return false;
    }
    logger.info(`Order with ID: ${orderId} deleted successfully`);
    return true;
}