// Dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util'); // Node library that takes callback based functions and returns promise based functions

// Helpers
const { transport, makeANiceEmail } = require('../mail');

const Mutations = {
  createItem: async (parent, args, ctx, info) => {
    if (!ctx.request.userId)
      throw new Error('You must be logged in to sell an item!');

    /**
     * ctx comes from createServer context
     * ctx contains all things inside the request and the database connection
     * DB connection automatically has all the methods inside prisma.graphql
     * can instead import the db, instead of passing it into the context
     * passing "info" as the second argument will make sure the item being created
     *   is returned from the database
     */

    const item = ctx.db.mutation.createItem(
      { data: { user: { connect: { id: ctx.request.userId } }, ...args } },
      info
    );

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
  },

  signout: (parent, args, ctx, info) => {
    ctx.response.clearCookie('token');
    return { message: 'Leave!' };
  },

  requestReset: async (parent, args, ctx, info) => {
    /**
     * Check if user exists
     * Set a reset token and expiry on user
     * Email reset token
     */

    const user = await ctx.db.query.user({
      where: { email: args.email }
    });
    if (!user) throw new Error(`No such user found for email: ${args.email}`);

    // promisify takes a function and returns another function
    // take not of syntax
    const resetToken = (await promisify(randomBytes)(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    await transport.sendMail({
      from: 'Admin@ThisSite.com',
      to: user.email,
      subject: 'Your Password Reset Link',
      html: makeANiceEmail(
        `Your Password Reset Token is here! \n\n <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Link</a>`
      )
    });

    return { message: "Check 'em" };
  },

  resetPassword: async (parent, args, ctx, info) => {
    /**
     * Check if the passwords match
     * Check if legit reset token
     * Check if expired
     * Hash new password
     * Save new password to user
     * Clear user reset token fields
     * Generate new JWT
     * Set JWT cookie
     * Return new user
     */

    if (args.password !== args.confirmPassword)
      throw new Error('Passwords are not matching!');

    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) throw new Error('Reset token is either invalid or expired');

    const password = await bcrypt.hash(args.password, 10);
    // prettier-ignore
    const updatedUser = await ctx.db.mutation.updateUser({
        where: { email: user.email },
        data: { password, resetToken: null, resetTokenExpiry: null }
      },
      info
    );

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });

    return updatedUser;
  }
};

module.exports = Mutations;
