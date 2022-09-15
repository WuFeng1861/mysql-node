var mysql = require('mysql');

/*
 * 创建连接池。
 */
const pool = mysql.createPool({
    connectionLimit: 200,
    acquireTimeout: 2000,
    host: 'localhost',
    user: 'root',
    // password: 'root',
    password: '666666',
    port: '3306',
    database: 'chatdb'
});
pool.on('connection', (connection) => {
    //logger.info("connection!");
});

pool.on('enqueue', () => {
    //logger.info('Waiting for available connection slot');
});

module.exports.Pool = pool;

module.exports.getConnection = (cb) => {
    if (typeof cb == "function") {
        pool.getConnection(function (err, connection) {
            cb(err, connection);
        });
    } else {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        });
    }
};
module.exports.exec = (sql, values, cb) => {
    if (typeof cb == "function") {
        pool.getConnection((err, connection) => {
            if (err) {
                pool.releaseConnection(connection) //connection && connection.release()
                cb(err);
            } else {
                connection.query(sql, values, (error, rows) => {
                    pool.releaseConnection(connection) //connection && connection.release()
                    cb(error, rows);
                });
            }
        });
    } else {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    pool.releaseConnection(connection) //connection && connection.release()
                    reject(err);
                } else {
                    connection.query(sql, values, (error, rows) => {
                        pool.releaseConnection(connection) //connection && connection.release()
                        if (error)
                            reject(error);
                        else
                            resolve(rows);
                    });
                }
            });
        });
    }
};
module.exports.beginTransaction = (connection, cb) => {
    if (typeof cb == "function") {
        connection.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            cb(null, connection);
        });
    } else {
        return new Promise((resolve, reject) => {
            connection.beginTransaction(function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        });
    }
};
module.exports.rollback = (connection, cb) => {
    if (typeof cb == "function") {
        connection.rollback(function () {
            pool.releaseConnection(connection) //connection && connection.release()
            cb && cb();
        });
    } else {
        return new Promise((resolve, reject) => {
            connection.rollback(function (err) {
                pool.releaseConnection(connection) //connection && connection.release()
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};
module.exports.commit = (connection, cb) => {
    if (typeof cb == "function") {
        connection.commit(function (err) {
            if (err) {
                connection.rollback(function () {
                    cb && cb(err);
                    throw err;
                });
            }
            pool.releaseConnection(connection) //connection && connection.release()
            cb && cb();
        });
    } else {
        return new Promise((resolve, reject) => {
            connection.commit(function (err) {
                if (err) {
                    connection.rollback(function () {
                        reject(err);
                    });
                }
                pool.releaseConnection(connection) //connection && connection.release()
                resolve();
            });
        });
    }
};
//自己添加的关闭连接
module.exports.poolReleaseConn = (connection) => {

    return pool.releaseConnection(connection) //connection && connection.release()
};

//检查是否链接失败
this.getConnection((err, connection) => {
    if (err) throw err;
    else {
        // logger.info("connected success!");
        pool.releaseConnection(connection) //connection && connection.release()
    }
});

/**
 * 带事务
 * @param sql
 * @param values
 * @returns {Promise}
 */
module.exports.exec2 = (connection, sql, values, cb) => {
    if (typeof cb == "function") {
        connection.query(sql, values, (error, rows) => {
            cb(error, rows);
        });
    } else {
        return new Promise((resolve, reject) => {
            connection.query(sql, values, (error, rows) => {
                if (error)
                    reject(error);
                else
                    resolve(rows);
            });
        });
    }
};
