const injectionChars = /"|'|;|and|or|;|#/i;

export function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    if (criteria.match(injectionChars)) {
      res.status(400).send()
      return
    }
    //models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`)
        models.sequelize.query(
      "SELECT * FROM Products WHERE ((name LIKE :likePattern OR description LIKE :likePattern) AND deletedAt IS NULL) ORDER BY name",
      {
        replacements: { likePattern: `%${criteria}%` },
        type: models.sequelize.QueryTypes.SELECT // Ensure the returned type is appropriate
      }
    )  
    .then(([products]: any) => {
        const dataString = JSON.stringify(products)
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }
        res.json(utils.queryResultToJson(products))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
