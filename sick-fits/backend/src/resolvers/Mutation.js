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

    const item = await ctx.db.mutation.createItem(
      {
        data: { ...args }
      },
      info
    );

    return item;
  }
};

module.exports = Mutations;
