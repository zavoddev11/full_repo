import { getSitedataByWebsiteId, getAllSitedata } from "./../services/sitedata.js";

export const getAllTheSiteDatas = async (req, res, next) => {
    try {
        let id = await req.params.id
        console.log({ id })
        const sitedatas = await getAllSitedata()

        return res.status(200).json(sitedatas);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Failed to Fetch SiteDatas to the database" });
    }
}


export const getSiteDatasById = async (req, res, next) => {
    try {
        let id = await req.params.id
        const sitedatas = await getSitedataByWebsiteId(id)

        return res.status(200).json(sitedatas);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ msg: "Failed to Fetch SiteData to the database" });
    }
}



