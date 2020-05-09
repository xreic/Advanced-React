const Mutations = {
  createItem: async (parent, args, ctx, info) => {
    // TODO: Check if they are logged in

    /**
     * ctx comes from createServer context
     * ctx contains all things inside the request and the database connection
     * DB connection automatically has all the methods inside prisma.graphql
     * can instead import the db, instead of passing it into the context
     * passing "info" as the second argument will make sure the item being created
     *   is returned from the database
     */

    const item = ctx.db.mutation.createItem({ data: { ...args } }, info);

    return item;
  },

  updateItem: async (parent, args, ctx, info) => {
    const updates = { ...args };

    /**
     * Automatically given another ID
     * IDs don't change, so remove it
     */

    delete updates.id;

    /**
     * Still use args.id to find the right ID
     * But don't delete, because we need it to
     *   find the right item
     */

    return ctx.db.mutation.updateItem(
      { data: updates, where: { id: args.id } },
      info
    );
  },

  deleteItem: async (parent, args, ctx, info) => {
    const where = { id: args.id };

    const item = await ctx.db.query.item({ where }, `{id title}`);

    // TODO Check if the user owns that item or have permissions to delete 

    return ctx.db.mutation.deleteItem({ where }, info);
  }
};

module.exports = Mutations;
