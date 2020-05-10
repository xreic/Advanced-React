/**
 * forwardTo can be used when the query is exact same on Yoga and Prisma
 * However, there is no custom logic
 *    no auth, etc
 *
 */
const { forwardTo } = require('prisma-binding');

// Helpers
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),

  item: forwardTo('db'),

  itemsConnection: forwardTo('db'),

  me: (parent, args, ctx, info) => {
    if (!ctx.request.userId) return null;

    return ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
  },

  users: async (parent, args, ctx, info) => {
    if (!ctx.request.userId) throw new Error('You must be logged in!');

    // Function will throw an error, if the user does not have the required permissions
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

    // This will only return when the throw does not occur
    return ctx.db.query.users({}, info);
  },

  order: async (parent, args, ctx, info) => {
    if (!ctx.request.userId) throw new Error('You must be logged in!');

    const order = await ctx.db.query.order({ where: { id: args.id } }, info);

    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN'
    );

    if (!ownsOrder || !hasPermissionToSeeOrder)
      throw new Error('Hold on there pal.');

    return order;
  }
};

module.exports = Query;
