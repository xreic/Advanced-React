// Dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util'); // Node library that takes callback based functions and returns promise based functions

// Helpers
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

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

    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);

    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some((perm) =>
      ['ADMIN', 'ITEMDELETE'].includes(perm)
    );

    if (!ownsItem && !hasPermissions)
      throw new Error("You don't have permissions to delete this item.");

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
  },

  updatePermissions: async (parent, args, ctx, info) => {
    /**
     * Check if user logged in
     * Query current user
     * Check if current user has perms to adjust perms
     * Update perms
     */

    if (!ctx.request.userId) throw new Error('You must be logged in!');

    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info
    );

    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    /**
     * Use args.userId, instead of ctx.request.userId
     *   Because the updating doesn't have to be the currently logged in user
     * Have to use "set", because permissions is an "enum" type
     */
    return ctx.db.mutation.updateUser(
      {
        where: { id: args.userId },
        data: { permissions: { set: args.permissions } }
      },
      info
    );
  },

  addToCart: async (parent, args, ctx, info) => {
    const { userId } = ctx.request;
    if (!userId) throw new Error('You must be logged in!');

    const [exisitngCartItem] = await ctx.db.query.cartItems(
      {
        where: { user: { id: userId }, item: { id: args.id } }
      },
      info
    );

    if (exisitngCartItem) {
      return ctx.db.mutation.updateCartItem({
        where: { id: exisitngCartItem.id },
        data: { quantity: exisitngCartItem.quantity + 1 }
      });
    } else {
      return ctx.db.mutation.createCartItem(
        {
          data: {
            user: { connect: { id: userId } },
            item: { connect: { id: args.id } }
          }
        },
        info
      );
    }
  },

  removeFromCart: async (parent, args, ctx, info) => {
    const cartItem = await ctx.db.query.cartItem(
      { where: { id: args.id } },
      `{ id, user { id } }`
    );

    if (!cartItem) throw new Error('Item not found in cart.');
    if (cartItem.user.id !== ctx.request.userId)
      throw new Error('Hold on there buddy.');

    return ctx.db.mutation.deleteCartItem({ where: { id: cartItem.id } }, info);
  },

  createOrder: async (parent, args, ctx, info) => {
    /**
     * Query the current user and make sure they are signed in
     * Recalculate the total for the price
     *   Users can edit the JS on client-side to send different amount to be charged
     * Create the Stripe charge (token to $$$)
     * Convert cart items to order items
     * Create the order
     * Clear user's cart and delete cart items
     * Return order to user
     */

    const { userId } = ctx.request;
    if (!userId)
      throw new Error('You must be signed in to proceed with checkout.');

    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {
            title
            price
            id
            description
            image
            largeImage
          }
        }
      }`
    );

    const amount = user.cart.reduce(
      (tally, item) => tally + item.item.price * item.quantity,
      0
    );

    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token
    });

    // Copy by value instead of connecting to cement it
    const orderItems = user.cart.map((item) => {
      const orderItem = {
        ...item.item,
        quantity: item.quantity,
        user: { connect: { id: userId } }
      };

      delete orderItem.id;
      return orderItem;
    });

    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    });

    const cartItemIds = user.cart.map((item) => item.id);

    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    });

    return order;
  }
};

module.exports = Mutations;
