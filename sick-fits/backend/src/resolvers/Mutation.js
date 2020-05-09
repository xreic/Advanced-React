// Dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  },

  signup: async (parent, args, ctx, info) => {
    args.email = args.email.toLowerCase();

    const password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser(
      { data: { ...args, password, permissions: { set: ['USER'] } } },
      info
    );

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true, // Makes it so that the cookie can only be touched by HTTP (no JS, no addons, etc)
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return user;
  },

  signin: async (parent, { email, password }, ctx, info) => {
    /**
     * Check if a user exists with specified email
     * Check if password hashes correctly for user
     * Generate JWT
     * Set cookie with token
     * Return the user
     */

    const user = await ctx.db.query.user({ where: { email } });
    if (!user) throw new Error(`No such user found for email ${email}`);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid password!');

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true, // Makes it so that the cookie can only be touched by HTTP (no JS, no addons, etc)
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return user;
  }
};

module.exports = Mutations;
