import mysql from "mysql2/promise";
import {hotshot} from "./hotshot.js";
import {getNewHotshot} from "./methods.js";

const dbConfig = {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
}

const hotshot_table_name = 'hotshot_table_new'

export const pool = mysql.createPool({...dbConfig, waitForConnections: true})

export const SQL_INSERT_STATEMENT = `
    INSERT INTO ${hotshot_table_name} (sku, omnibus, old, current, amount, name, image, start, end)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM ${hotshot_table_name} WHERE sku = ? AND start = ?)
`
export const SQL_GET_TOTAL_ITEM_COUNT = `SELECT COUNT(*) AS total_count FROM ${hotshot_table_name}`
export const SQL_GET_PAGINATED_ITEMS = `SELECT * FROM ${hotshot_table_name} ORDER BY start DESC LIMIT ? OFFSET ?`

export const insertIntoDatabase = async () => {
    if (hotshot.sku === null || hotshot.sku === 0) {
        await getNewHotshot()
    }

    try {
        const [results] = await pool.query(SQL_INSERT_STATEMENT,
            [hotshot.sku, hotshot.prices.omnibus, hotshot.prices.old, hotshot.prices.current, hotshot.amount, hotshot.name, hotshot.image, hotshot.start, hotshot.end, hotshot.sku, hotshot.start]
        )

        if (results.affectedRows === 0) {
            return 'Ten gorący strzał znajduje się już w bazie danych.'
        } else {
            return 'Gorący strzał został dodany do bazy danych.'
        }
    } catch (error) {
        return error
    }
}

export const getHotshotsPaginated = async (offset, itemsPerPage) => {
    try {
        const [results] = await pool.query(SQL_GET_PAGINATED_ITEMS,
            [itemsPerPage, offset]
        )

        if (results.affectedRows === 0) {
            console.warn('Ten gorący strzał znajduje się już w bazie danych.')
        } else {
            return results
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getTotalHotshotsAmount = async () => {
    try {
        const [results] = await pool.query(SQL_GET_TOTAL_ITEM_COUNT)

        return results[0].total_count

    } catch (error) {
        console.log(error)
        throw error
    }
}