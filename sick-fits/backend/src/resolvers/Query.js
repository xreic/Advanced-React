/**
 * forwardTo can be used when the query is exact same on Yoga and Prisma
 * However, there is no custom logic
 *    no auth, etc
 *
 */
const { forwardTo } = require('prisma-binding');

const Query = {
  items: forwardTo('db')

  // items: async (parent, args, ctx, info) => {
  //   const items = await ctx.db.query.items();
  //   return items;
  // }
};

module.exports = Query;
