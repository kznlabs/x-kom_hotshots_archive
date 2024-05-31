import {JSDOM} from "jsdom"
import {hotshot} from "./hotshot.js";
import {getHotshotsPaginated, getTotalHotshotsAmount} from "./database.js";

const SITE_URL = "https://x-kom.pl/goracy_strzal/"

export const getNewHotshot = async () => {
    await JSDOM.fromURL(SITE_URL, {runScripts: "dangerously"}).then((result) => {
        const regex = /window\.__INITIAL_STATE__\['app'] = .*}/gm

        let html = result.serialize()
        let match = html.match(regex)[0].replace(`window.__INITIAL_STATE__['app'] = `, "")

        let data = JSON.parse(match)['productsLists']['hotShot'][0]
        let extend = data.extend

        hotshot.sku = data.id

        hotshot.prices.omnibus = extend.minPriceInfo.minPrice
        hotshot.prices.old = extend.oldPrice
        hotshot.prices.current = extend.price

        hotshot.amount = extend.promotionTotalCount
        hotshot.name = extend.promotionName
        hotshot.image = extend.promotionPhoto.url
        hotshot.start = extend.promotionStart
        hotshot.end = extend.promotionEnd
    })
}

export const getHotshotsWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const itemsPerPage = parseInt(req.query.items_per_page) || 10
        const offset = (page - 1) * itemsPerPage
        const paginatedData = await getHotshotsPaginated(offset, itemsPerPage)
        const totalCount = await getTotalHotshotsAmount()
        const totalPages = Math.ceil(totalCount / itemsPerPage)

        return {
            data: paginatedData,
            metadata: {
                page,
                itemsPerPage,
                totalPages,
                totalItems: totalCount,
            },
        }
    } catch (error) {
        return `{message: ${error}}`
    }
}

